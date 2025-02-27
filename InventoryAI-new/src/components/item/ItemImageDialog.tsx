import { View, StyleSheet } from 'react-native';
import { Dialog, Portal, Button } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { attachmentService } from '../../services/item/attachmentService';

interface ItemImageDialogProps {
  visible: boolean;
  onDismiss: () => void;
  itemId: string;
  userId: string;
  onImageUploaded: () => void;
}

export function ItemImageDialog({ visible, onDismiss, itemId, userId, onImageUploaded }: ItemImageDialogProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setUploading(true);
        
        // Create a File object from the URI
        const response = await fetch(result.uri);
        const blob = await response.blob();
        const file = new File([blob], result.name, { type: result.mimeType });

        await attachmentService.uploadFile(
          file,
          itemId,
          userId
        );
        
        onImageUploaded();
        onDismiss();
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Add Image</Dialog.Title>
        <Dialog.Content>
          <Button
            mode="contained"
            onPress={handleUpload}
            loading={uploading}
            disabled={uploading}
            style={styles.button}
          >
            Select Image
          </Button>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  button: {
    marginVertical: 8,
  },
}); 