import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Dialog, Portal, Button } from 'react-native-paper';

const COLORS = [
  '#F44336', '#E91E63', '#9C27B0', '#673AB7',
  '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4',
  '#009688', '#4CAF50', '#8BC34A', '#CDDC39',
  '#FFEB3B', '#FFC107', '#FF9800', '#FF5722',
];

interface ColorPickerProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (color: string) => void;
  initialColor: string;
}

export default function ColorPicker({ visible, onDismiss, onSelect, initialColor }: ColorPickerProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Select Color</Dialog.Title>
        <Dialog.Content>
          <View style={styles.grid}>
            {COLORS.map(color => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorBox,
                  { backgroundColor: color },
                  color === initialColor && styles.selected
                ]}
                onPress={() => {
                  onSelect(color);
                  onDismiss();
                }}
              />
            ))}
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  colorBox: {
    width: 48,
    height: 48,
    margin: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selected: {
    borderWidth: 2,
    borderColor: '#000',
  },
}); 