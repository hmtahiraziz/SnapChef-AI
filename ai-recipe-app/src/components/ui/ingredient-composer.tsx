import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInput as TextInputType,
} from 'react-native';

import { IngredientChip } from '@/components/ui/ingredient-chip';
import { SnapChef } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IngredientComposerProps = {
  ingredients: string[];
  onAddMany: (names: string[]) => void;
  onRemove: (name: string) => void;
  onRename?: (from: string, to: string) => void;
};

export function IngredientComposer({
  ingredients,
  onAddMany,
  onRemove,
  onRename,
}: IngredientComposerProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const inputRef = useRef<TextInputType>(null);
  const canSubmit = draft.trim().length > 0;

  useEffect(() => {
    if (!hint) return;
    const timer = setTimeout(() => setHint(null), 2200);
    return () => clearTimeout(timer);
  }, [hint]);

  const submit = () => {
    const parts = draft
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length === 0) return;

    const existing = new Set(ingredients.map((item) => item.toLowerCase()));
    const fresh: string[] = [];
    const seen = new Set<string>();

    for (const part of parts) {
      const key = part.toLowerCase();
      if (existing.has(key) || seen.has(key)) continue;
      seen.add(key);
      fresh.push(part);
    }

    const skipped = parts.length - fresh.length;

    if (fresh.length > 0) {
      onAddMany(fresh);
      setDraft('');
      if (skipped > 0) {
        setHint(
          `Added ${fresh.length}, skipped ${skipped} duplicate${skipped === 1 ? '' : 's'}`,
        );
      } else {
        setHint(null);
      }
      return;
    }

    setHint(parts.length === 1 ? 'Already added' : 'Those ingredients are already added');
  };

  return (
    <View style={styles.root}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: theme.text }]}>Ingredients</Text>
        <View
          style={[
            styles.countPill,
            {
              backgroundColor: theme.isDark
                ? 'rgba(137, 102, 250, 0.2)'
                : 'rgba(137, 102, 250, 0.12)',
            },
          ]}>
          <Text style={[styles.count, { color: theme.tint }]}>
            {ingredients.length} added
          </Text>
        </View>
      </View>

      {ingredients.length > 0 ? (
        <View style={styles.chipRow}>
          {ingredients.map((item) => (
            <IngredientChip
              key={item}
              label={item}
              onRemove={() => onRemove(item)}
              onRename={onRename ? (next) => onRename(item, next) : undefined}
            />
          ))}
        </View>
      ) : null}

      <View
        style={[
          styles.composer,
          {
            backgroundColor: theme.isDark ? theme.field : '#FFFFFF',
            borderColor: focused ? theme.tint : theme.isDark ? theme.fieldBorder : 'rgba(137, 102, 250, 0.14)',
          },
          focused && styles.composerFocused,
        ]}>
        <View
          style={[
            styles.leadingIcon,
            { backgroundColor: theme.isDark ? theme.backgroundSelected : '#F3F0FF' },
          ]}>
          <Ionicons name="leaf-outline" size={18} color={theme.tint} />
        </View>

        <TextInput
          ref={inputRef}
          value={draft}
          onChangeText={setDraft}
          placeholder="Search ingredients"
          placeholderTextColor={theme.isDark ? 'rgba(243,242,247,0.35)' : 'rgba(10, 1, 22, 0.38)'}
          style={[styles.input, { color: theme.text }]}
          onSubmitEditing={submit}
          returnKeyType="done"
          blurOnSubmit={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessibilityLabel="Ingredient name"
        />

        {canSubmit ? (
          <Pressable
            onPress={() => setDraft('')}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Clear input"
            style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
          </Pressable>
        ) : null}

        <Pressable
          onPress={submit}
          disabled={!canSubmit}
          accessibilityRole="button"
          accessibilityLabel="Add ingredient"
          style={({ pressed }) => [
            styles.addBtnWrap,
            !canSubmit && styles.addBtnWrapDisabled,
            pressed && canSubmit && styles.addBtnPressed,
          ]}>
          <LinearGradient
            colors={
              canSubmit
                ? [SnapChef.primary, '#603FEF']
                : theme.isDark
                  ? ['#3A3A48', '#2E2E3A']
                  : [SnapChef.primary, '#603FEF']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.addBtn, !canSubmit && styles.addBtnIdle]}>
            <View style={styles.addBtnHighlight} pointerEvents="none" />
            <Ionicons name="add" size={18} color="#fff" />
          </LinearGradient>
        </Pressable>
      </View>

      <Text style={[styles.helper, { color: theme.textSecondary }]}>
        {hint ?? 'Separate with commas · tap name to edit · tap Add'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  countPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  count: {
    fontSize: 12,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 54,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
    ...Platform.select({
      web: { display: 'flex' as const },
      default: {},
    }),
  },
  composerFocused: {
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  leadingIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 8,
    minWidth: 0,
  },
  clearBtn: {
    padding: 2,
  },
  addBtnWrap: {
    borderRadius: 12,
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnWrapDisabled: {
    shadowOpacity: 0.12,
    elevation: 1,
  },
  addBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  addBtnIdle: {
    opacity: 0.88,
  },
  addBtnHighlight: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 1.2,
    borderTopColor: 'rgba(255,255,255,0.35)',
  },
  addBtnPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.96 }],
  },
  helper: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
    paddingHorizontal: 2,
  },
});
