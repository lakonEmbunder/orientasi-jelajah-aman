// services/geocoding.ts
import { GeocodingResponse, GeocodingResult } from "../types/geocoding";

const BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export async function cariKota(namaKota: string): Promise<GeocodingResult[]> {
  if (!namaKota.trim()) return [];

  const url = `${BASE_URL}?name=${encodeURIComponent(
    namaKota.trim(),
  )}&count=5&language=id&format=json`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Gagal mengambil data geocoding (${res.status})`);
  }

  const data: GeocodingResponse = await res.json();

  // Mengembalikan array results, atau array kosong jika undefined/tidak ditemukan
  return data.results ?? [];
}
