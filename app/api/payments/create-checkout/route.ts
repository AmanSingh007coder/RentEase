import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, amount, type } = await request.json();

    // Simulating a Stripe Session ID
    const mockSessionId = `mock_ssn_${Math.random().toString(36).substring(7)}`;

    return NextResponse.json({ 
      sessionId: mockSessionId,
      message: "Mock session created for RentEase Vault" 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}