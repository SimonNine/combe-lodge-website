// Booking rules engine — all rules are configurable via admin
// These are defaults used when no admin overrides exist

export interface BookingRules {
  minNights: number;
  weekendRule: boolean; // If true, bookings including Fri/Sat must extend to Sunday checkout
  checkInTime: string;
  checkOutTime: string;
  maxGuests: number;
}

export interface SeasonalPricing {
  id?: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  nightlyRate: number; // in pence
  minNights?: number; // override default
}

export interface DiscountPeriod {
  id?: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;
  discountPercent: number; // e.g., 15 for 15% off
}

export interface PricingConfig {
  baseNightlyRate: number; // in pence (e.g., 25000 = £250)
  cleaningFee: number; // in pence
  weekendPremiumPercent: number; // e.g., 10 for 10%
  depositPercent: number; // e.g., 25 for 25% deposit
  seasonalPricing: SeasonalPricing[];
  discountPeriods: DiscountPeriod[];
}

// Default rules
export const DEFAULT_RULES: BookingRules = {
  minNights: 2,
  weekendRule: true,
  checkInTime: "16:00",
  checkOutTime: "10:00",
  maxGuests: 4,
};

// Default pricing
export const DEFAULT_PRICING: PricingConfig = {
  baseNightlyRate: 25000, // £250/night
  cleaningFee: 8000, // £80
  weekendPremiumPercent: 0,
  depositPercent: 100, // Full payment by default
  seasonalPricing: [
    {
      name: "Peak Summer",
      startDate: "2026-07-18",
      endDate: "2026-09-01",
      nightlyRate: 35000,
      minNights: 3,
    },
    {
      name: "Off-peak Winter",
      startDate: "2026-11-01",
      endDate: "2027-03-14",
      nightlyRate: 19500,
    },
    {
      name: "Christmas & New Year",
      startDate: "2026-12-20",
      endDate: "2027-01-03",
      nightlyRate: 40000,
      minNights: 3,
    },
  ],
  discountPeriods: [],
};

// Check if a date falls on a weekend day (Friday or Saturday night)
export function isWeekendNight(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday or Saturday
}

// Get the rate for a specific date
export function getRateForDate(
  date: Date,
  pricing: PricingConfig = DEFAULT_PRICING
): number {
  const dateStr = formatDate(date);

  // Check seasonal pricing (later entries override earlier ones)
  for (let i = pricing.seasonalPricing.length - 1; i >= 0; i--) {
    const season = pricing.seasonalPricing[i];
    if (dateStr >= season.startDate && dateStr <= season.endDate) {
      let rate = season.nightlyRate;
      if (pricing.weekendPremiumPercent > 0 && isWeekendNight(date)) {
        rate = Math.round(rate * (1 + pricing.weekendPremiumPercent / 100));
      }
      return rate;
    }
  }

  // Base rate
  let rate = pricing.baseNightlyRate;
  if (pricing.weekendPremiumPercent > 0 && isWeekendNight(date)) {
    rate = Math.round(rate * (1 + pricing.weekendPremiumPercent / 100));
  }
  return rate;
}

// Get minimum nights for a specific check-in date
export function getMinNightsForDate(
  date: Date,
  rules: BookingRules = DEFAULT_RULES,
  pricing: PricingConfig = DEFAULT_PRICING
): number {
  const dateStr = formatDate(date);

  // Check seasonal overrides
  for (const season of pricing.seasonalPricing) {
    if (dateStr >= season.startDate && dateStr <= season.endDate && season.minNights) {
      return season.minNights;
    }
  }

  return rules.minNights;
}

// Validate a booking date range
export function validateBooking(
  checkIn: Date,
  checkOut: Date,
  rules: BookingRules = DEFAULT_RULES,
  pricing: PricingConfig = DEFAULT_PRICING,
  bookedDates: string[] = []
): { valid: boolean; error?: string } {
  const nights = Math.round(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Check minimum nights
  const minNights = getMinNightsForDate(checkIn, rules, pricing);
  if (nights < minNights) {
    return {
      valid: false,
      error: `Oops — the minimum stay for this period is ${minNights} nights. Please select a later check-out date.`,
    };
  }

  // Weekend rule: if a Friday night is included, checkout must be Sunday or later
  // (prevents checking out Saturday morning without staying for Saturday night)
  if (rules.weekendRule) {
    const d = new Date(checkIn);
    for (let i = 0; i < nights; i++) {
      if (d.getDay() === 5) { // Friday night is in the stay
        if (checkOut.getDay() === 6) { // Checking out Saturday morning = partial weekend
          return {
            valid: false,
            error: "Oops — if you're staying on a Friday night, you'll need to check out on Sunday or later. We don't want you to miss the weekend!",
          };
        }
        break;
      }
      d.setDate(d.getDate() + 1);
    }
  }

  // Check for conflicts with existing bookings
  const d = new Date(checkIn);
  for (let i = 0; i < nights; i++) {
    if (bookedDates.includes(formatDate(d))) {
      return {
        valid: false,
        error: "Sorry — someone has already booked one of those dates. Please try different dates.",
      };
    }
    d.setDate(d.getDate() + 1);
  }

  // Check-in must be in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (checkIn < today) {
    return { valid: false, error: "That date has already passed — please pick a future date." };
  }

  return { valid: true };
}

// Get active discount for a date range (returns first matching discount period)
export function getDiscountForRange(
  checkIn: Date,
  checkOut: Date,
  pricing: PricingConfig = DEFAULT_PRICING
): DiscountPeriod | null {
  if (!pricing.discountPeriods?.length) return null;
  const checkInStr = formatDate(checkIn);
  const checkOutStr = formatDate(checkOut);
  // Discount applies if the check-in falls within a discount period
  for (const dp of pricing.discountPeriods) {
    if (checkInStr >= dp.startDate && checkInStr <= dp.endDate) return dp;
    // Also apply if any night of the stay overlaps the discount period
    if (checkInStr <= dp.endDate && checkOutStr > dp.startDate) return dp;
  }
  return null;
}

// Calculate total price for a booking
export function calculatePrice(
  checkIn: Date,
  checkOut: Date,
  pricing: PricingConfig = DEFAULT_PRICING
): {
  nights: number;
  nightlyBreakdown: { date: string; rate: number }[];
  subtotal: number;
  cleaningFee: number;
  total: number;
  deposit: number;
  discount: DiscountPeriod | null;
  undiscountedTotal: number;
} {
  const nights = Math.round(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );

  const nightlyBreakdown: { date: string; rate: number }[] = [];
  let subtotal = 0;

  const d = new Date(checkIn);
  for (let i = 0; i < nights; i++) {
    const rate = getRateForDate(d, pricing);
    nightlyBreakdown.push({ date: formatDate(d), rate });
    subtotal += rate;
    d.setDate(d.getDate() + 1);
  }

  const undiscountedTotal = subtotal + pricing.cleaningFee;
  const discount = getDiscountForRange(checkIn, checkOut, pricing);
  const total = discount
    ? Math.round(undiscountedTotal * (1 - discount.discountPercent / 100))
    : undiscountedTotal;
  const deposit = Math.round(total * (pricing.depositPercent / 100));

  return {
    nights,
    nightlyBreakdown,
    subtotal,
    cleaningFee: pricing.cleaningFee,
    total,
    deposit,
    discount,
    undiscountedTotal,
  };
}

// Format date to YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Format pence to pounds string with commas
export function formatPrice(pence: number): string {
  const pounds = pence / 100;
  if (pounds % 1 === 0) {
    return `£${pounds.toLocaleString("en-GB")}`;
  }
  return `£${pounds.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
