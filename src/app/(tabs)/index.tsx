// src/app/(tabs)/index.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";

import SearchBox from "../../components/SearchBox";
import WeatherCard from "../../components/WeatherCard";
import AtribusiCuaca from "../../components/AtribusiCuaca";
import StatusData from "../../components/StatusData";
import { useDebounce } from "../../hooks/use-debounce";
import { cariKota } from "../../services/geocodingService";
import { ambilCuacaOfflineFirst, BATAS_CACHE_MS } from "../../services/cuacaRepository";
import { bersihkanCacheLama, daftarKotaTersimpan } from "../../services/cacheRepository";
import { mintaIzinLokasi, ambilKoordinatSaatIni } from "../../services/locationService";
import { ambilSemuaFavorit } from "../../services/favoritStorage";
import { konversiTingkatAQI } from "../../services/weatherAdapter";
import { labelKodeCuaca } from "../../constants/weatherCodes";
import { HasilGeocoding } from "../../types/geocoding";
import { HasilCuacaOffline, RingkasanKotaTersimpan } from "../../types/cache";
import { KotaFavorit } from "../../types/favorit";

export default function HalamanUtama() {
  const [teksCari, setTeksCari] = useState("");
  const [hasilPencarian, setHasilPencarian] = useState<HasilGeocoding[]>([]);
  const [kotaTerpilih, setKotaTerpilih] = useState<HasilGeocoding | null>(null);
  const [hasil, setHasil] = useState<HasilCuacaOffline | null>(null);
  const [kotaTersimpan, setKotaTersimpan] = useState<RingkasanKotaTersimpan[]>([]);
  const [daftarFavorit, setDaftarFavorit] = useState<KotaFavorit[]>([]);
  const [sudahFavorit, setSudahFavorit] = useState(false);
  const [sedangMemuat, setSedangMemuat] = useState(false);
  const [pesanError, setPesanError] = useState<string | null>(null);
  const [pesanLokasi, setPesanLokasi] = useState<string | null>(null);

  const teksTertunda = useDebounce(teksCari, 500);
  const requestIdRef = useRef(0); // pencegah race condition

  async function muatKotaTersimpan() {
    setKotaTersimpan(await daftarKotaTersimpan());
  }

  // Refresh status favorit setiap kali halaman aktif
  useFocusEffect(
    useCallback(() => {
      ambilSemuaFavorit().then((daftar) => {
        setDaftarFavorit(daftar);
        if (kotaTerpilih) {
          setSudahFavorit(
            daftar.some(
              (k) =>
                k.id === kotaTerpilih.id ||
                k.nama.toLowerCase() === kotaTerpilih.name.toLowerCase()
            )
          );
        } else {
          setSudahFavorit(false);
        }
      });
    }, [kotaTerpilih])
  );

  // Saat aplikasi dibuka: buang cache > 7 hari, lalu tampilkan daftar tersimpan
  useEffect(() => {
    bersihkanCacheLama(BATAS_CACHE_MS)
      .then(muatKotaTersimpan)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (teksTertunda.trim().length === 0) {
      setHasilPencarian([]);
      return;
    }
    cariKota(teksTertunda).then(setHasilPencarian).catch(() => setHasilPencarian([]));
  }, [teksTertunda]);

  async function pilihKota(kota: HasilGeocoding, paksaPerbarui = false) {
    setKotaTerpilih(kota);
    ambilSemuaFavorit().then((daftar) => {
      setDaftarFavorit(daftar);
      setSudahFavorit(
        daftar.some(
          (k) =>
            k.id === kota.id || k.nama.toLowerCase() === kota.name.toLowerCase()
        )
      );
    });

    const idSaatIni = ++requestIdRef.current;
    setSedangMemuat(true);
    setPesanError(null);

    try {
      const data = await ambilCuacaOfflineFirst(
        { id: kota.id, nama: kota.name, latitude: kota.latitude, longitude: kota.longitude },
        { paksaPerbarui }
      );
      if (idSaatIni !== requestIdRef.current) return; // hasil basi, abaikan
      setHasil(data);
      muatKotaTersimpan();
    } catch (err) {
      if (idSaatIni !== requestIdRef.current) return;
      setHasil(null);
      setPesanError(
        "Belum ada data tersimpan dan tidak ada koneksi internet. Sambungkan internet lalu coba lagi."
      );
    } finally {
      if (idSaatIni === requestIdRef.current) setSedangMemuat(false);
    }
  }

  async function gunakanLokasiSaatIni() {
    const status = await mintaIzinLokasi();
    if (status === "denied") {
      setPesanLokasi("Izin lokasi ditolak. Silakan cari kota secara manual di atas.");
      return;
    }
    if (status === "unavailable") {
      setPesanLokasi("Layanan lokasi tidak aktif di perangkat ini. Silakan cari kota secara manual.");
      return;
    }
    setPesanLokasi(null);
    const koordinat = await ambilKoordinatSaatIni();
    pilihKota({
      id: -1,
      name: "Lokasi Saat Ini",
      latitude: koordinat.latitude,
      longitude: koordinat.longitude,
      country: "",
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Judul Beranda */}
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111" }}>
          Beranda
        </Text>

        {/* Input Pencarian */}
        <SearchBox onCari={setTeksCari} />

        {/* Tombol Gunakan Lokasi Saat Ini */}
        <TouchableOpacity
          onPress={gunakanLokasiSaatIni}
          activeOpacity={0.8}
          style={{
            backgroundColor: "#2196F3",
            paddingVertical: 12,
            borderRadius: 4,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 13, letterSpacing: 0.5 }}>
            GUNAKAN LOKASI SAAT INI
          </Text>
        </TouchableOpacity>

        {pesanLokasi && (
          <Text accessibilityLabel={pesanLokasi} style={{ color: "#D32F2F", fontSize: 12 }}>
            {pesanLokasi}
          </Text>
        )}

        {/* Label Jumlah Kota Ditemukan */}
        {hasilPencarian.length > 0 && (
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#333", marginTop: 4 }}>
            Ditemukan {hasilPencarian.length} kota (Pilih salah satu):
          </Text>
        )}

        {/* Kartu Hasil Pencarian */}
        {hasilPencarian.map((kota) => {
          const isTerpilih = kotaTerpilih?.id === kota.id;
          const isFavorit = daftarFavorit.some(
            (f) => f.id === kota.id || f.nama.toLowerCase() === kota.name.toLowerCase()
          );

          return (
            <TouchableOpacity
              key={kota.id}
              onPress={() => pilihKota(kota)}
              activeOpacity={0.7}
              style={{
                backgroundColor: isTerpilih ? "#EBF3FA" : "#FFFFFF",
                borderColor: isTerpilih ? "#64B5F6" : "#E0E0E0",
                borderWidth: 1.5,
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 14,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "bold", color: isTerpilih ? "#1976D2" : "#222" }}>
                  {kota.name}
                </Text>
                <Text style={{ fontSize: 11, color: "#666", marginTop: 2 }}>
                  {isFavorit
                    ? `Tersimpan di Favorit, ${kota.country || "Indonesia"}`
                    : [kota.admin1, kota.country].filter(Boolean).join(", ")}
                </Text>
              </View>
              {isTerpilih && (
                <Text style={{ color: "#1976D2", fontWeight: "600", fontSize: 13 }}>
                  Terpilih ✓
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Daftar Tersimpan di Perangkat (Offline First) */}
        {kotaTersimpan.length > 0 && hasilPencarian.length === 0 && (
          <View style={{ gap: 6, marginVertical: 4 }}>
            <Text style={{ fontWeight: "bold", fontSize: 13, color: "#444" }}>
              Tersimpan di perangkat (bisa dibuka offline)
            </Text>
            {kotaTersimpan.map((k) => (
              <TouchableOpacity
                key={k.kunci}
                onPress={() =>
                  pilihKota({
                    id: k.id,
                    name: k.nama,
                    latitude: k.latitude,
                    longitude: k.longitude,
                    country: "",
                  })
                }
                style={{
                  backgroundColor: "#F8FAFC",
                  borderColor: "#CBD5E1",
                  borderWidth: 1,
                  borderRadius: 6,
                  padding: 10,
                }}
              >
                <Text style={{ color: "#1E293B", fontWeight: "500" }}>{k.nama}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {sedangMemuat && <ActivityIndicator size="small" color="#2196F3" />}

        {pesanError && (
          <View style={{ padding: 12, backgroundColor: "#FEE2E2", borderRadius: 8, gap: 8 }}>
            <Text accessibilityLabel={pesanError} style={{ color: "#991B1B", fontSize: 13 }}>
              {pesanError}
            </Text>
            <TouchableOpacity
              onPress={() => kotaTerpilih && pilihKota(kotaTerpilih, true)}
              style={{
                backgroundColor: "#DC2626",
                paddingVertical: 8,
                borderRadius: 6,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 12 }}>
                Coba Lagi
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tampilan Cuaca & Status Data Lengkap */}
        {hasil && kotaTerpilih && !sedangMemuat && (
          <View style={{ gap: 8 }}>
            <StatusData sumber={hasil.sumber} disimpanPada={hasil.disimpanPada} />

            <WeatherCard
              kota={kotaTerpilih.name}
              suhu={hasil.cuaca.saatIni.suhu}
              tingkatAQI={konversiTingkatAQI(hasil.kualitasUdara.indeksAQI)}
              indeksAQI={hasil.kualitasUdara.indeksAQI}
            />

            {/* Banner Favorit Hijau jika sudah favorit, tombol jika belum */}
            {sudahFavorit ? (
              <View
                style={{
                  backgroundColor: "#D4EDDA",
                  borderRadius: 6,
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#155724", fontWeight: "600", fontSize: 13 }}>
                  ✓ Kota ini sudah ada di daftar favorit
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/tambah-favorit",
                    params: {
                      id: String(kotaTerpilih.id),
                      nama: kotaTerpilih.name,
                      lat: String(kotaTerpilih.latitude),
                      lon: String(kotaTerpilih.longitude),
                    },
                  })
                }
                style={{
                  backgroundColor: "#2196F3",
                  borderRadius: 6,
                  paddingVertical: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "bold", fontSize: 13 }}>
                  Tambahkan ke Favorit
                </Text>
              </TouchableOpacity>
            )}

            {/* Bar Suhu Hari Ini */}
            <View
              style={{
                backgroundColor: "#F0F4F8",
                borderRadius: 6,
                paddingVertical: 10,
                paddingHorizontal: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 12, color: "#333" }}>
                Suhu Hari Ini • Maks:{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {hasil.cuaca.harian.suhuMaksimal[0]}°C
                </Text>{" "}
                • Min:{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {hasil.cuaca.harian.suhuMinimal[0]}°C
                </Text>
              </Text>
            </View>

            {/* Bar Kondisi Cuaca & Angin */}
            <View
              style={{
                backgroundColor: "#F0F4F8",
                borderRadius: 6,
                paddingVertical: 10,
                paddingHorizontal: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 12, color: "#333" }}>
                Kondisi:{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {labelKodeCuaca(hasil.cuaca.saatIni.kodeCuaca)}
                </Text>{" "}
                • Angin:{" "}
                <Text style={{ fontWeight: "bold" }}>
                  {hasil.cuaca.saatIni.kecepatanAngin} km/j
                </Text>
              </Text>
            </View>

            {/* Tombol Perbarui Sekarang */}
            <TouchableOpacity
              onPress={() => pilihKota(kotaTerpilih, true)}
              style={{
                backgroundColor: "#E2E8F0",
                borderRadius: 6,
                paddingVertical: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#334155", fontWeight: "600", fontSize: 12 }}>
                Perbarui Sekarang
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Footer Info Tambahan */}
        {hasil && (
          <Text style={{ fontSize: 11, color: "#888", textAlign: "center", marginTop: 4 }}>
            PM2.5: {hasil.kualitasUdara.pm25} µg/m³ • PM10: {hasil.kualitasUdara.pm10} µg/m³
          </Text>
        )}

        <AtribusiCuaca />
      </ScrollView>
    </SafeAreaView>
  );
}
