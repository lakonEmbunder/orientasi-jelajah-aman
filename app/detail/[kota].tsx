// app/detail/[kota].tsx
import { router, useLocalSearchParams } from "expo-router";
import { Button, View } from "react-native";
import WeatherCard from "../../components/WeatherCard";

export default function HalamanDetail() {
  // Ambil param kota dan suhu dari URL
  const { kota, suhu } = useLocalSearchParams<{
    kota: string;
    suhu?: string;
  }>();

  // Ubah suhu ke angka, jika tidak ada fallback ke 27
  const nilaiSuhu = suhu ? parseInt(suhu, 10) : 27;

  return (
    <View style={{ padding: 16, gap: 16 }}>
      <WeatherCard kota={kota} suhu={nilaiSuhu} tingkatAQI="BAIK" />
      <Button
        title="Tambahkan ke Favorit"
        onPress={() => router.push("/tambah-favorit")}
      />
    </View>
  );
}
