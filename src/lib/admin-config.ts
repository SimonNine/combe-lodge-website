import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { DEFAULT_RULES, DEFAULT_PRICING, BookingRules, PricingConfig } from "./booking-rules";

const DATA_DIR = join(process.cwd(), "data");
const CONFIG_FILE = join(DATA_DIR, "admin-config.json");

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

export function getAdminConfig(): AdminConfig {
  try {
    if (existsSync(CONFIG_FILE)) {
      const raw = readFileSync(CONFIG_FILE, "utf-8");
      const config = JSON.parse(raw) as AdminConfig;
      // Ensure new fields have defaults for existing configs
      if (!config.pricing.discountPeriods) {
        config.pricing.discountPeriods = [];
      }
      if (!config.bookingSources) {
        config.bookingSources = ["Direct", "Kentisbury Grange", "Luxury Coastal"];
      }
      return config;
    }
  } catch {
    // Fall through to defaults
  }
  return {
    pricing: DEFAULT_PRICING,
    rules: DEFAULT_RULES,
    blackoutDates: [],
    siteSettings: DEFAULT_SITE_SETTINGS,
    bookingSources: ["Direct", "Kentisbury Grange", "Luxury Coastal"],
  };
}

export function saveAdminConfig(config: AdminConfig): void {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}
