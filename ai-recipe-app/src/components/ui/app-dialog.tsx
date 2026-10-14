import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts, Radii, SnapChef, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type AppDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  tone?: 'primary' | 'danger';
  confirmOnly?: boolean;
  onCancel?: () => void;
  onConfirm: () => void;
};

/** Simple centered confirm/notice dialog. */
export function AppDialog({
  visible,
  title,
  message,
  cancelLabel = 'Cancel',
  confirmLabel = 'OK',
  tone = 'primary',
  confirmOnly = false,
  onCancel,
  onConfirm,
}: AppDialogProps) {
  const theme = useTheme();
  const confirmBg = tone === 'danger' ? '#E53935' : SnapChef.primary;
  const cancelBg = theme.isDark ? theme.backgroundSelected : SnapChef.field;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel ?? onConfirm}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onCancel ?? onConfirm} />

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.isDark ? theme.backgroundElement : SnapChef.white,
              borderColor: theme.isDark ? 'rgba(255,255,255,0.08)' : SnapChef.fieldBorder,
              shadowColor: theme.isDark ? '#000' : SnapChef.ink,
            },
          ]}>
          <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.bodyBold }]}>{title}</Text>
          {message ? (
            <Text style={[styles.message, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
              {message}
            </Text>
          ) : null}

          <View style={styles.actions}>
            {!confirmOnly ? (
              <View style={styles.btnSlot}>
                <Pressable
                  onPress={onCancel}
                  accessibilityRole="button"
                  accessibilityLabel={cancelLabel}
                  style={({ pressed }) => [pressed ? styles.pressed : null]}>
                  <View style={[styles.btnFace, { backgroundColor: cancelBg }]}>
                    <Text
                      style={[styles.btnText, { color: theme.text, fontFamily: Fonts.bodyBold }]}
                      numberOfLines={1}>
                      {cancelLabel}
                    </Text>
                  </View>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.btnSlot}>
              <Pressable
                onPress={onConfirm}
                accessibilityRole="button"
                accessibilityLabel={confirmLabel}
                style={({ pressed }) => [pressed ? styles.pressed : null]}>
                <View style={[styles.btnFace, { backgroundColor: confirmBg }]}>
                  <Text style={[styles.confirmText, { fontFamily: Fonts.bodyBold }]} numberOfLines={1}>
                    {confirmLabel}
                  </Text>
                </View>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 1, 22, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderRadius: Radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.four,
    zIndex: 2,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  actions: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 4,
  },
  btnSlot: {
    flex: 1,
    paddingHorizontal: 4,
  },
  pressed: {
    opacity: 0.88,
  },
  btnFace: {
    width: '100%',
    height: 48,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  confirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
