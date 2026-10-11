import { Text, View } from "react-native";
import { LaporanUdara } from "../types/cuaca";

export default function IndikatorAQI({
  kota,
  indeksAQI,
  tingkat,
  diperbaruiPada,
}: LaporanUdara) {
  const getWarna = () => {
    switch (tingkat) {
      case "BAIK":
        return "green";
      case "SEDANG":
        return "gold";
      case "TIDAK_SEHAT":
        return "orange";
      case "BERBAHAYA":
        return "red";
      default:
        return "gray";
    }
  };

  return (
    <View
      style={{
        padding: 12,
        borderWidth: 1,
        borderColor: getWarna(),
        borderRadius: 8,
        marginTop: 8,
      }}
    >
      <Text style={{ fontWeight: "bold" }}>Laporan AQI Detail - {kota}</Text>
      <Text>
        Indeks: {indeksAQI} ({tingkat})
      </Text>
      {diperbaruiPada && (
        <Text style={{ fontSize: 10, color: "gray" }}>
          Diperbarui: {diperbaruiPada}
        </Text>
      )}
    </View>
  );
}
