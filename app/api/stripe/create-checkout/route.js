// app/api/stripe/create-checkout/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';



const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { products, address, totalAmount, uid, userEmail } = body;

    console.log('Received data:', { products, address, totalAmount, uid, userEmail });

    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'Không có sản phẩm trong giỏ hàng' }, { status: 400 });
    }

    if (!address || !address.fullName || !address.mobile || !address.addressLine1) {
      return NextResponse.json({ error: 'Thông tin địa chỉ không đầy đủ' }, { status: 400 });
    }

    const exchangeRate = 24000;
    const usdAmount = Math.round(totalAmount / exchangeRate * 100);

    const lineItems = products.map(item => {
      const unitAmount = Math.round((item.price / exchangeRate) * 100);

      if (unitAmount <= 0) {
        throw new Error(`Sản phẩm "${item.title}" có đơn giá không hợp lệ`);
      }

      const productData = {
        name: item.title,
        metadata: {
          product_id: item.id.toString(),
        },
      };

      if (item.image && item.image.startsWith('http')) {
        productData.images = [item.image];
      }

      return {
        price_data: {
          currency: 'usd',
          product_data: productData,
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });

    const metadata = {
      uid: uid?.toString() || '',
      user_email: userEmail?.toString() || '',
      full_name: address.fullName.toString(),
      mobile: address.mobile.toString(),
      email: address.email?.toString() || '',
      address_line_1: address.addressLine1.toString(),
      address_line_2: address.addressLine2?.toString() || '',
      pincode: address.pincode?.toString() || '',
      city: address.city?.toString() || '',
      state: address.state?.toString() || '',
      order_note: address.orderNote?.toString() || '',
      payment_mode: 'prepaid',
      total_amount_vnd: totalAmount.toString(),
      total_amount_usd: usdAmount.toString(),
      exchange_rate: exchangeRate.toString(),
      order_date: new Date().toISOString(),
    };

    console.log('Creating Stripe session...', { lineItems, metadata });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/order-success?session_id={CHECKOUT_SESSION_ID}&payment_mode=prepaid`,
      cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/checkout?canceled=true`,
      customer_email: userEmail || address.email || undefined,
      metadata,
      billing_address_collection: 'auto',
     
    });

    console.log('Stripe session created:', session.id);

    return NextResponse.json({ url: session.url, session_id: session.id });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({
      error: error.message || 'Lỗi khi tạo phiên thanh toán',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
