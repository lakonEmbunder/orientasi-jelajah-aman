// app/(tabs)/index.tsx
import { useEffect, useState } from "react";
import { useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import RiwayatList from "../../components/RiwayatList";
import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import { TingkatAQI } from "../../types/cuaca";

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

  useEffect(() => {
    console.log("Kota aktif berubah menjadi:", kotaAktif);
  }, [kotaAktif]);

  function handleCari(kota: string) {
    setKotaAktif(kota);
    if (!riwayat.includes(kota)) {
      setRiwayat([...riwayat, kota]);
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
      <SearchBox onCari={handleCari} />
      <WeatherCard
        kota={kotaAktif}
        suhu={dataCuaca.suhu}
        tingkatAQI={dataCuaca.aqi}
      />
      <RiwayatList daftarKota={riwayat} />
    </SafeAreaView>
  );
}
