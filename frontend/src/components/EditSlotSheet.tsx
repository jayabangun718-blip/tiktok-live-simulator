import Ionicons from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { colors } from "@/src/theme";

// Load MediaLibrary lazily so the app doesn't crash in environments
// (web preview, older Expo Go builds) where the native module is missing.
type MediaLibraryModule = typeof import("expo-media-library");
let MediaLibrary: MediaLibraryModule | null = null;
try {
  if (Platform.OS !== "web") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    MediaLibrary = require("expo-media-library") as MediaLibraryModule;
  }
} catch {
  MediaLibrary = null;
}

type MediaAsset = { id: string; uri: string };

export type EditPayload = {
  name: string;
  photoUri: string | null;
  bgPhotoUri?: string | null;
  viewers?: number;
  message?: string;
};

type PickerTarget = "avatar" | "bg";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (payload: EditPayload) => void;
  title: string;
  initial: {
    name: string;
    photoUri: string | null;
    bgPhotoUri?: string | null;
    viewers?: number;
    message?: string;
  };
  showViewers?: boolean;
  showMessage?: boolean;
  showBgPhoto?: boolean;
};

const THUMB = 58;

export function EditSlotSheet({
  visible,
  onClose,
  onSave,
  title,
  initial,
  showViewers,
  showMessage,
  showBgPhoto,
}: Props) {
  const [name, setName] = useState(initial.name);
  const [photoUri, setPhotoUri] = useState<string | null>(initial.photoUri);
  const [bgPhotoUri, setBgPhotoUri] = useState<string | null>(
    initial.bgPhotoUri ?? null,
  );
  const [viewers, setViewers] = useState(String(initial.viewers ?? 0));
  const [message, setMessage] = useState(initial.message ?? "");
  const [target, setTarget] = useState<PickerTarget>("avatar");

  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [permStatus, setPermStatus] = useState<"granted" | "denied" | "undetermined" | "unavailable">(
    MediaLibrary ? "undetermined" : "unavailable",
  );
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [endCursor, setEndCursor] = useState<string | undefined>(undefined);
  const [hasNext, setHasNext] = useState(true);

  useEffect(() => {
    if (visible) {
      setName(initial.name);
      setPhotoUri(initial.photoUri);
      setBgPhotoUri(initial.bgPhotoUri ?? null);
      setViewers(String(initial.viewers ?? 0));
      setMessage(initial.message ?? "");
      setTarget(showBgPhoto ? "avatar" : "avatar");
    }
  }, [visible, initial, showBgPhoto]);

  useEffect(() => {
    if (!visible) return;
    if (!MediaLibrary) {
      setPermStatus("unavailable");
      return;
    }
    (async () => {
      try {
        const perm = await MediaLibrary.requestPermissionsAsync(false, [
          "photo",
        ]);
        const granted =
          perm.status === "granted" ||
          perm.accessPrivileges === "limited";
        setPermStatus(granted ? "granted" : (perm.status as any));
        if (granted) loadAssets(true);
      } catch {
        setPermStatus("unavailable");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const loadAssets = async (reset: boolean) => {
    if (!MediaLibrary) return;
    if (loadingAssets) return;
    if (!reset && !hasNext) return;
    setLoadingAssets(true);
    try {
      const res = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        first: 60,
        after: reset ? undefined : endCursor,
        sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      });
      const mapped: MediaAsset[] = res.assets.map((a: any) => ({
        id: a.id,
        uri: a.uri,
      }));
      setAssets((prev) => (reset ? mapped : [...prev, ...mapped]));
      setEndCursor(res.endCursor);
      setHasNext(res.hasNextPage);
    } catch {
      // ignore
    } finally {
      setLoadingAssets(false);
    }
  };

  const requestPerm = async () => {
    if (!MediaLibrary) return;
    try {
      const perm = await MediaLibrary.requestPermissionsAsync(false, ["photo"]);
      const granted =
        perm.status === "granted" || perm.accessPrivileges === "limited";
      setPermStatus(granted ? "granted" : (perm.status as any));
      if (granted) loadAssets(true);
    } catch {
      setPermStatus("unavailable");
    }
  };

  const applyUri = (uri: string) => {
    if (target === "avatar") setPhotoUri(uri);
    else setBgPhotoUri(uri);
  };

  const handleSave = () => {
    const parsedViewers = parseInt(viewers, 10);
    onSave({
      name: name.trim() || "—",
      photoUri,
      bgPhotoUri,
      viewers: isNaN(parsedViewers) ? 0 : Math.max(0, parsedViewers),
      message: message.trim(),
    });
    onClose();
  };

  const requestPerm2 = requestPerm; // eslint-disable-line @typescript-eslint/no-unused-vars

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          testID="edit-sheet-backdrop"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.sheetWrap}
        >
          <View style={styles.sheet} testID="edit-slot-sheet">
            <View style={styles.grabber} />
            <View style={styles.headerRow}>
              <Text style={styles.title}>{title}</Text>
              <Pressable
                onPress={onClose}
                hitSlop={12}
                testID="edit-sheet-close"
              >
                <Ionicons name="close" size={20} color={colors.onSurface} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 4 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Photo target selector */}
              <View style={styles.picksRow}>
                <Pressable
                  style={[
                    styles.circlePicker,
                    target === "avatar" && styles.pickerActive,
                  ]}
                  onPress={() => setTarget("avatar")}
                  testID="edit-photo-picker"
                >
                  {photoUri ? (
                    <Image source={{ uri: photoUri }} style={styles.photo} />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Ionicons name="person" size={24} color={colors.muted} />
                    </View>
                  )}
                  {photoUri && (
                    <Pressable
                      onPress={() => setPhotoUri(null)}
                      style={styles.clearBadge}
                      hitSlop={6}
                    >
                      <Ionicons name="close" size={10} color="#fff" />
                    </Pressable>
                  )}
                </Pressable>

                {showBgPhoto && (
                  <Pressable
                    style={[
                      styles.rectPicker,
                      target === "bg" && styles.pickerActive,
                    ]}
                    onPress={() => setTarget("bg")}
                    testID="edit-bg-photo-picker"
                  >
                    {bgPhotoUri ? (
                      <>
                        <Image
                          source={{ uri: bgPhotoUri }}
                          style={styles.photo}
                          blurRadius={2.5}
                        />
                        <View style={styles.rectDim} />
                      </>
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Ionicons
                          name="image-outline"
                          size={24}
                          color={colors.muted}
                        />
                      </View>
                    )}
                    {bgPhotoUri && (
                      <Pressable
                        onPress={() => setBgPhotoUri(null)}
                        style={styles.clearBadge}
                        hitSlop={6}
                      >
                        <Ionicons name="close" size={10} color="#fff" />
                      </Pressable>
                    )}
                  </Pressable>
                )}

                {/* Right-side inline info */}
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Text style={styles.pickHint}>
                    Pilih target:{" "}
                    <Text style={{ color: colors.brandPrimary }}>
                      {target === "avatar" ? "Foto avatar" : "Foto latar"}
                    </Text>
                  </Text>
                  <Text style={styles.pickHintSub}>
                    Ketuk foto di bawah untuk pasang
                  </Text>
                </View>
              </View>

              {/* Inline mini gallery */}
              <View style={styles.galleryWrap}>
                {permStatus === "granted" ? (
                  <FlatList
                    horizontal
                    data={assets}
                    keyExtractor={(a) => a.id}
                    showsHorizontalScrollIndicator={false}
                    onEndReachedThreshold={0.6}
                    onEndReached={() => loadAssets(false)}
                    ListEmptyComponent={
                      loadingAssets ? (
                        <View style={styles.galleryEmpty}>
                          <ActivityIndicator color={colors.brandPrimary} />
                        </View>
                      ) : (
                        <View style={styles.galleryEmpty}>
                          <Text style={styles.emptyTxt}>Belum ada foto</Text>
                        </View>
                      )
                    }
                    ItemSeparatorComponent={() => <View style={{ width: 6 }} />}
                    renderItem={({ item }) => (
                      <Pressable
                        onPress={() => applyUri(item.uri)}
                        style={styles.thumb}
                        testID={`gallery-thumb-${item.id}`}
                      >
                        <Image
                          source={{ uri: item.uri }}
                          style={styles.thumbImg}
                          contentFit="cover"
                          recyclingKey={item.id}
                        />
                      </Pressable>
                    )}
                  />
                ) : permStatus === "unavailable" ? (
                  <View style={styles.galleryEmpty}>
                    <Text style={styles.emptyTxt}>
                      Galeri hanya tersedia di HP (Expo Go / build)
                    </Text>
                  </View>
                ) : (
                  <Pressable style={styles.permBtn} onPress={requestPerm}>
                    <Ionicons
                      name="images-outline"
                      size={16}
                      color={colors.onBrandPrimary}
                    />
                    <Text style={styles.permBtnTxt}>Izinkan akses galeri</Text>
                  </Pressable>
                )}
              </View>

              <View style={styles.inputsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Nama</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Nama"
                    placeholderTextColor={colors.muted}
                    testID="edit-name-input"
                    maxLength={20}
                  />
                </View>
                {showViewers && (
                  <View style={{ width: 92 }}>
                    <Text style={styles.label}>Penonton</Text>
                    <TextInput
                      style={styles.input}
                      value={viewers}
                      onChangeText={(t) =>
                        setViewers(t.replace(/[^0-9]/g, ""))
                      }
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={colors.muted}
                      testID="edit-viewers-input"
                      maxLength={7}
                    />
                  </View>
                )}
              </View>

              {showMessage && (
                <>
                  <Text style={styles.label}>Pesan gelembung</Text>
                  <TextInput
                    style={styles.input}
                    value={message}
                    onChangeText={setMessage}
                    placeholder="F0Lo yg duluan naik"
                    placeholderTextColor={colors.muted}
                    testID="edit-message-input"
                    maxLength={40}
                  />
                </>
              )}

              <Pressable
                style={styles.saveBtn}
                onPress={handleSave}
                testID="edit-save-btn"
              >
                <Text style={styles.saveTxt}>Simpan</Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "flex-end",
  },
  sheetWrap: { width: "100%" },
  sheet: {
    backgroundColor: colors.surfaceSecondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  grabber: {
    alignSelf: "center",
    width: 38,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
    marginBottom: 4,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: { color: colors.onSurface, fontSize: 14, fontWeight: "700" },

  picksRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  circlePicker: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.surfaceTertiary,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  rectPicker: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: colors.surfaceTertiary,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  pickerActive: {
    borderColor: colors.brandPrimary,
    borderWidth: 2,
  },
  photo: { width: "100%", height: "100%" },
  rectDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  clearBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  pickHint: {
    color: colors.onSurface,
    fontSize: 11,
    fontWeight: "700",
  },
  pickHintSub: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 1,
  },

  galleryWrap: {
    height: THUMB,
    marginBottom: 8,
  },
  galleryEmpty: {
    width: 260,
    height: THUMB,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTxt: {
    color: colors.muted,
    fontSize: 11,
  },
  thumb: {
    width: THUMB,
    height: THUMB,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: colors.surfaceTertiary,
  },
  thumbImg: { width: "100%", height: "100%" },
  permBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.brandPrimary,
  },
  permBtnTxt: {
    color: colors.onBrandPrimary,
    fontSize: 12,
    fontWeight: "700",
  },

  inputsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-end",
  },
  label: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: colors.surfaceTertiary,
    color: colors.onSurface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: 999,
    paddingVertical: 9,
    alignItems: "center",
    marginTop: 8,
  },
  saveTxt: { color: colors.onBrandPrimary, fontSize: 13, fontWeight: "700" },
});
