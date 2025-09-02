import { StyleSheet, Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';


export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'defaultSemiBold' | 'defaultItalic' | 'title' | 'subtitle' | 'link' | 'button' | 'option';
};


export function ThemedText({
  type = 'default',
  style,
  lightColor,
  darkColor,
  ...otherProps 
}: ThemedTextProps) {
  
  const colorType = 
  type === 'link' ? 'linkText' :
  type === 'button' ? 'buttonText' :
  type === 'option' ? 'optionText' :
  'text';

  const color = useThemeColor({ light: lightColor, dark: darkColor }, colorType);

  return (
    <Text
      style={[
        { color },
        type === 'default' ? styles.default : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'defaultItalic' ? styles.defaultItalic : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'button' ? styles.button : undefined,
        type === 'option' ? styles.option : undefined,
        style,
      ]}
      { ...otherProps }
    />
  );
}


const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 600,
  },
  defaultItalic: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: 600,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: 600,
  },
  link: {
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 600,
  },
  option: {
    fontSize: 16,
    lineHeight: 24,
  },
});
