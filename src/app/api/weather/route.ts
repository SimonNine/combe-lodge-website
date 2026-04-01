import { NextResponse } from "next/server";

// Lodge coordinates: Kentisbury Grange, North Devon
const LAT = 51.1842;
const LON = -3.8531;

export async function GET() {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true`,
      { next: { revalidate: 900 } } // cache 15 minutes
    );

    if (!res.ok) throw new Error("Weather API error");

    const data = await res.json();
    const cw = data.current_weather;

    return NextResponse.json({
      temperature: Math.round(cw.temperature),
      weatherCode: cw.weathercode,
      windSpeed: Math.round(cw.windspeed),
      isDay: cw.is_day === 1,
    });
  } catch {
    return NextResponse.json(
      { temperature: null, weatherCode: 0, windSpeed: 0, isDay: true },
      { status: 200 } // degrade gracefully
    );
  }
}
