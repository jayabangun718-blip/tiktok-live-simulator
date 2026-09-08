import Ionicons from "@react-native-vector-icons/ionicons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

export type EditPayload = {
  name: string;
  photoUri: string | null;
  bgPhotoUri?: string | null;
  viewers?: number;
  message?: string;
};

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

async function pickPhoto(
  setUri: (u: string | null) => void,
  setBusy: (b: boolean) => void,
  square: boolean,
) {
  try {
    setBusy(true);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: square ? [1, 1] : [4, 5],
      quality: 0.6,
      base64: true,
    });
    if (res.canceled || !res.assets?.[0]) return;
    const asset = res.assets[0];
    // Store the image as a self-contained base64 data URI so it persists
    // fully offline (survives app restarts on APK and page reloads on web).
    if (asset.base64) {
      const mime = asset.mimeType ?? "image/jpeg";
      setUri(`data:${mime};base64,${asset.base64}`);
    } else if (asset.uri) {
      // Fallback (some web builds already return a data/blob URI here).
      setUri(asset.uri);
    }
  } finally {
    setBusy(false);
  }
}

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
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const [pickingBg, setPickingBg] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(initial.name);
      setPhotoUri(initial.photoUri);
      setBgPhotoUri(initial.bgPhotoUri ?? null);
      setViewers(String(initial.viewers ?? 0));
      setMessage(initial.message ?? "");
    }
  }, [visible, initial]);

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
              <View style={styles.picksRow}>
                <View style={styles.pickCol}>
                  <Pressable
                    style={styles.circlePicker}
                    onPress={() =>
                      pickPhoto(setPhotoUri, setPickingAvatar, true)
                    }
                    testID="edit-photo-picker"
                  >
                    {photoUri ? (
                      <Image source={{ uri: photoUri }} style={styles.photo} />
                    ) : (
                      <View style={styles.photoPlaceholder}>
                        <Ionicons
                          name="person"
                          size={24}
                          color={colors.muted}
                        />
                      </View>
                    )}
                    {pickingAvatar && (
                      <View style={styles.photoOverlay}>
                        <ActivityIndicator color="#fff" />
                      </View>
                    )}
                    <View style={styles.photoBadge}>
                      <Ionicons name="camera" size={10} color="#fff" />
                    </View>
                  </Pressable>
                  <Text style={styles.pickLbl}>Foto avatar</Text>
                  {photoUri && (
                    <Pressable
                      onPress={() => setPhotoUri(null)}
                      testID="edit-clear-photo"
                      hitSlop={8}
                    >
                      <Text style={styles.clearTxt}>Hapus</Text>
                    </Pressable>
                  )}
                </View>

                {showBgPhoto && (
                  <View style={styles.pickCol}>
                    <Pressable
                      style={styles.rectPicker}
                      onPress={() =>
                        pickPhoto(setBgPhotoUri, setPickingBg, false)
                      }
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
                      {pickingBg && (
                        <View style={styles.photoOverlay}>
                          <ActivityIndicator color="#fff" />
                        </View>
                      )}
                      <View style={styles.photoBadge}>
                        <Ionicons name="camera" size={10} color="#fff" />
                      </View>
                    </Pressable>
                    <Text style={styles.pickLbl}>Foto latar</Text>
                    {bgPhotoUri && (
                      <Pressable
                        onPress={() => setBgPhotoUri(null)}
                        testID="edit-clear-bg-photo"
                        hitSlop={8}
                      >
                        <Text style={styles.clearTxt}>Hapus</Text>
                      </Pressable>
                    )}
                  </View>
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
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
    marginBottom: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  title: { color: colors.onSurface, fontSize: 15, fontWeight: "700" },

  picksRow: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "center",
    marginBottom: 6,
  },
  pickCol: {
    alignItems: "center",
    gap: 2,
  },
  circlePicker: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceTertiary,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  rectPicker: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.surfaceTertiary,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: colors.border,
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
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoBadge: {
    position: "absolute",
    right: 2,
    bottom: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.surfaceSecondary,
  },
  pickLbl: {
    color: colors.onSurface,
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  clearTxt: {
    color: colors.error,
    fontSize: 10,
    fontWeight: "600",
    marginTop: 1,
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
    marginTop: 4,
    marginBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: colors.surfaceTertiary,
    color: colors.onSurface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveTxt: { color: colors.onBrandPrimary, fontSize: 13, fontWeight: "700" },
});
