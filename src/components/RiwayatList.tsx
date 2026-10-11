// components/RiwayatList.tsx
import { Link } from "expo-router";
import { Text, View } from "react-native";
import { spacing, typeScale } from "../constants/styles";

interface RiwayatListProps {
  daftarKota: string[];
}

export default function RiwayatList({ daftarKota }: RiwayatListProps) {
  return (
    <View style={{ gap: spacing.kecil }}>
      {daftarKota.map((kota) => (
        <Link
          key={kota}
          href={{ pathname: "/detail/[kota]", params: { kota } }}
          style={{
            paddingVertical: spacing.kecil,
            borderBottomWidth: 1,
            borderBottomColor: "#E0E0E0",
          }}
        >
          <Text style={{ fontSize: typeScale.subjudul, color: "#007AFF" }}>
            {kota}
          </Text>
        </Link>
      ))}
    </View>
  );
}
