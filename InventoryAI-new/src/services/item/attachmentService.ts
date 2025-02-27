import { supabase } from '../../config/supabase';
import { ItemAttachment } from '../../types';
import { validateFile } from '../../utils/fileValidation';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

// Add progress callback type
type ProgressCallback = (progress: number) => void;

export const attachmentService = {
  async getAttachments(itemId: string): Promise<ItemAttachment[]> {
    const { data, error } = await supabase
      .from('item_attachments')
      .select('*')
      .eq('item_id', itemId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async uploadFile(
    file: File | Blob,
    itemId: string,
    userId: string,
    onProgress?: ProgressCallback
  ): Promise<string> {
    try {
      console.log('Starting upload process...', {
        fileSize: file.size,
        fileType: file.type,
        fileName: file instanceof File ? file.name : 'blob'
      });

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Sanitize filename and create unique name
      const timestamp = Date.now();
      const originalName = file instanceof File ? file.name : `${timestamp}.jpg`;
      const sanitizedName = originalName
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, '_'); // Replace special chars with underscore
      
      const fileName = `${timestamp}_${sanitizedName}`;
      const filePath = `${userId}/${itemId}/${fileName}`;

      console.log('Uploading with path:', filePath);

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('item-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      console.log('File uploaded successfully', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('item-attachments')
        .getPublicUrl(uploadData.path);

      console.log('Public URL:', publicUrl);

      // Update item with new image URL
      const { error: updateError } = await supabase
        .from('items')
        .update({ 
          image_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (updateError) {
        console.error('Update error:', updateError);
        throw new Error('Failed to update item with image URL');
      }

      // Create attachment record
      const { error: attachmentError } = await supabase
        .from('item_attachments')
        .insert({
          item_id: itemId,
          file_url: publicUrl,
          file_type: file.type,
          file_name: fileName,
          created_by: userId,
          created_at: new Date().toISOString()
        });

      if (attachmentError) {
        console.error('Attachment record error:', attachmentError);
        throw new Error('Failed to create attachment record');
      }

      return publicUrl;
    } catch (error) {
      console.error('Upload process failed:', error);
      throw error;
    }
  },

  async deleteAttachment(attachment: ItemAttachment): Promise<void> {
    // Extract file path from URL
    const urlParts = attachment.file_url.split('/');
    const filePath = urlParts[urlParts.length - 1];

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('attachments')
      .remove([`items/${attachment.item_id}/${filePath}`]);

    if (storageError) throw storageError;

    // Delete attachment record
    const { error } = await supabase
      .from('item_attachments')
      .delete()
      .eq('id', attachment.id);

    if (error) throw error;
  },

  async batchDeleteAttachments(attachments: ItemAttachment[]): Promise<void> {
    // Group attachments by item_id for efficient deletion
    const groupedAttachments = attachments.reduce((acc, attachment) => {
      const itemId = attachment.item_id;
      if (!acc[itemId]) acc[itemId] = [];
      acc[itemId].push(attachment);
      return acc;
    }, {} as Record<string, ItemAttachment[]>);

    // Delete attachments in parallel, grouped by item
    await Promise.all(
      Object.entries(groupedAttachments).map(async ([itemId, itemAttachments]) => {
        // Delete files from storage
        const filePaths = itemAttachments.map(attachment => {
          const urlParts = attachment.file_url.split('/');
          return `items/${itemId}/${urlParts[urlParts.length - 1]}`;
        });

        await supabase.storage
          .from('attachments')
          .remove(filePaths);

        // Delete records from database
        const attachmentIds = itemAttachments.map(a => a.id);
        await supabase
          .from('item_attachments')
          .delete()
          .in('id', attachmentIds);
      })
    );
  }
}; 