// src/components/WeatherCard.tsx
import { View, Text } from "react-native";
import { WeatherCardProps, TingkatAQI } from "../types/cuaca";
import { typeScale, spacing } from "../constants/styles";

const warnaPerTingkat: Record<TingkatAQI, string> = {
  BAIK: "#2E7D32",
  SEDANG: "#D97706",
  TIDAK_SEHAT: "#EA580C",
  BERBAHAYA: "#DC2626",
};

export default function WeatherCard({
  kota,
  suhu,
  tingkatAQI,
  indeksAQI,
}: WeatherCardProps) {
  const labelTingkat =
    tingkatAQI === "BAIK"
      ? "Baik"
      : tingkatAQI === "SEDANG"
      ? "Sedang"
      : tingkatAQI === "TIDAK_SEHAT"
      ? "Tidak Sehat"
      : "Berbahaya";

  const teksAQI =
    indeksAQI !== undefined
      ? `AQI: ${indeksAQI} (${labelTingkat})`
      : `AQI: ${labelTingkat}`;

  const labelAksesibilitas =
    indeksAQI !== undefined
      ? `Cuaca ${kota}, suhu ${suhu} derajat, indeks kualitas udara ${indeksAQI}, kategori ${labelTingkat}`
      : `Cuaca ${kota}, suhu ${suhu} derajat, kualitas udara ${labelTingkat}`;

  return (
    <View
      accessible
      accessibilityLabel={labelAksesibilitas}
      style={{
        padding: spacing.sedang,
        borderRadius: 8,
        backgroundColor: "#F8F9FA",
        gap: 2,
      }}
    >
      <Text style={{ fontWeight: "bold", fontSize: 22, color: "#111" }}>{kota}</Text>
      <Text style={{ fontSize: 36, fontWeight: "bold", color: "#111" }}>{suhu}°C</Text>
      <Text style={{ color: warnaPerTingkat[tingkatAQI] || "#2E7D32", fontSize: 13, fontWeight: "600" }}>
        {teksAQI}
      </Text>
    </View>
  );
}
