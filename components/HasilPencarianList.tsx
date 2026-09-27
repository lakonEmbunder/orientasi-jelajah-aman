// components/HasilPencarianList.tsx
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { GeocodingResult } from "../types/geocoding";

interface Props {
  data: GeocodingResult[];
  sedangMemuat: boolean;
  error: string | null;
  query: string;
  onPilihKota: (item: GeocodingResult) => void;
}

export default function HasilPencarianList({
  data,
  sedangMemuat,
  error,
  query,
  onPilihKota,
}: Props) {
  if (sedangMemuat) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.textInfo}>Mencari lokasi...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text
          accessibilityLabel={`Peringatan error: ${error}`}
          style={styles.textError}
        >
          {error}
        </Text>
      </View>
    );
  }

  if (query.trim() !== "" && data.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text
          accessibilityLabel="Pemberitahuan: Kota tidak ditemukan"
          style={styles.textInfo}
        >
          Kota "{query}" tidak ditemukan.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [
            styles.itemContainer,
            pressed && styles.itemPressed,
          ]}
          onPress={() => onPilihKota(item)}
        >
          <Text style={styles.textNama}>{item.name}</Text>
          <Text style={styles.textDetail}>
            {[item.admin1, item.country].filter(Boolean).join(", ")} (
            {item.latitude.toFixed(2)}, {item.longitude.toFixed(2)})
          </Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  textInfo: {
    color: "#666",
    fontSize: 14,
  },
  textError: {
    color: "#D32F2F",
    fontSize: 14,
  },
  itemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  itemPressed: {
    backgroundColor: "#F5F5F5",
  },
  textNama: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  textDetail: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
});
