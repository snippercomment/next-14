  import { db } from "@/lib/firebase";
  import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
  import { NextResponse } from 'next/server';
  import Stripe from 'stripe';

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  export async function POST(request) {
    try {
      const body = await request.json();
      const { products, address, totalAmount, uid, userEmail } = body;
      // Validation
      if (!products || products.length === 0) {
        return NextResponse.json({ error: 'Không có sản phẩm trong giỏ hàng' }, { status: 400 });
      }
      if (!address || !address.fullName || !address.mobile || !address.addressLine1) {
        return NextResponse.json({ error: 'Thông tin địa chỉ không đầy đủ' }, { status: 400 });
      }
      if (!uid) {
        return NextResponse.json({ error: 'User ID không hợp lệ' }, { status: 400 });
      }
      // Tạo checkout ID
      const checkoutId = doc(collection(db, `ids`)).id;
      console.log('Đã tạo ID thanh toán:', checkoutId);

      // SỬA: Tạo line items với metadata productId (không phải product_id)
      const lineItems = products.map(item => {
        const unitAmount = Math.round(item.price);
        if (unitAmount <= 0) {
          throw new Error(`Sản phẩm "${item.title}" có đơn giá không hợp lệ`);
        }
        const productData = {
          name: item.title,
          description: item.shortDescription || "",
          metadata: {
            productId: item.id.toString(), 
          },
        };
        if (item.image && item.image.startsWith('http')) {
          productData.images = [item.image];
        }
        return {
          price_data: {
            currency: 'vnd',
            product_data: productData,
            unit_amount: unitAmount,
          },
          quantity: item.quantity,
        };
      });
      
    
      const metadata = {
        checkoutId: checkoutId,
        uid: uid?.toString() || '',
        user_email: userEmail?.toString() || '',
        address: JSON.stringify(address),
        payment_mode: 'prepaid',
        total_amount_vnd: totalAmount.toString(),
        order_date: new Date().toISOString(),
      };
      
      // Tạo Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/checkout-success?checkout_id=${checkoutId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/checkout-failed?checkout_id=${checkoutId}`,
        customer_email: userEmail || address.email || undefined,
        metadata,
        billing_address_collection: 'auto',
      });
      console.log('Phiên Stripe đã được tạo:', session.id);
      

      const paymentRef = doc(db, `users/${uid}/payments/${checkoutId}`);
      const paymentData = {
        id: checkoutId,
        checkoutId: checkoutId,
        uid: uid,
        status: 'succeeded',
        stripe_session_id: session.id,
        amount: totalAmount,
        currency: 'vnd',
        customer_email: userEmail || address.email || '',
        payment_method: 'prepaid',
        created_at: new Date().toISOString(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        metadata: {
          checkoutId: checkoutId,
          uid: uid,
        },
        line_items: lineItems, // Thêm line_items
      };
      
      await setDoc(paymentRef, paymentData);
      
      // Lưu checkout session vào Firebase với line_items đúng format
      const checkoutRef = doc(db, `users/${uid}/checkout_sessions/${checkoutId}`);
      const checkoutData = {
        id: checkoutId,
        uid: uid,
        payment_method_types: ["card"],
        mode: "payment",
        line_items: lineItems, 
        metadata: metadata,
        success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/checkout-success?checkout_id=${checkoutId}`,
        cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/checkout-failed?checkout_id=${checkoutId}`,
        stripe_session_id: session.id,
        url: session.url,
        status: 'pending',
        payment_status: 'pending',
        total_amount: totalAmount,
        currency: 'vnd',
        customer_email: userEmail || address.email || '',
        shipping_address: address,
        created_at: new Date().toISOString(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      await setDoc(checkoutRef, checkoutData);   
      return NextResponse.json({ 
        url: session.url, 
        checkout_id: checkoutId,
        session_id: session.id
      });
    } catch (error) {
      console.error('Lỗi thanh toán Stripe:', error);
      return NextResponse.json({
        error: error.message || 'Lỗi khi tạo phiên thanh toán',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }, { status: 500 });
    }
  }