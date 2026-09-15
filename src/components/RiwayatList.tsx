import { Text, View } from "react-native";

interface RiwayatListProps {
  daftarKota: string[];
}

export default function RiwayatList({ daftarKota }: RiwayatListProps) {
  return (
    <View>
      <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
        Riwayat Pencarian:
      </Text>
      {daftarKota.map((kota) => (
        <Text key={kota}>• {kota}</Text>
      ))}
    </View>
  );
}
