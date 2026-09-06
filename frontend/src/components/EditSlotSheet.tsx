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
      quality: 0.85,
    });
    if (!res.canceled && res.assets?.[0]?.uri) setUri(res.assets[0].uri);
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
                <Ionicons name="close" size={24} color={colors.onSurface} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 8 }}
            >
              {/* Photo pickers row */}
              <View style={styles.picksRow}>
                {/* Circle avatar photo */}
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
                          size={30}
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
                      <Ionicons name="camera" size={12} color="#fff" />
                    </View>
                  </Pressable>
                  <Text style={styles.pickLbl}>Foto avatar</Text>
                  <Text style={styles.pickSub}>Lingkaran tengah</Text>
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

                {/* Background blur photo — only for guests */}
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
                            blurRadius={12}
                          />
                          <View style={styles.rectDim} />
                        </>
                      ) : (
                        <View style={styles.photoPlaceholder}>
                          <Ionicons
                            name="image-outline"
                            size={30}
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
                        <Ionicons name="camera" size={12} color="#fff" />
                      </View>
                    </Pressable>
                    <Text style={styles.pickLbl}>Foto latar</Text>
                    <Text style={styles.pickSub}>Full kotak (blur)</Text>
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

              {showViewers && (
                <>
                  <Text style={styles.label}>Jumlah penonton</Text>
                  <TextInput
                    style={styles.input}
                    value={viewers}
                    onChangeText={(t) => setViewers(t.replace(/[^0-9]/g, ""))}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={colors.muted}
                    testID="edit-viewers-input"
                    maxLength={7}
                  />
                </>
              )}

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
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheetWrap: { width: "100%" },
  sheet: {
    backgroundColor: colors.surfaceSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
    maxHeight: "92%",
  },
  grabber: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.borderStrong,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: { color: colors.onSurface, fontSize: 18, fontWeight: "700" },

  picksRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  pickCol: {
    alignItems: "center",
    gap: 4,
  },
  circlePicker: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.surfaceTertiary,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: colors.border,
  },
  rectPicker: {
    width: 92,
    height: 92,
    borderRadius: 10,
    backgroundColor: colors.surfaceTertiary,
    overflow: "hidden",
    borderWidth: 2,
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
    right: 4,
    bottom: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surfaceSecondary,
  },
  pickLbl: {
    color: colors.onSurface,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
  },
  pickSub: {
    color: colors.muted,
    fontSize: 10,
  },
  clearTxt: {
    color: colors.error,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },

  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surfaceTertiary,
    color: colors.onSurface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveBtn: {
    backgroundColor: colors.brandPrimary,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  saveTxt: { color: colors.onBrandPrimary, fontSize: 15, fontWeight: "700" },
});
