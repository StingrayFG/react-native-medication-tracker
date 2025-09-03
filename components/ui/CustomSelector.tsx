import { Picker } from '@react-native-picker/picker';
import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

type Option = {
  label: string,
  code: number,
}

export type CustomSelectorProps = ViewProps & {
  isEnabled?: boolean;
  header: string;
  options: Array<Option>;
  selectedOption: Option,
  onSelectOption: (arg: Option) => void;
  lightColor?: string;
  darkColor?: string;
};

export function CustomSelector({
  isEnabled = true,
  header,
  options,
  selectedOption,
  onSelectOption,
  style, 
  lightColor, 
  darkColor, 
  ...otherProps 
}: CustomSelectorProps) {
  
  const colorInactive = useThemeColor({ light: lightColor, dark: darkColor }, 'inputInactive');
  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'inputText');

  return (
    <View style={{
      height: 44,
    }}>
      <ThemedText style={{
        position: 'absolute',
        left: 0,
        top: -3,
        color: colorInactive,
        fontSize: 12,
      }}>
        { header }
      </ThemedText>
      
      {isEnabled ?
        <Picker style={{
          marginBottom: -12,
          marginLeft: -8,
          marginRight: -8,

          fontSize: 16,
          lineHeight: 24,
          color: textColor,
        }}
        selectedValue={selectedOption.label}
        onValueChange={(option, index) => onSelectOption(options[index])}
        {...otherProps}>
          {options.map((option, index) => 
            <Picker.Item key={'option-' + header + '-' + index} 
            label={option.label} 
            value={option.label} />
          )}
        </Picker>
        :
        <ThemedText style={{
          marginTop: 15.8,

          fontSize: 16,
          lineHeight: 24,
          color: textColor,
        }}>
          { selectedOption.label }
        </ThemedText>
      }

      <ThemedView style={{
        height: 1,
        width: '100%',
        opacity: isEnabled ? 1 : 0,
        backgroundColor: colorInactive,
      }} />
    </View>
  )
}
