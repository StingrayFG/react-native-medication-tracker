import { TouchableOpacity, type ViewProps } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { useThemeColor } from '@/hooks/useThemeColor';


export type CustomButtonProps = ViewProps & {
  isEnabled?: boolean;
  type?: 'default' | 'option' | 'icon';
  onPress: () => void;
  lightColor?: string;
  darkColor?: string;
};

export function CustomButton({ 
  isEnabled = true,
  type = 'default',
  children, 
  onPress, 
  style, 
  lightColor, 
  darkColor, 
  ...otherProps 
}: CustomButtonProps) {
  
  const backgroundColor = type === 'default' ? useThemeColor({ light: lightColor, dark: darkColor }, 'button' ) : 'transparent';

  //
  const enabledProgress = useDerivedValue(() => {
    return withTiming(isEnabled ? 1 : 0, { duration: 200 });
  });

  const animatedOpacityStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        enabledProgress.value,
        [0, 1],
        [0.4, 1],
      ),
    };
  });


  return (
    <TouchableOpacity 
    onPress={isEnabled ? onPress : () => {}}
    disabled={!isEnabled}>
      <Animated.View style={[
        { backgroundColor },
        {
          padding: 8,
          alignItems: 'center', 
          justifyContent: 'center',  
          pointerEvents: isEnabled ? 'auto' : 'none',
        },
        animatedOpacityStyle,
        style, 
      ]}
      {...otherProps}>
        { children }
      </Animated.View>
    </TouchableOpacity>
  )
}
