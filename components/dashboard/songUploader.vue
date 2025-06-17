<template>
    <div>
      <!-- Upload New Song Section -->
      <div class="flex flex-col gap-4 mb-8 p-4 border border-gray-200 rounded-md bg-gray-50">
        <h2 class="text-xl font-semibold text-gray-700 mb-2">Upload New Song</h2>
        <input
          type="text"
          v-model="songTitle"
          placeholder="Song Title"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        <input
          type="text"
          v-model="songArtist"
          placeholder="Artist Name"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        <input
          type="file"
          @change="handleFileChange"
          accept="audio/*"
          ref="fileInput"
          class="block w-full text-sm text-gray-700
                 file:mr-4 file:py-2 file:px-4
                 file:rounded-full file:border-0
                 file:text-sm file:font-semibold
                 file:bg-blue-50 file:text-blue-700
                 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        />
        <button
          @click="initiateUpload"
          :disabled="!selectedFile || uploadStore.uploading || !songTitle || !songArtist"
          class="py-2 px-6 rounded-md transition-colors duration-300
                 text-white font-semibold w-full sm:w-auto self-center"
          :class="{
            'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2': !uploadStore.uploading && selectedFile && songTitle && songArtist,
            'bg-gray-400 cursor-not-allowed': uploadStore.uploading || !selectedFile || !songTitle || !songArtist
          }"
        >
          {{ uploadStore.uploading ? 'Uploading...' : 'Upload Song' }}
        </button>
      </div>
  
      <!-- Upload Message Display (moved into this component) -->
      <div
        v-if="uploadStore.uploadMessage"
        class="p-4 rounded-md text-center text-sm font-medium mb-8"
        :class="{
          'bg-green-100 text-green-700 border border-green-200': uploadStore.isSuccess,
          'bg-red-100 text-red-700 border border-red-200': !uploadStore.isSuccess
        }"
      >
        <p class="mb-2">{{ uploadStore.uploadMessage }}</p>
        <div v-if="uploadStore.uploadedSongDetails">
          <p><strong class="font-bold">ID:</strong> {{ uploadStore.uploadedSongDetails.id }}</p>
          <p><strong class="font-bold">File:</strong> {{ uploadStore.uploadedSongDetails.filename }}</p>
          <p><strong class="font-bold">Title:</strong> {{ uploadStore.uploadedSongDetails.title }}</p>
          <p><strong class="font-bold">Artist:</strong> {{ uploadStore.uploadedSongDetails.artist }}</p>
          <p><strong class="font-bold">Likes:</strong> {{ uploadStore.uploadedSongDetails.likes }} | <strong class="font-bold">Dislikes:</strong> {{ uploadStore.uploadedSongDetails.dislikes }}</p>
          <p class="break-all"><strong class="font-bold">URL:</strong>
            <a :href="uploadStore.uploadedSongDetails.url" target="_blank" class="text-blue-600 hover:underline ml-1">{{ uploadStore.uploadedSongDetails.url }}</a>
          </p>
          <audio v-if="uploadStore.uploadedSongDetails.url" controls :src="uploadStore.uploadedSongDetails.url" class="w-full mt-4"></audio>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useAuthStore } from '~/store/authStore'; // For debugging logs, optional
  import { useUploadStore } from '~/store/uploadStore'; // Core upload logic
  
  // Define component emits
  const emit = defineEmits(['upload-success']);
  
  // --- Stores ---
  const authStore = useAuthStore(); // Used here for debugging logs about user ID
  const uploadStore = useUploadStore(); // Manages upload state and logic
  
  // --- Component Local States ---
  const selectedFile = ref(null);
  const songTitle = ref('');
  const songArtist = ref('');
  const fileInput = ref(null); // Reference to the file input DOM element
  
  // Event handler for when a file is selected
  const handleFileChange = (event) => {
    selectedFile.value = event.target.files[0];
  };
  
  // Initiates the song upload process
  const initiateUpload = async () => {
    // Log authentication status for debugging (can be removed in production)
    console.log('Initiating upload from SongUploader: Authenticated User:', authStore.authenticatedUser.value);
    console.log('Initiating upload from SongUploader: Supabase User ID:', authStore.user ? authStore.user.value?.id : 'N/A');
  
    // Call the uploadStore's main action to handle file upload and metadata saving
    const success = await uploadStore.uploadSong(selectedFile.value, songTitle.value, songArtist.value);
    
    if (success) {
      // Emit an event to the parent component on successful upload
      emit('upload-success');
  
      // Clear form inputs after a successful upload
      selectedFile.value = null;
      songTitle.value = '';
      songArtist.value = '';
      if (fileInput.value) {
        fileInput.value.value = ''; // Resets the file input field
      }
    }
  };
  </script>
  