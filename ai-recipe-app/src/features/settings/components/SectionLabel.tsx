import { StyleSheet, Text } from 'react-native';

import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SectionLabelProps = {
  children: string;
};

export function SectionLabel({ children }: SectionLabelProps) {
  const theme = useTheme();

  return (
    <Text style={[styles.label, { color: theme.textSecondary, fontFamily: Fonts.bodyBold }]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    letterSpacing: 1.1,
    fontWeight: '700',
    marginBottom: Spacing.two,
    marginTop: Spacing.one,
    marginLeft: 4,
  },
});
