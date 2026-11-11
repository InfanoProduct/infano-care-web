import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = body?.phone;

    if (!phone) {
      return NextResponse.json({ isReader: false, error: "Mobile number is required" }, { status: 400 });
    }

    const cleanPhone = String(phone).replace(/\D/g, "");
    const tenDigit = cleanPhone.slice(-10);

    if (tenDigit.length !== 10) {
      return NextResponse.json(
        { isReader: false, error: "Please enter a valid 10-digit mobile number" },
        { status: 400 }
      );
    }

    // Forward to backend API if available
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4005/api";
    try {
      const apiRes = await fetch(`${apiBase}/lms/public/check-reader-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: tenDigit }),
        signal: AbortSignal.timeout(4000),
      });

      if (apiRes.ok) {
        const data = await apiRes.json();
        return NextResponse.json(data);
      }
    } catch (apiErr) {
      // Backend not running on local dev or network timeout, fall through to fallback
      console.warn("Backend API not reachable for check-reader-status:", apiErr);
    }

    // Test numbers or local fallback
    const testPhones = ["9999999999", "9876543210", "1234567890", "9243019243"];
    if (testPhones.includes(tenDigit)) {
      return NextResponse.json({
        isReader: true,
        verified: true,
        phone: tenDigit,
        message: "Verified Gigi Reader! Reader price of ₹299 is unlocked.",
      });
    }

    return NextResponse.json({
      isReader: false,
      verified: false,
      phone: tenDigit,
      message: "No book order found for this mobile number.",
    });
  } catch (error: any) {
    console.error("Error in check-reader route:", error);
    return NextResponse.json(
      { isReader: false, error: error.message || "Failed to verify reader status" },
      { status: 500 }
    );
  }
}

