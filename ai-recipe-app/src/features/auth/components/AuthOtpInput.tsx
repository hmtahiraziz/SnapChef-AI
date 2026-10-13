import { useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

const OTP_LENGTH = 6;

type AuthOtpInputProps = {
  label?: string;
  value: string;
  onChangeText: (code: string) => void;
  length?: number;
  autoFocus?: boolean;
  accessibilityLabel?: string;
  onComplete?: (code: string) => void;
};

function sanitizeDigits(text: string, maxLength: number) {
  return text.replace(/\D/g, '').slice(0, maxLength);
}

export function AuthOtpInput({
  label = 'Verification code',
  value,
  onChangeText,
  length = OTP_LENGTH,
  autoFocus,
  accessibilityLabel,
  onComplete,
}: AuthOtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  const digits = Array.from({ length }, (_, i) => value[i] ?? '');
  const activeIndex = Math.min(value.length, length - 1);

  const handleChange: TextInputProps['onChangeText'] = (text) => {
    const next = sanitizeDigits(text, length);
    onChangeText(next);
    if (next.length === length) {
      onComplete?.(next);
    }
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={styles.inputLayer}>
        <Pressable
          onPress={focusInput}
          accessibilityRole="none"
          style={styles.cellsRow}>
          {digits.map((digit, index) => {
            const filled = digit.length > 0;
            const active = isFocused && index === activeIndex;

            return (
              <View
                key={index}
                style={[
                  styles.cell,
                  filled && styles.cellFilled,
                  active && styles.cellActive,
                ]}>
                {filled ? (
                  <Text style={styles.cellText}>{digit}</Text>
                ) : active ? (
                  <View style={styles.caret} />
                ) : null}
              </View>
            );
          })}
        </Pressable>

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          importantForAutofill="yes"
          maxLength={length}
          autoFocus={autoFocus}
          caretHidden
          contextMenuHidden={false}
          style={styles.hiddenInput}
          accessibilityLabel={accessibilityLabel ?? label}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0116',
  },
  inputLayer: {
    position: 'relative',
    width: '100%',
  },
  cellsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
  },
  cell: {
    flex: 1,
    minWidth: 0,
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E8E4EF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellFilled: {
    borderColor: '#C9B8F8',
    backgroundColor: '#FAF8FF',
  },
  cellActive: {
    borderColor: '#8966FA',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },
  cellText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0A0116',
    includeFontPadding: false,
    textAlign: 'center',
  },
  caret: {
    width: 2,
    height: 22,
    borderRadius: 1,
    backgroundColor: '#8966FA',
  },
  hiddenInput: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.01,
    color: 'transparent',
  },
});
