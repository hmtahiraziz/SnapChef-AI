import { useWindowDimensions } from 'react-native';

export function useBreakpoint() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isPhone = width < 600;
  const isTablet = width >= 900;

  let columns: 1 | 2 | 3 = 1;
  let contentMaxWidth = 840;

  if (width >= 900) {
    columns = isLandscape && width >= 1100 ? 3 : 2;
    contentMaxWidth = 960;
  } else if (width >= 600) {
    columns = 2;
    contentMaxWidth = 840;
  }

  return {
    width,
    height,
    isPhone,
    isTablet,
    isLandscape,
    columns,
    contentMaxWidth,
    compactToolbar: width >= 900,
  };
}
