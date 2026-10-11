// types/geocoding.ts

// Struktur data satu lokasi/kota dari hasil pencarian Open-Meteo
export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  admin1_id?: number;
  timezone?: string;
  population?: number;
  country_id?: number;
  country?: string;
  admin1?: string; // Provinsi / Wilayah
}

// Respon lengkap dari Open-Meteo Geocoding API
export interface GeocodingResponse {
  results?: GeocodingResult[]; // BISA UNDEFINED jika kota tidak ditemukan!
  generationtime_ms: number;
}

export type HasilGeocoding = GeocodingResult;
