import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid';
import { useAuthStore } from '~/store/authStore'; 
import { useSupabaseUser } from '#imports'; // Import useSupabaseUser for direct access

// Define the TypeScript interface for your Song table structure
// This helps TypeScript understand the data being inserted and retrieved.
interface Song {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  filename: string;
  url: string;
  likes: number;
  dislikes: number;
  created_at: string; // Add if you have this column
}

export const useUploadStore = defineStore('uploadStore', () => {
  const authStore = useAuthStore(); 
  const supabase = authStore.supabase; // Supabase client from authStore
  const user = useSupabaseUser();     // Reactive user ref from @nuxtjs/supabase module

  const uploading = ref(false)
  const uploadMessage = ref('')
  const isSuccess = ref(true)
  const uploadedSongDetails = ref<Song | null>(null) // Use the Song interface here

  /**
   * Initiates the song upload process.
   * This function uploads the file directly to Supabase Storage
   * and then inserts the metadata into the Supabase Database.
   * @param file The File object to upload.
   * @param title The title of the song.
   * @param artist The artist of the song.
   */
  const uploadSong = async (file: File, title: string, artist: string) => {
    // Frontend validation for inputs
    if (!file || !title.trim() || !artist.trim()) {
      uploadMessage.value = 'Please select a file and provide a title and artist.';
      isSuccess.value = false;
      return false;
    }

    uploading.value = true;
    uploadMessage.value = 'Checking user session...';
    isSuccess.value = true;

    // --- Robust User Availability Check ---
    let attempts = 0;
    const maxAttempts = 20; // Increase attempts to 2 seconds (20 * 100ms)
    while (!user.value && attempts < maxAttempts) {
        console.log(`UploadStore: Waiting for user (attempt ${attempts + 1}/${maxAttempts})... Current user.value:`, user.value);
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait 100ms
        attempts++;
    }

    if (!user.value) { 
        uploadMessage.value = 'User session not fully active. Please try logging in again or refresh the page.';
        isSuccess.value = false;
        console.error('UploadStore: Upload failed after waiting: Supabase user object is still missing.', user.value);
        uploading.value = false;
        return false;
    }
    // --- End Robust User Availability Check ---

    console.log('UploadStore: User ID confirmed:', user.value.id);
    uploadMessage.value = 'Uploading file to storage...';

    try {
      const fileExtension = file.name.split('.').pop();
      const songDbId = uuidv4(); 
      const storagePath = `songs/${songDbId}.${fileExtension}`; 

      // 1. Upload file directly to Supabase Storage from the client
      const { data: storageData, error: storageError } = await supabase.storage
        .from('song-audio') 
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type || 'application/octet-stream',
        });

      if (storageError) {
        console.error('UploadStore: Supabase Storage upload error:', storageError.message);
        uploadMessage.value = `Failed to upload file to storage: ${storageError.message}`;
        isSuccess.value = false;
        uploadedSongDetails.value = null;
        return false;
      }

      const publicFileUrl = supabase.storage
        .from('song-audio')
        .getPublicUrl(storagePath).data.publicUrl;

      console.log('UploadStore: File successfully uploaded to Supabase Storage:', publicFileUrl);
      uploadMessage.value = 'File uploaded. Saving metadata...';

      // 2. Insert metadata directly into Supabase Database from the client
      // Cast the 'from' method to help TypeScript infer the correct type for 'insert'
      const { data: dbData, error: dbError } = await supabase
        .from('songs').insert(
          {
            id: songDbId, 
            user_id: user.value.id, 
            title: title,
            artist: artist,
            filename: file.name,
            url: publicFileUrl,
            likes: 0,
            dislikes: 0,
            // created_at will be handled by default value in Supabase
          }, // <--- Cast the object to Song interface
        )

      if (dbError) {
        console.error('UploadStore: Supabase DB insert error (metadata):', dbError.message);
        uploadMessage.value = `Failed to save metadata: ${dbError.message}`;
        isSuccess.value = false;
        uploadedSongDetails.value = null;
        // Optionally, if metadata saving fails, you might want to delete the file from storage
        // await supabase.storage.from('song-audio').remove([storagePath]);
        return false;
      }

      uploadedSongDetails.value = dbData; 
      uploadMessage.value = 'File and metadata saved successfully!';
      isSuccess.value = true;
      return true;
    } catch (error: any) {
      console.error('UploadStore: Error during upload process:', error);
      uploadMessage.value = `An unexpected error occurred: ${error.message}`;
      isSuccess.value = false;
      uploadedSongDetails.value = null;
      return false;
    } finally {
      uploading.value = false;
    }
  };

  const clearUploadStatus = () => {
    uploadMessage.value = '';
    isSuccess.value = true;
    uploadedSongDetails.value = null;
  };

  return {
    uploading,
    uploadMessage,
    isSuccess,
    uploadedSongDetails,
    uploadSong,
    clearUploadStatus,
  };
});
