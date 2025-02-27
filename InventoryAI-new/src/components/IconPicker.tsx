import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { IconButton, Text, Portal, Dialog } from 'react-native-paper';

const INVENTORY_ICONS = [
  'box', 'package', 'archive', 'cube', 'cube-outline', 'gift',
  'folder', 'briefcase', 'toolbox', 'tools',
  'home', 'office-building', 'garage', 'warehouse',
  'fridge', 'dresser', 'cabinet', 'drawer',
  'backpack', 'bag-personal', 'shopping',
  'car', 'car-side', 'truck', 'bike',
  'bookshelf', 'book', 'library',
  'food', 'food-apple', 'silverware',
  'tshirt', 'hanger', 'shoe-formal',
  'hammer', 'screwdriver', 'wrench',
];

interface IconPickerProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
  visible: boolean;
  onDismiss: () => void;
}

export function IconPicker({ selectedIcon, onSelectIcon, visible, onDismiss }: IconPickerProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Select Icon</Dialog.Title>
        <Dialog.Content>
          <ScrollView style={styles.scrollView}>
            <View style={styles.grid}>
              {INVENTORY_ICONS.map((icon) => (
                <TouchableOpacity
                  key={icon}
                  onPress={() => {
                    onSelectIcon(icon);
                    onDismiss();
                  }}
                  style={[
                    styles.iconButton,
                    selectedIcon === icon && styles.selectedIcon
                  ]}
                >
                  <IconButton icon={icon} size={24} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    maxHeight: 400,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  iconButton: {
    margin: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedIcon: {
    borderColor: '#2196F3',
    backgroundColor: '#f0f0f0',
  },
}); 