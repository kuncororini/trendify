import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, transaction_status, fraud_status } = body;

    const supabase = await createServerSupabaseClient();

    // Tentukan status order
    let status = "pending";

    if (transaction_status === "capture" && fraud_status === "accept") {
      status = "paid";
    } else if (transaction_status === "settlement") {
      status = "paid";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      status = "failed";
    }

    // Update status order di database
    await supabase
      .from("orders")
      .update({ status })
      .eq("midtrans_order_id", order_id);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}