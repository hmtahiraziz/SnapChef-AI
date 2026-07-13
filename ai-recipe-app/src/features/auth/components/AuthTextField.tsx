import { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet, type TextInputProps } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

type AuthTextFieldProps = TextInputProps & {
  label: string;
  rightLabel?: string;
  onRightLabelPress?: () => void;
  containerClassName?: string;
  showPasswordToggle?: boolean;
  passwordVisible?: boolean;
  onTogglePassword?: () => void;
};

export function AuthTextField({
  label,
  rightLabel,
  onRightLabelPress,
  containerClassName,
  secureTextEntry,
  showPasswordToggle,
  passwordVisible,
  onTogglePassword,
  ...rest
}: AuthTextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerClassName ? { flex: 1 } : null]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {rightLabel && onRightLabelPress ? (
          <TouchableOpacity
            onPress={onRightLabelPress}
            hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
            style={styles.rightLabelTouch}>
            <Text style={styles.rightLabel}>{rightLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            showPasswordToggle && styles.inputWithPassword,
            isFocused && styles.inputFocused,
          ]}
          placeholderTextColor="#9A94A5"
          secureTextEntry={secureTextEntry}
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
        {showPasswordToggle && onTogglePassword ? (
          <TouchableOpacity
            onPress={onTogglePassword}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Hide password' : 'Show password'}
            style={styles.eyeButton}>
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#6B6575"
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    width: '100%',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0116',
  },
  rightLabelTouch: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  rightLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8966FA', // Premium purple link
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  input: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E4EF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 15,
    color: '#0A0116',
    minHeight: 52,
    shadowColor: '#8966FA',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  inputWithPassword: {
    paddingRight: 48,
  },
  inputFocused: {
    borderColor: '#8966FA',
    shadowColor: '#8966FA',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    backgroundColor: '#FFFFFF',
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
  },
});
