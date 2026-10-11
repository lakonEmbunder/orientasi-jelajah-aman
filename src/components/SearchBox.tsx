// components/SearchBox.tsx
import { useState } from "react";
import { TextInput, View } from "react-native";

interface SearchBoxProps {
  onCari: (teks: string) => void;
}

export default function SearchBox({ onCari }: SearchBoxProps) {
  const [teks, setTeks] = useState("");

  function handleChange(nilaiBaru: string) {
    setTeks(nilaiBaru);
    onCari(nilaiBaru); // Kirim nilai tiap ketikan, debounce diatur pada pemanggilnya
  }

  return (
    <View>
      <TextInput
        placeholder="Cari nama kota..."
        value={teks}
        onChangeText={handleChange}
        accessibilityLabel="Cari cuaca untuk kota yang dimasukkan"
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 10,
          borderRadius: 8,
          backgroundColor: "#fff",
        }}
      />
    </View>
  );
}
