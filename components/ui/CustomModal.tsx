import { Modal, type ModalProps, View } from 'react-native';


export type CustomModalProps = ModalProps & {
  lightColor?: string;
  darkColor?: string;
};

export function CustomModal({ 
  children, 
  style, 
  lightColor, 
  darkColor, 
  ...otherProps 
}: CustomModalProps) {

  return (
  <Modal statusBarTranslucent={true}
  animationType={'fade'}
  transparent={true}
  {...otherProps}>

    <View style={{
      height: '100%',
      width: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      alignItems: 'center', 
      justifyContent: 'center',
    }}>
      { children }
    </View>

  </Modal>
  )
}
