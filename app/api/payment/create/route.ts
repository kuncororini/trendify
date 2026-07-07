import { NextRequest, NextResponse } from "next/server";
import midtransClient from "midtrans-client";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    // Cek user sudah login
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { items, customer } = body;

    // Hitung total
    const total = items.reduce(
      (sum: number, item: any) => sum + item.price,
      0
    );

    // Buat order ID unik
    const orderId = `TRD-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    // Simpan order ke database
    for (const item of items) {
      await supabase.from("orders").insert({
        buyer_id:          user.id,
        product_id:        item.id,
        license:           item.license ?? "personal",
        amount:            item.price,
        status:            "pending",
        midtrans_order_id: orderId,
      });
    }

    // Buat Snap token dari Midtrans
    const snap = new midtransClient.Snap({
      isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
      serverKey:    process.env.MIDTRANS_SERVER_KEY!,
    });

    const transaction = await snap.createTransaction({
      transaction_details: {
        order_id:     orderId,
        gross_amount: total,
      },
      item_details: items.map((item: any) => ({
        id:    item.id,
        price: item.price,
        quantity: 1,
        name:  item.title.slice(0, 50),
      })),
      customer_details: {
        first_name: customer.name,
        email:      customer.email,
      },
    });

    return NextResponse.json({
      token:    transaction.token,
      order_id: orderId,
    });

  } catch (error: any) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: error.message ?? "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}