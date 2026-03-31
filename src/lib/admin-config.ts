import { sql } from "@vercel/postgres";
import { DEFAULT_RULES, DEFAULT_PRICING, BookingRules, PricingConfig } from "./booking-rules";

export interface SiteSettings {
  tagline: string;
  checkInInstructions: string;
  contactPhone: string;
  contactEmail: string;
}

export interface AdminConfig {
  pricing: PricingConfig;
  rules: BookingRules;
  blackoutDates: string[]; // YYYY-MM-DD strings
  siteSettings: SiteSettings;
  bookingSources: string[];
}

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  tagline: "A shelter in the valley",
  checkInInstructions:
    "Check-in is from 4pm. You'll receive a code for the key safe by email the day before arrival.",
  contactPhone: "",
  contactEmail: "",
};

const DEFAULT_CONFIG: AdminConfig = {
  pricing: DEFAULT_PRICING,
  rules: DEFAULT_RULES,
  blackoutDates: [],
  siteSettings: DEFAULT_SITE_SETTINGS,
  bookingSources: ["Direct", "Kentisbury Grange", "Luxury Coastal"],
};

export async function createConfigTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS site_config (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function getAdminConfig(): Promise<AdminConfig> {
  try {
    const result = await sql<{ value: AdminConfig }>`
      SELECT value FROM site_config WHERE key = 'default'
    `;
    if (result.rows.length > 0) {
      const config = result.rows[0].value;
      // Backfill any fields added after initial save
      if (!config.pricing.discountPeriods) config.pricing.discountPeriods = [];
      if (!config.bookingSources) config.bookingSources = ["Direct", "Kentisbury Grange", "Luxury Coastal"];
      return config;
    }
  } catch {
    // Table may not exist yet — return defaults
  }
  return { ...DEFAULT_CONFIG };
}

export async function saveAdminConfig(config: AdminConfig): Promise<void> {
  await sql`
    INSERT INTO site_config (key, value, updated_at)
    VALUES ('default', ${JSON.stringify(config)}::jsonb, NOW())
    ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
  `;
}
