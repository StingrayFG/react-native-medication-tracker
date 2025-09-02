import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';


export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'background' | 'box';
};

export function ThemedView({ 
  type = 'default',
  style, 
  lightColor,
  darkColor, 
  ...otherProps 
}: ThemedViewProps) {

  const colorType = 
  type === 'default' ? '' :
  type === 'background' ? 'background' :
  'box';

  const backgroundColor = colorType ? useThemeColor({ light: lightColor, dark: darkColor }, colorType) : 'transparent';

  return <View style={[
    { backgroundColor }, 
    style
  ]} 
  {...otherProps} />;
}
