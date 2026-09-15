import IndikatorAQI from "@/components/IndikatorAQI";
import RiwayatList from "@/components/RiwayatList";
import SearchBox from "@/components/SearchBox";
import WeatherCard from "@/components/WeatherCard";
import { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HalamanUtama() {
  const [kotaAktif, setKotaAktif] = useState("Pekalongan");
  const [riwayat, setRiwayat] = useState<string[]>(["Pekalongan"]);

  function handleCari(kota: string) {
    if (!kota.trim()) return;
    setKotaAktif(kota);

    if (!riwayat.includes(kota)) {
      setRiwayat([...riwayat, kota]);
    }
  }

  useEffect(() => {
    console.log("Kota aktif berubah menjadi:", kotaAktif);
  }, [kotaAktif]);

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 16, marginTop: 40 }}>
      <SearchBox onCari={handleCari} />
      <WeatherCard kota={kotaAktif} suhu={29} tingkatAQI="BAIK" />
      <IndikatorAQI
        kota={kotaAktif}
        indeksAQI={42}
        tingkat="BAIK"
        diperbaruiPada="10:00 WIB"
      />
      <RiwayatList daftarKota={riwayat} />
    </SafeAreaView>
  );
}
