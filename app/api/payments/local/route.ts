import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const plan = formData.get("plan") as string;
    const receipt = formData.get("receipt") as File;

    // Basic validation
    if (!email || !plan || !receipt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Here you would:
    // 1. Validate the user exists
    // 2. Store the receipt file
    // 3. Create a payment record
    // 4. Send notification for manual verification

    return NextResponse.json({
      success: true,
      message: "Payment submitted for verification",
    });
  } catch (error) {
    console.error("Local payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}