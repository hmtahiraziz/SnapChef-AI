import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { Radii, SnapChef, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const STATUS_LINES = [
  { afterMs: 0, text: 'Uploading your photo…' },
  { afterMs: 1800, text: 'Detecting ingredients…' },
  { afterMs: 4500, text: 'Reading labels & produce…' },
  { afterMs: 9000, text: 'Almost done…' },
] as const;

type ScanAnalyzingOverlayProps = {
  previewUri?: string | null;
  onCancel: () => void;
};

export function ScanAnalyzingOverlay({ previewUri, onCancel }: ScanAnalyzingOverlayProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [status, setStatus] = useState<string>(STATUS_LINES[0].text);
  const progress = useSharedValue(0.12);
  const pulse = useSharedValue(1);

  useEffect(() => {
    const started = Date.now();
    progress.value = withTiming(0.9, {
      duration: 16000,
      easing: Easing.out(Easing.cubic),
    });
    pulse.value = withRepeat(
      withTiming(1.06, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );

    const timer = setInterval(() => {
      const elapsed = Date.now() - started;
      let next: string = STATUS_LINES[0].text;
      for (const line of STATUS_LINES) {
        if (elapsed >= line.afterMs) next = line.text;
      }
      setStatus(next);
    }, 350);

    return () => clearInterval(timer);
  }, [progress, pulse]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.round(progress.value * 100)}%`,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(180)}
      pointerEvents="box-none"
      style={[styles.root, { paddingBottom: Math.max(insets.bottom, Spacing.three) }]}
    >
      {previewUri ? (
        <Image source={{ uri: previewUri }} style={styles.bgImage} contentFit="cover" blurRadius={22} />
      ) : null}
      <View style={styles.dim} pointerEvents="none" />

      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.isDark ? theme.backgroundElement : SnapChef.white,
            borderColor: theme.isDark ? theme.border : 'rgba(137,102,250,0.14)',
          },
        ]}
      >
        <Animated.View style={[styles.iconOrb, pulseStyle]}>
          <Ionicons name="sparkles" size={26} color={SnapChef.white} />
        </Animated.View>

        <Text style={[styles.title, { color: theme.text }]}>Analyzing photo</Text>
        <Text style={[styles.status, { color: theme.text }]}>{status}</Text>
        <Text style={[styles.hint, { color: theme.textSecondary }]}>
          Keep the app open — this usually takes a few seconds.
        </Text>

        <View style={[styles.track, { backgroundColor: 'rgba(137,102,250,0.12)' }]}>
          <Animated.View style={[styles.fillWrap, progressStyle]}>
            <View style={styles.fill} />
          </Animated.View>
        </View>

        <Pressable
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel scan"
          style={({ pressed }) => [styles.cancelBtn, pressed && styles.cancelPressed]}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.35,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 1, 22, 0.45)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: Radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    alignItems: 'center',
    gap: 8,
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  iconOrb: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: SnapChef.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  status: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 4,
  },
  track: {
    width: '100%',
    height: 5,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 8,
  },
  fillWrap: {
    height: '100%',
  },
  fill: {
    width: '100%',
    height: '100%',
    backgroundColor: SnapChef.primary,
    borderRadius: 999,
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelPressed: {
    opacity: 0.7,
  },
  cancelText: {
    color: SnapChef.primary,
    fontSize: 15,
    fontWeight: '700',
  },
});
