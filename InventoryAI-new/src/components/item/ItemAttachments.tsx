import { View, StyleSheet, ScrollView, Image, Platform, ActivityIndicator } from 'react-native';
import { Text, IconButton, Button, Portal, Dialog, useTheme, ProgressBar } from 'react-native-paper';
import { useState, useEffect } from 'react';
import { ItemAttachment } from '../../types';
import { attachmentService } from '../../services/item/attachmentService';
import * as DocumentPicker from 'expo-document-picker';
import { compressImage } from '../../utils/imageCompression';
import { DragEvent } from 'react';

interface ItemAttachmentsProps {
  itemId: string;
  userId: string;
}

export function ItemAttachments({ itemId, userId }: ItemAttachmentsProps) {
  const theme = useTheme();
  const [attachments, setAttachments] = useState<ItemAttachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ItemAttachment | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [failedUpload, setFailedUpload] = useState<{
    file: File | Blob;
    error: string;
  } | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);

  useEffect(() => {
    loadAttachments();
  }, [itemId]);

  const loadAttachments = async () => {
    try {
      const data = await attachmentService.getAttachments(itemId);
      setAttachments(data);
    } catch (err) {
      console.error('Failed to load attachments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    setError(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        copyToCacheDirectory: true,
        multiple: false
      });

      if (result.type === 'success') {
        setPreviewImage(result.uri);
        setShowPreviewDialog(true);
      }
    } catch (err) {
      console.error('Failed to select file:', err);
      setError('Failed to select file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!previewImage) return;
    
    setUploading(true);
    setError(null);
    setUploadProgress(0);
    setFailedUpload(null);
    try {
      let file;
      if (Platform.OS === 'web') {
        const response = await fetch(previewImage);
        const blob = await response.blob();
        file = new File([blob], 'image.jpg', {
          type: 'image/jpeg'
        });
      } else {
        const response = await fetch(previewImage);
        const blob = await response.blob();
        file = blob;
      }

      const compressedFile = await compressImage(file);
      await attachmentService.uploadFile(
        compressedFile, 
        itemId, 
        userId,
        (progress) => setUploadProgress(progress)
      );
      await loadAttachments();
      setShowPreviewDialog(false);
      setPreviewImage(null);
    } catch (err) {
      console.error('Failed to upload file:', err);
      setError('Failed to upload file. Please try again.');
      setFailedUpload({
        file: file!,
        error: err instanceof Error ? err.message : 'Upload failed'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (attachment: ItemAttachment) => {
    try {
      await attachmentService.deleteAttachment(attachment);
      loadAttachments();
    } catch (err) {
      console.error('Failed to delete attachment:', err);
    }
  };

  const handleBatchDelete = async () => {
    setBatchLoading(true);
    try {
      const attachmentsToDelete = attachments.filter(a => 
        selectedAttachments.has(a.id)
      );
      await attachmentService.batchDeleteAttachments(attachmentsToDelete);
      await loadAttachments();
      setSelectionMode(false);
      setSelectedAttachments(new Set());
    } catch (err) {
      console.error('Failed to delete attachments:', err);
      setError('Failed to delete attachments. Please try again.');
    } finally {
      setBatchLoading(false);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setError('Please drop an image file');
      return;
    }

    setPreviewImage(URL.createObjectURL(file));
    setShowPreviewDialog(true);
  };

  const styles = StyleSheet.create({
    container: {
      marginTop: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    imageList: {
      flexGrow: 0,
    },
    imageContainer: {
      marginRight: 8,
    },
    thumbnail: {
      width: 100,
      height: 100,
      borderRadius: 8,
    },
    imageActions: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    imageDialog: {
      maxHeight: '90%',
      backgroundColor: 'transparent',
    },
    fullImage: {
      width: '100%',
      height: '100%',
    },
    loadingContainer: {
      padding: 16,
      alignItems: 'center',
    },
    errorText: {
      color: theme.colors.error,
      marginBottom: 8,
    },
    emptyText: {
      textAlign: 'center',
      fontStyle: 'italic',
      padding: 16,
      color: 'rgba(0, 0, 0, 0.5)',
    },
    previewImage: {
      width: '100%',
      height: 300,
      borderRadius: 8,
    },
    progressContainer: {
      marginTop: 16,
    },
    progressBar: {
      height: 6,
      borderRadius: 3,
    },
    progressText: {
      marginBottom: 8,
      textAlign: 'center',
    },
    webContainer: {
      position: 'relative',
      minHeight: 200,
      border: '2px dashed #ccc',
      borderRadius: 8,
      padding: 16,
    },
    dragging: {
      borderColor: theme.colors.primary,
      backgroundColor: `${theme.colors.primary}10`,
    },
    dropOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 6,
    },
    dropText: {
      color: '#fff',
      fontSize: 20,
      fontWeight: 'bold',
    },
  });

  return (
    <View 
      style={[
        styles.container,
        Platform.OS === 'web' && styles.webContainer,
        isDragging && styles.dragging
      ]}
      onDragEnter={Platform.OS === 'web' ? handleDragEnter : undefined}
      onDragLeave={Platform.OS === 'web' ? handleDragLeave : undefined}
      onDragOver={Platform.OS === 'web' ? handleDragOver : undefined}
      onDrop={Platform.OS === 'web' ? handleDrop : undefined}
    >
      {isDragging && Platform.OS === 'web' && (
        <View style={styles.dropOverlay}>
          <Text style={styles.dropText}>Drop image here</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text variant="titleMedium">Attachments</Text>
        <View style={styles.headerActions}>
          {selectionMode ? (
            <>
              <Button 
                onPress={() => {
                  setSelectionMode(false);
                  setSelectedAttachments(new Set());
                }}
              >
                Cancel
              </Button>
              <Button 
                onPress={handleBatchDelete}
                disabled={selectedAttachments.size === 0 || batchLoading}
                loading={batchLoading}
              >
                Delete Selected ({selectedAttachments.size})
              </Button>
            </>
          ) : (
            <>
              <Button 
                icon="select" 
                onPress={() => setSelectionMode(true)}
                disabled={attachments.length === 0}
              >
                Select
              </Button>
              <Button 
                icon="upload" 
                mode="outlined" 
                onPress={handleUpload}
                loading={uploading}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Add Image'}
              </Button>
            </>
          )}
        </View>
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator />
        </View>
      ) : attachments.length === 0 ? (
        <Text style={styles.emptyText}>No attachments yet</Text>
      ) : (
        <ScrollView horizontal style={styles.imageList}>
          {attachments.map(attachment => (
            <View key={attachment.id} style={styles.imageContainer}>
              <Image
                source={{ uri: attachment.file_url }}
                style={styles.thumbnail}
              />
              <View style={styles.imageActions}>
                <IconButton
                  icon="eye"
                  size={20}
                  onPress={() => setSelectedImage(attachment)}
                />
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => handleDelete(attachment)}
                  disabled={uploading}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Portal>
        <Dialog
          visible={!!selectedImage}
          onDismiss={() => setSelectedImage(null)}
          style={styles.imageDialog}
        >
          {selectedImage && (
            <Image
              source={{ uri: selectedImage.file_url }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </Dialog>
      </Portal>

      <Portal>
        <Dialog
          visible={showPreviewDialog}
          onDismiss={() => {
            setShowPreviewDialog(false);
            setPreviewImage(null);
          }}
        >
          <Dialog.Title>Preview Image</Dialog.Title>
          <Dialog.Content>
            {previewImage && (
              <View>
                <Image
                  source={{ uri: previewImage }}
                  style={styles.previewImage}
                  resizeMode="contain"
                />
                {uploading && (
                  <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                      Uploading: {Math.round(uploadProgress)}%
                    </Text>
                    <ProgressBar 
                      progress={uploadProgress / 100} 
                      style={styles.progressBar}
                    />
                  </View>
                )}
              </View>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button 
              onPress={() => {
                setShowPreviewDialog(false);
                setPreviewImage(null);
              }}
            >
              Cancel
            </Button>
            <Button 
              onPress={handleConfirmUpload}
              loading={uploading}
              disabled={uploading}
            >
              Upload
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Portal>
        <Dialog
          visible={!!failedUpload}
          onDismiss={() => setFailedUpload(null)}
        >
          <Dialog.Title>Upload Failed</Dialog.Title>
          <Dialog.Content>
            <Text>Failed to upload image: {failedUpload?.error}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setFailedUpload(null)}>Cancel</Button>
            <Button 
              onPress={async () => {
                if (failedUpload) {
                  setUploading(true);
                  try {
                    const compressedFile = await compressImage(failedUpload.file);
                    await attachmentService.uploadFile(
                      compressedFile,
                      itemId,
                      userId,
                      (progress) => setUploadProgress(progress)
                    );
                    await loadAttachments();
                    setFailedUpload(null);
                  } catch (err) {
                    console.error('Retry failed:', err);
                    setError('Retry failed. Please try again.');
                  } finally {
                    setUploading(false);
                  }
                }
              }}
              loading={uploading}
            >
              Retry
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
} 