import { NextRequest, NextResponse } from "next/server";
import { getAdminConfig, saveAdminConfig } from "@/lib/admin-config";

export async function GET() {
  const config = getAdminConfig();
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const current = getAdminConfig();
    // Merge top-level sections only (pricing, rules, blackoutDates, siteSettings)
    const updated = { ...current, ...body };
    saveAdminConfig(updated);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save" },
      { status: 500 }
    );
  }
}
