// src/db/database.web.ts
// Fallback penyimpanan berbasis browser (localStorage) khusus platform Web
// untuk menghindari error Metro bundler worker chunk pada expo-sqlite di Windows.

interface BarisCache {
  kunci: string;
  kota_id: number;
  nama_kota: string;
  latitude: number;
  longitude: number;
  cuaca_json: string;
  aqi_json: string;
  disimpan_pada: number;
  jumlah_dibuka?: number;
}

class WebDatabase {
  private getStore(): Record<string, BarisCache> {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const raw = window.localStorage.getItem("jelajah_aman_cache");
        return raw ? JSON.parse(raw) : {};
      }
    } catch {}
    return {};
  }

  private saveStore(store: Record<string, BarisCache>): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("jelajah_aman_cache", JSON.stringify(store));
      }
    } catch {}
  }

  async runAsync(query: string, params: any[] = []): Promise<any> {
    const store = this.getStore();
    if (query.includes("INSERT OR REPLACE")) {
      const [kunci, kota_id, nama_kota, latitude, longitude, cuaca_json, aqi_json, disimpan_pada] = params;
      store[kunci] = {
        kunci,
        kota_id,
        nama_kota,
        latitude,
        longitude,
        cuaca_json,
        aqi_json,
        disimpan_pada,
        jumlah_dibuka: 0,
      };
      this.saveStore(store);
    } else if (query.includes("DELETE FROM cache_cuaca WHERE disimpan_pada <")) {
      const batas = params[0];
      for (const k of Object.keys(store)) {
        if (store[k].disimpan_pada < batas) {
          delete store[k];
        }
      }
      this.saveStore(store);
    } else if (query.includes("DELETE FROM cache_cuaca")) {
      this.saveStore({});
    }
    return { changes: 1 };
  }

  async getFirstAsync<T>(query: string, params: any[] = []): Promise<T | null> {
    const store = this.getStore();
    if (query.includes("WHERE kunci = ?")) {
      const kunci = params[0];
      return (store[kunci] as unknown as T) ?? null;
    }
    return null;
  }

  async getAllAsync<T>(_query: string): Promise<T[]> {
    const store = this.getStore();
    const rows = Object.values(store).sort((a, b) => b.disimpan_pada - a.disimpan_pada);
    return rows.slice(0, 5) as unknown as T[];
  }

  async execAsync(_query: string): Promise<void> {}
}

const webDb = new WebDatabase();

export async function ambilDatabase(): Promise<any> {
  return webDb;
}
