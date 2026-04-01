import { NextResponse } from "next/server";
import { getAdminConfig } from "@/lib/admin-config";

// Never cache — pricing and discount data must always be fresh
export const dynamic = "force-dynamic";

// Public endpoint — returns pricing and rules for the front-end booking flow
export async function GET() {
  const config = await getAdminConfig();
  return NextResponse.json(
    { pricing: config.pricing, rules: config.rules, siteSettings: config.siteSettings },
    { headers: { "Cache-Control": "no-store" } }
  );
}
