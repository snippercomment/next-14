import { adminDB, admin } from "@/lib/firebase_admin";
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  const sig = request.headers.get('stripe-signature');
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe signature' }, { status: 400 });
  }

  let event;
  const body = await request.text();

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook verification failed:', err.message);
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'payment_intent.succeeded':
        break;
      default:
    }
    
    return NextResponse.json({ 
      received: true, 
      event_type: event.type,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ 
      error: 'Webhook processing failed', 
      details: error.message 
    }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session) {
  const { checkoutId, uid } = session.metadata || {};
  
  if (!checkoutId || !uid) {
    console.error('Missing required metadata:', session.metadata);
    throw new Error('Missing checkoutId or uid in session metadata');
  }

  try {
    await updateCheckoutSession(session, uid, checkoutId);
    await createPaymentRecord(session, uid, checkoutId);
    await createOrderAndUpdateInventory(session, uid, checkoutId);
  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error);
    throw error;
  }
}

async function updateCheckoutSession(session, uid, checkoutId) {
  const checkoutRef = adminDB.doc(`users/${uid}/checkout_sessions/${checkoutId}`);
  
  await checkoutRef.set({
    status: 'completed',
    payment_status: 'paid',
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent,
    amount_total: session.amount_total,
    customer_email: session.customer_email,
    updated_at: new Date().toISOString(),
    updatedAt: admin.firestore.Timestamp.now(),
  }, { merge: true });
}

async function createPaymentRecord(session, uid, checkoutId) {
  const checkoutRef = adminDB.doc(`users/${uid}/checkout_sessions/${checkoutId}`);
  const checkoutSnapshot = await checkoutRef.get();
  const checkoutData = checkoutSnapshot.data();

  if (!checkoutData) {
    throw new Error(`Checkout session not found: ${checkoutId}`);
  }

  const paymentRef = adminDB.doc(`users/${uid}/payments/${checkoutId}`);
  
  const paymentData = {
    id: checkoutId,
    checkoutId: checkoutId,
    uid: uid,
    status: 'succeeded',
    
    stripe_session_id: session.id,
    stripe_payment_intent: session.payment_intent,
    
    amount: session.amount_total,
    amount_total: session.amount_total,
    currency: session.currency || 'vnd',
    
    customer_email: session.customer_email,
    
    payment_status: 'completed',
    payment_method: 'card',
    payment_method_types: ["card"],
    mode: "payment",
    
    metadata: {
      checkoutId: checkoutId,
      uid: uid,
      user_email: session.metadata.user_email || session.customer_email,
      address: session.metadata.address || '',
      payment_mode: session.metadata.payment_mode || 'prepaid',
      total_amount_vnd: session.metadata.total_amount_vnd || session.amount_total?.toString(),
      order_date: session.metadata.order_date || new Date().toISOString(),
    },
    
    shipping_address: checkoutData.shipping_address || null,
    line_items: checkoutData.line_items || [],
    success_url: checkoutData.success_url || `${process.env.NEXT_PUBLIC_DOMAIN}/checkout-success?checkout_id=${checkoutId}`,
    cancel_url: checkoutData.cancel_url || `${process.env.NEXT_PUBLIC_DOMAIN}/checkout-failed?checkout_id=${checkoutId}`,
    
    created_at: checkoutData.created_at || new Date().toISOString(),
    createdAt: checkoutData.createdAt || admin.firestore.Timestamp.now(),
    updated_at: new Date().toISOString(),
    updatedAt: admin.firestore.Timestamp.now(),
  };

  await paymentRef.set(paymentData);
  
  return { paymentData, checkoutData };
}

async function createOrderAndUpdateInventory(session, uid, checkoutId) {
  const orderRef = adminDB.doc(`orders/${checkoutId}`);
  const orderDoc = await orderRef.get();
  
  if (orderDoc.exists) {
    return;
  }

  const checkoutRef = adminDB.doc(`users/${uid}/checkout_sessions/${checkoutId}`);
  const paymentRef = adminDB.doc(`users/${uid}/payments/${checkoutId}`);
  
  const [checkoutSnapshot, paymentSnapshot] = await Promise.all([
    checkoutRef.get(),
    paymentRef.get()
  ]);

  const checkoutData = checkoutSnapshot.data();
  const paymentData = paymentSnapshot.data();

  if (!checkoutData || !paymentData) {
    throw new Error('Missing checkout or payment data for order creation');
  }

  const orderData = {
    id: checkoutId,
    uid: uid,
    paymentMode: "prepaid",
    status: "confirmed",
    
    customer_email: session.customer_email,
    shipping_address: checkoutData.shipping_address,
    total_amount: session.amount_total,
    currency: session.currency || 'vnd',
    
    line_items: checkoutData.line_items || [],
    
    checkout: checkoutData,
    
    // ✅ THÊM: Tạo cấu trúc payment nhỏ gọn cho aggregate
    payment: {
      id: checkoutId,
      amount: session.amount_total,
      amount_total: session.amount_total,
      currency: session.currency || 'vnd',
      status: 'succeeded',
      payment_method: 'card',
      payment_status: 'completed',
      created_at: new Date().toISOString(),
      metadata: {
        checkoutId: checkoutId,
        uid: uid,
        payment_mode: 'prepaid',
      }
    },
    
    timestampCreate: admin.firestore.Timestamp.now(),
    created_at: new Date().toISOString(),
  };

  await orderRef.set(orderData);

  // Cập nhật inventory và cart
  await updateInventoryAndCart(checkoutData.line_items, uid);
}

async function updateInventoryAndCart(lineItems, uid) {
  if (!lineItems || lineItems.length === 0) {
    console.log('No lineItems to process');
    return;
  }

  const productList = lineItems.map(item => ({
    productId: item?.price_data?.product_data?.metadata?.productId,
    quantity: item?.quantity || 1,
    name: item?.price_data?.product_data?.name,
    unit_amount: item?.price_data?.unit_amount,
  })).filter(item => item.productId);

  if (productList.length === 0) {
    console.log('No valid products found in lineItems');
    return;
  }

  console.log('Processing products:', productList);

  const productIds = productList.map(item => item.productId);

  try {
    // Cập nhật cart của user - xóa các sản phẩm đã mua
    const userRef = adminDB.doc(`users/${uid}`);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    
    if (userData?.carts && userData.carts.length > 0) {
      console.log('Current cart before filter:', userData.carts);
      console.log('ProductIds to remove:', productIds);
      
      const updatedCarts = userData.carts.filter(cartItem => {
        const shouldKeep = !productIds.includes(cartItem?.id?.toString()) && 
                          !productIds.includes(cartItem?.productId?.toString());
        console.log(`Cart item ${cartItem?.id} - Keep: ${shouldKeep}`);
        return shouldKeep;
      });
      
      console.log('Updated cart after filter:', updatedCarts);
      
      await userRef.set({ carts: updatedCarts }, { merge: true });
      console.log('Cart updated successfully');
    } else {
      console.log('User has no cart items');
    }

    // Cập nhật inventory
    const batch = adminDB.batch();
    productList.forEach(item => {
      if (item.productId) {
        const productRef = adminDB.doc(`products/${item.productId}`);
        batch.update(productRef, {
          orders: admin.firestore.FieldValue.increment(item.quantity),
          lastOrderDate: admin.firestore.Timestamp.now()
        });
      }
    });
    
    await batch.commit();
    console.log('Inventory updated successfully');
    
  } catch (error) {
    console.error('Error updating inventory and cart:', error);
    throw error;
  }
}