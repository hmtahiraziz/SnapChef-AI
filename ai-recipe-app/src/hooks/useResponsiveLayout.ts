import { useWindowDimensions } from 'react-native';

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isWide = width >= 1100;
  const isShort = height < 700;
  const isNarrow = width < 380;
  const contentMaxWidth = isWide ? 920 : isTablet ? 720 : undefined;
  const columns = isTablet ? 2 : 1;
  const horizontalPad = isTablet ? 32 : 20;

  return {
    width,
    height,
    isTablet,
    isWide,
    isShort,
    isNarrow,
    contentMaxWidth,
    columns,
    horizontalPad,
  };
}
