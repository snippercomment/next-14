import { db } from "@/lib/firebase";
import { collection, doc, setDoc, Timestamp, updateDoc, getDoc } from "firebase/firestore";

export const createPaymentIntentCheckout = async (orderData) => {
  const res = await fetch("/api/stripe/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Không thể tạo phiên thanh toán");
  }

  const { url } = await res.json();
  return url;
};

export const createCheckoutCODAndGetId = async ({ uid, products, address }) => {
  const checkoutId = `cod_${doc(collection(db, `ids`)).id}`;
  let line_items = [];
  products.forEach((item) => {
    line_items.push({
      price_data: {
        currency: "vnd",
        product_data: {
          name: item?.product?.title ?? "",
          description: item?.product?.shortDescription ?? "",
          images: [
            item?.product?.featureImageURL ??
              `${process.env.NEXT_PUBLIC_DOMAIN}/logo.png`,
          ],
          metadata: {
            productId: item?.product?.id?.toString(),
          },
        },
        unit_amount: item?.product?.salePrice,
      },
      quantity: item?.quantity ?? 1,
    });
  });

  // Tính tổng tiền
  const totalAmount = line_items.reduce((sum, item) => {
    return sum + (item.price_data.unit_amount * item.quantity);
  }, 0);

  // Lưu vào checkout_sessions_cod
  const checkoutRef = doc(db, `users/${uid}/checkout_sessions_cod/${checkoutId}`);
  await setDoc(checkoutRef, {
    id: checkoutId,
    line_items: line_items,
    metadata: {
      checkoutId: checkoutId,
      uid: uid,
      address: JSON.stringify(address),
    },
    createdAt: Timestamp.now(),
  });

  // ✅ THÊM: Tạo payment record cho COD giống như Stripe
  const paymentRef = doc(db, `users/${uid}/payments/${checkoutId}`);
  await setDoc(paymentRef, {
    id: checkoutId,
    checkoutId: checkoutId,
    uid: uid,
    status: 'pending', // COD bắt đầu là pending
    
    // ✅ QUAN TRỌNG: Thêm amount để có thể aggregate
    amount: totalAmount,
    amount_total: totalAmount,
    currency: 'vnd',
    
    customer_email: address.email,
    
    payment_status: 'pending', // COD chưa thanh toán
    payment_method: 'cod',
    payment_method_types: ["cod"],
    mode: "payment",
    
    metadata: {
      checkoutId: checkoutId,
      uid: uid,
      user_email: address.email,
      address: JSON.stringify(address),
      payment_mode: 'cod',
      total_amount_vnd: totalAmount.toString(),
      order_date: new Date().toISOString(),
    },
    
    shipping_address: {
      fullName: address.fullName,
      mobile: address.mobile,
      email: address.email,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      pincode: address.pincode || '',
      city: address.city || '',
      state: address.state || '',
      orderNote: address.orderNote || '',
    },
    line_items: line_items,
    
    created_at: new Date().toISOString(),
    createdAt: Timestamp.now(),
    updated_at: new Date().toISOString(),
    updatedAt: Timestamp.now(),
  });

  // Tạo order trong collection orders
  const orderRef = doc(db, `orders/${checkoutId}`);
  await setDoc(orderRef, {
    id: checkoutId,
    uid: uid,
    line_items: line_items,
    total_amount: totalAmount,
    currency: 'vnd',
    customer: {
      email: address.email,
      name: address.fullName,
      phone: address.mobile,
    },
    customer_email: address.email, 
    shipping_address: {
      fullName: address.fullName,
      mobile: address.mobile,
      email: address.email,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      pincode: address.pincode || '',
      city: address.city || '',
      state: address.state || '',
      orderNote: address.orderNote || '',
    },
    status: 'pending',              
    payment_status: 'pending',     
    payment_method: 'cod',
    paymentMode: 'cod',
    order_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    createdAt: Timestamp.now(),
    timestampCreate: Timestamp.now(),
    
    // ✅ THÊM: Tạo cấu trúc payment giống Stripe để có thể aggregate
    payment: {
      id: checkoutId,
      amount: totalAmount,
      amount_total: totalAmount,
      currency: 'vnd',
      status: 'pending',
      payment_method: 'cod',
      payment_status: 'pending',
      created_at: new Date().toISOString(),
      metadata: {
        checkoutId: checkoutId,
        uid: uid,
        payment_mode: 'cod',
      }
    }
  });

  // Tạo bản sao trong user orders
  const userOrderRef = doc(db, `users/${uid}/orders/${checkoutId}`);
  await setDoc(userOrderRef, {
    id: checkoutId,
    uid: uid,
    line_items: line_items,
    total_amount: totalAmount,
    currency: 'vnd',
    customer: {
      email: address.email,
      name: address.fullName,
      phone: address.mobile,
    },
    customer_email: address.email,
    shipping_address: {
      fullName: address.fullName,
      mobile: address.mobile,
      email: address.email,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      pincode: address.pincode || '',
      city: address.city || '',
      state: address.state || '',
      orderNote: address.orderNote || '',
    },
    status: 'pending',             
    payment_status: 'pending',     
    payment_method: 'cod',
    order_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    createdAt: Timestamp.now(),
  });

  try {
    const userRef = doc(db, `users/${uid}`);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    if (userData?.carts && userData.carts.length > 0) {
      const purchasedProductIds = products.map(item => item?.product?.id?.toString());
      
      const updatedCarts = userData.carts.filter(cartItem => {
        return !purchasedProductIds.includes(cartItem?.id?.toString());
      });
      
      await updateDoc(userRef, { carts: updatedCarts });
      console.log('COD - Cart updated successfully');
    }
  } catch (error) {
    console.error('COD - Error updating cart:', error);
  }

  return checkoutId;
};

export const updateCODOrderStatus = async (orderId, newStatus) => {
  try {
    const orderRef = doc(db, `orders/${orderId}`);
    const updateData = {
      status: newStatus,
      updated_at: new Date().toISOString(),
      updatedAt: Timestamp.now(),
    };

    // ✅ THÊM: Cập nhật payment status trong order và payment record
    if (newStatus === 'succeeded' || newStatus === 'completed') {
      updateData.payment_status = 'succeeded';
      // Cập nhật payment object trong order
      updateData['payment.status'] = 'succeeded';
      updateData['payment.payment_status'] = 'succeeded';
    }

    await updateDoc(orderRef, updateData);
    
    // ✅ THÊM: Cập nhật payment record riêng biệt
    const orderDoc = await getDoc(orderRef);
    const orderData = orderDoc.data();
    
    if (orderData?.uid) {
      const userOrderRef = doc(db, `users/${orderData.uid}/orders/${orderId}`);
      await updateDoc(userOrderRef, updateData);
      
      // ✅ Cập nhật payment record
      const paymentRef = doc(db, `users/${orderData.uid}/payments/${orderId}`);
      await updateDoc(paymentRef, {
        status: newStatus === 'succeeded' || newStatus === 'completed' ? 'succeeded' : newStatus,
        payment_status: newStatus === 'succeeded' || newStatus === 'completed' ? 'completed' : 'pending',
        updated_at: new Date().toISOString(),
        updatedAt: Timestamp.now(),
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error updating COD order status:', error);
    throw error;
  }
};

export const createCODOrder = async ({ uid, products, address, totalAmount }) => {
  return await createCheckoutCODAndGetId({ uid, products, address });
};

export const validateOrderData = (productList, address, totalPrice) => {
  if (totalPrice <= 0) {
    throw new Error("Giá trị đơn hàng phải lớn hơn 0");
  }
  
  if (!productList?.length) {
    throw new Error("Giỏ hàng trống");
  }
  
  if (!address.fullName || !address.mobile || !address.addressLine1) {
    throw new Error("Vui lòng điền đầy đủ thông tin địa chỉ");
  }
};

export const prepareOrderData = (user, productList, address, totalPrice, paymentMode) => {
  return {
    uid: user?.uid,
    userEmail: user?.email,
    products: productList.map(({ product, quantity }) => ({
      id: product.id,
      title: product.title,
      price: product.salePrice,
      quantity,
      image: product.featureImageURL,
      shortDescription: product.shortDescription || "",
    })),
    address: {
      fullName: address.fullName,
      mobile: address.mobile,
      email: address.email || user?.email || "",
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      pincode: address.pincode || "",
      city: address.city || "",
      state: address.state || "",
      orderNote: address.orderNote || "",
    },
    totalAmount: totalPrice,
    paymentMode,
    currency: "VND",
  };
};