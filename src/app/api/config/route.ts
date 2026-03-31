import { NextResponse } from "next/server";
import { getAdminConfig } from "@/lib/admin-config";

// Public endpoint — returns pricing and rules for the front-end booking flow
export async function GET() {
  const config = await getAdminConfig();
  return NextResponse.json({
    pricing: config.pricing,
    rules: config.rules,
  });
}
