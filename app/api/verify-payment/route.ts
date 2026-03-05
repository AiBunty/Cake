import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { markOrderPaid } from "@/lib/api";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (
      !order_id ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { error: "Missing required payment parameters" },
        { status: 400 }
      );
    }

    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "Razorpay secret not configured" },
        { status: 500 }
      );
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      console.error("Payment signature verification failed");
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Mark order as paid in Google Sheets via Apps Script
    const paymentData = {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    };

    const appsScriptResponse = await markOrderPaid(paymentData);

    if (!appsScriptResponse.ok) {
      console.error("Apps Script error:", appsScriptResponse.error);
      return NextResponse.json(
        {
          error: "Failed to update order status",
          details: appsScriptResponse.error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and order updated",
      data: appsScriptResponse.data,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
