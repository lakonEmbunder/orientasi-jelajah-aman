// app/(tabs)/index.tsx
import { useEffect, useState } from "react";
import { Text, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import HasilPencarianList from "../../components/HasilPencarianList";
import RiwayatList from "../../components/RiwayatList";
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import { usePencarianKota } from "../../hooks/usePencarianKota";
import { TingkatAQI } from "../../types/cuaca";
import { GeocodingResult } from "../../types/geocoding";

// Data dummy cuaca per kota
const DATA_CUACA_KOTA: Record<string, { suhu: number; aqi: TingkatAQI }> = {
  pekalongan: { suhu: 31, aqi: "BAIK" },
  degayu: { suhu: 30, aqi: "SEDANG" },
  nggantol: { suhu: 28, aqi: "BAIK" },
  "tel aviv": { suhu: 34, aqi: "TIDAK_SEHAT" },
  jakarta: { suhu: 33, aqi: "TIDAK_SEHAT" },
  semarang: { suhu: 32, aqi: "SEDANG" },
};

export default function HalamanUtama() {
  const [kotaAktif, setKotaAktif] = useState("Pekalongan");
  const [riwayat, setRiwayat] = useState<string[]>(["Pekalongan"]);

  const { width } = useWindowDimensions();
  const isTablet = width > 768;

  // Panggil custom hook pencarian
  const { query, hasil, sedangMemuat, error, eksekusiCari } =
    usePencarianKota();

  useEffect(() => {
    console.log("Kota aktif berubah menjadi:", kotaAktif);
  }, [kotaAktif]);

  function handlePilihKota(item: GeocodingResult) {
    setKotaAktif(item.name);
    if (!riwayat.includes(item.name)) {
      setRiwayat([item.name, ...riwayat]);
    }
  }

  // Cari data cuaca berdasarkan nama kota (lowercase), jika tidak ada gunakan data default
  const namaKotaClean = kotaAktif.trim().toLowerCase();
  const dataCuaca = DATA_CUACA_KOTA[namaKotaClean] || {
    suhu: 27,
    aqi: "BAIK" as TingkatAQI,
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: isTablet ? 32 : 16, gap: 16 }}>
      <SearchBox onCari={eksekusiCari} />

      {/* Tampilkan Hasil Pencarian Geocoding jika sedang mengetik/mencari */}
      {query.trim() !== "" ? (
        <>
          {/* LATIHAN MANDIRI 1: Tampilkan Teks Indikator Jumlah Kota */}
          {!sedangMemuat && !error && hasil.length > 0 && (
            <Text style={{ fontWeight: "bold", color: "#555" }}>
              Ditemukan {hasil.length} kota
            </Text>
          )}

          <HasilPencarianList
            data={hasil}
            sedangMemuat={sedangMemuat}
            error={error}
            query={query}
            onPilihKota={handlePilihKota}
          />
        </>
      ) : (
        <>
          <WeatherCard
            kota={kotaAktif}
            suhu={dataCuaca.suhu}
            tingkatAQI={dataCuaca.aqi}
          />
          <RiwayatList daftarKota={riwayat} />
        </>
      )}
    </SafeAreaView>
  );
}
