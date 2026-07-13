import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInput as TextInputType,
} from 'react-native';

import { IngredientChip } from '@/components/ui/ingredient-chip';
import { SnapChef } from '@/constants/theme';

type IngredientComposerProps = {
  ingredients: string[];
  onAddMany: (names: string[]) => void;
  onRemove: (name: string) => void;
};

export function IngredientComposer({
  ingredients,
  onAddMany,
  onRemove,
}: IngredientComposerProps) {
  const [draft, setDraft] = useState('');
  const [open, setOpen] = useState(true);
  const [focused, setFocused] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const inputRef = useRef<TextInputType>(null);
  const canSubmit = draft.trim().length > 0;

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 80);
    return () => clearTimeout(timer);
  }, [open]);

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
        <Text style={styles.label}>Ingredients</Text>
        {ingredients.length > 0 ? (
          <Text style={styles.count}>{ingredients.length} added</Text>
        ) : null}
      </View>

      {ingredients.length > 0 ? (
        <View style={styles.chipRow}>
          {ingredients.map((item) => (
            <IngredientChip key={item} label={item} onRemove={() => onRemove(item)} />
          ))}
        </View>
      ) : null}

      {!open ? (
        <IngredientChip
          label="Add ingredient"
          dashed
          onPress={() => setOpen(true)}
        />
      ) : (
        <View style={styles.composerBlock}>
          <View style={[styles.composer, focused && styles.composerFocused]}>
            <View style={styles.leadingIcon}>
              <Ionicons name="leaf-outline" size={18} color={SnapChef.primary} />
            </View>

            <TextInput
              ref={inputRef}
              value={draft}
              onChangeText={setDraft}
              placeholder="e.g. chicken, onion, tomato"
              placeholderTextColor="rgba(10, 1, 22, 0.38)"
              style={styles.input}
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
                <Ionicons name="close-circle" size={18} color={SnapChef.muted} />
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
                    : ['#D8D2E8', '#C8C0D8']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.addBtn}>
                <View style={styles.addBtnHighlight} pointerEvents="none" />
                <Ionicons name="add" size={22} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.helper}>
              {hint ?? 'Separate multiple with commas · press Add or Done'}
            </Text>
            <Pressable
              onPress={() => {
                setOpen(false);
                setDraft('');
                setHint(null);
              }}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Done adding ingredients"
              style={styles.doneBtn}>
              <Text style={styles.doneText}>Done</Text>
              <Ionicons name="chevron-up" size={14} color={SnapChef.primary} />
            </Pressable>
          </View>
        </View>
      )}
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
    fontSize: 13,
    fontWeight: '700',
    color: SnapChef.ink,
    opacity: 0.85,
  },
  count: {
    fontSize: 12,
    fontWeight: '600',
    color: SnapChef.muted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  composerBlock: {
    gap: 8,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 52,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E4EF',
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  composerFocused: {
    borderColor: SnapChef.primary,
    shadowOpacity: 0.14,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  leadingIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#F3F0FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: SnapChef.ink,
    paddingVertical: 8,
    minWidth: 0,
  },
  clearBtn: {
    padding: 2,
  },
  addBtnWrap: {
    borderRadius: 16,
    shadowColor: SnapChef.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 5,
  },
  addBtnWrapDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 2,
  },
  helper: {
    flex: 1,
    fontSize: 11,
    fontWeight: '500',
    color: SnapChef.muted,
    lineHeight: 15,
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  doneText: {
    fontSize: 12,
    fontWeight: '700',
    color: SnapChef.primary,
  },
});
