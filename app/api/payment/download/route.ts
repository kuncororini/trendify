import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = request.nextUrl.searchParams.get("order_id");
    if (!orderId) {
      return NextResponse.json({ error: "order_id required" }, { status: 400 });
    }

    // Cek order milik user ini dan statusnya paid
    const { data: order, error } = await supabase
      .from("orders")
      .select("id, status, buyer_id, products ( file_url )")
      .eq("id", orderId)
      .eq("buyer_id", user.id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
    }

    if (order.status !== "paid") {
      return NextResponse.json({ error: "Pembayaran belum selesai" }, { status: 403 });
    }

    const fileUrl = (order.products as any)?.file_url;
    if (!fileUrl) {
      return NextResponse.json({ error: "File tidak tersedia" }, { status: 404 });
    }

    // Generate signed URL berlaku 60 menit
    const { data: signedData, error: signedError } = await supabase.storage
      .from("artworks")
      .createSignedUrl(fileUrl, 3600);

    if (signedError || !signedData) {
      return NextResponse.json({ error: "Gagal generate download link" }, { status: 500 });
    }

    return NextResponse.json({ url: signedData.signedUrl });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}