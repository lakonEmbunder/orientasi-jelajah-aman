// hooks/usePencarianKota.ts
import { useState } from "react";
import { cariKota } from "../services/geocoding";
import { GeocodingResult } from "../types/geocoding";

export function usePencarianKota() {
  const [query, setQuery] = useState("");
  const [hasil, setHasil] = useState<GeocodingResult[]>([]);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function eksekusiCari(keyword: string) {
    setQuery(keyword);
    if (!keyword.trim()) {
      setHasil([]);
      setError(null);
      return;
    }

    setSedangMemuat(true);
    setError(null);

    try {
      const data = await cariKota(keyword);
      setHasil(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat mencari kota",
      );
      setHasil([]);
    } finally {
      setSedangMemuat(false);
    }
  }

  return {
    query,
    hasil,
    sedangMemuat,
    error,
    eksekusiCari,
  };
}
