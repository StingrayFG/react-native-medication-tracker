import { useState } from 'react';
import { Pressable, TextInput, type TextInputProps } from 'react-native';
import Animated, { interpolate, interpolateColor, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { useThemeColor } from '@/hooks/useThemeColor';


export type CustomTextInputProps = TextInputProps & {
  isEnabled?: boolean,
  header: string;
  lightColor?: string;
  darkColor?: string;
};

export function CustomTextInput({ 
  isEnabled = true,
  header, 
  value,
  onChangeText, 
  onPress,
  style, 
  editable,
  lightColor, 
  darkColor, 
  ...otherProps
}: CustomTextInputProps) {

  const colorInactive = useThemeColor({ light: lightColor, dark: darkColor }, 'inputInactive');
  const colorActive = useThemeColor({ light: lightColor, dark: darkColor }, 'inputActive');
  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'inputText');

  //
  const [isFocused, setIsFocused] = useState(false);

  const focusProgress = useDerivedValue(() => {
    return withTiming(isFocused ? 1 : 0, { duration: 200 });
  });
  
  const fillProgress = useDerivedValue(() => {
    if (!value) {
      return withTiming(isFocused ? 1 : 0, { duration: 200 });
    } else {
      return 1;
    }
  });

  const animatedHeaderPositionStyle = useAnimatedStyle(() => {
    return {
      top: interpolate(
        fillProgress.value,
        [0, 1],
        [16, 0],
      ),
      fontSize: interpolate(
        fillProgress.value,
        [0, 1],
        [16, 12],
      ),
    };
  });

  const animatedHeaderColorStyle = useAnimatedStyle(() => {
    return {
      color: interpolateColor(
        focusProgress.value,
        [0, 1],
        [colorInactive, colorActive],
      ),
    };
  });

  const animatedUnderlineStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        focusProgress.value,
        [0, 1],
        [colorInactive, colorActive],
      ),
    };
  });


  //
  const handleOnInputFocus = () => {
    setIsFocused(true);
  }

  const handleOnInputBlur = () => {
    setIsFocused(false);
  }

  const handleOnInputChange = (text: string) => {
    if (onChangeText) {
      onChangeText(text);
    }
  }

  //
  return (
    <Pressable style={{
      paddingTop: 12,
      height: 44,
    }}
    disabled={!(isEnabled && onPress)}
    onPress={(isEnabled && onPress) ? onPress : () => {}}>
      <Animated.Text style={[
        {
          position: 'absolute',
          left: 0,
        },
        animatedHeaderPositionStyle,
        animatedHeaderColorStyle,
      ]}>
        { header }
      </Animated.Text>
      
      <TextInput style={[
        {
          paddingTop: 4,
          paddingBottom: 4,
          paddingLeft: 0,
          paddingRight: 0,

          fontSize: 16,
          color: textColor,
        },
        style
      ]} 
      {...otherProps}
      editable={isEnabled ? editable : false}
      value={value}
      onChangeText={handleOnInputChange}
      onFocus={handleOnInputFocus} 
      onBlur={handleOnInputBlur} />

      <Animated.View style={[
        {
          height: 1,
          width: '100%',
          opacity: isEnabled ? 1 : 0,
        },
        animatedUnderlineStyle
      ]} />

    </Pressable>
  )

}
