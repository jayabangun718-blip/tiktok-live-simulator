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
    viewers?: number;
    message?: string;
  };
  showViewers?: boolean;
  showMessage?: boolean;
};

export function EditSlotSheet({
  visible,
  onClose,
  onSave,
  title,
  initial,
  showViewers,
  showMessage,
}: Props) {
  const [name, setName] = useState(initial.name);
  const [photoUri, setPhotoUri] = useState<string | null>(initial.photoUri);
  const [viewers, setViewers] = useState(String(initial.viewers ?? 0));
  const [message, setMessage] = useState(initial.message ?? "");
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(initial.name);
      setPhotoUri(initial.photoUri);
      setViewers(String(initial.viewers ?? 0));
      setMessage(initial.message ?? "");
    }
  }, [visible, initial]);

  const pickImage = async () => {
    try {
      setPicking(true);
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setPicking(false);
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.85,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        setPhotoUri(res.assets[0].uri);
      }
    } finally {
      setPicking(false);
    }
  };

  const handleSave = () => {
    const parsedViewers = parseInt(viewers, 10);
    onSave({
      name: name.trim() || "—",
      photoUri,
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
              <Pressable
                style={styles.photoPicker}
                onPress={pickImage}
                testID="edit-photo-picker"
              >
                {photoUri ? (
                  <Image source={{ uri: photoUri }} style={styles.photo} />
                ) : (
                  <View style={styles.photoPlaceholder}>
                    <Ionicons
                      name="image-outline"
                      size={32}
                      color={colors.muted}
                    />
                    <Text style={styles.photoHint}>Pilih foto</Text>
                  </View>
                )}
                {picking && (
                  <View style={styles.photoOverlay}>
                    <ActivityIndicator color="#fff" />
                  </View>
                )}
                <View style={styles.photoBadge}>
                  <Ionicons name="camera" size={14} color="#fff" />
                </View>
              </Pressable>

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

              {photoUri && (
                <Pressable
                  style={styles.clearBtn}
                  onPress={() => setPhotoUri(null)}
                  testID="edit-clear-photo"
                >
                  <Text style={styles.clearTxt}>Hapus foto</Text>
                </Pressable>
              )}
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
  sheetWrap: {
    width: "100%",
  },
  sheet: {
    backgroundColor: colors.surfaceSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
    maxHeight: "88%",
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
  title: {
    color: colors.onSurface,
    fontSize: 18,
    fontWeight: "700",
  },
  photoPicker: {
    alignSelf: "center",
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: colors.surfaceTertiary,
    overflow: "hidden",
    marginTop: 4,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  photo: { width: "100%", height: "100%" },
  photoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  photoHint: { color: colors.muted, fontSize: 12 },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoBadge: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brandPrimary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surfaceSecondary,
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
  saveTxt: {
    color: colors.onBrandPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  clearBtn: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 10,
  },
  clearTxt: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
  },
});
