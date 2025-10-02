import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.assemblyai.com/v2/realtime/token", {
      method: "POST",
      headers: {
        Authorization: process.env.ASSEMBLY_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expires_in: 3600 }),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create temporary token", details: err.message },
      { status: 500 }
    );
  }
}
