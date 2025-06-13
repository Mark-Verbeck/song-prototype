<template>
  <div class="container mx-auto p-4 md:p-8 bg-white shadow-lg rounded-lg my-8 font-sans">
    <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">Sound Prototype with Comparison Voting</h1>
    <p class="text-center text-gray-600 mb-8">
      Uploads save files to <code class="bg-gray-100 px-1 py-0.5 rounded text-sm text-purple-700">public/uploads</code> and metadata to Supabase Database.
    </p>

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

    <!-- Upload Message Display -->
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

    <hr class="my-8 border-gray-200" />

    <div class="flex flex-col gap-4 mb-8 p-4 border border-gray-200 rounded-md bg-purple-50">
      <h2 class="text-xl font-semibold text-gray-700 mb-2 text-center">Compare Two Songs</h2>
      <button
        type="button"
        @click="getComparisonSongs"
        :disabled="songComparisonStore.loadingComparison"
        class="py-2 px-6 rounded-md transition-colors duration-300
               text-white font-semibold w-full sm:w-auto self-center"
        :class="{
          'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2': !songComparisonStore.loadingComparison,
          'bg-gray-400 cursor-not-allowed': songComparisonStore.loadingComparison
        }"
      >
        {{ songComparisonStore.loadingComparison ? 'Picking...' : 'Get Songs for Comparison' }}
      </button>

      <div v-if="songComparisonStore.comparisonMessage" class="text-center text-sm font-medium mt-4 text-purple-700">
        {{ songComparisonStore.comparisonMessage }}
      </div>

      <div v-if="songComparisonStore.comparisonSongs.length === 2" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Song 1 -->
        <div class="p-4 border border-purple-200 rounded-md bg-purple-100 text-center flex flex-col justify-between">
          <div>
            <h3 class="font-semibold text-gray-800 text-lg mb-1 break-words">{{ songComparisonStore.comparisonSongs[0].title }}</h3>
            <p class="text-gray-600 text-sm mb-2 italic">{{ songComparisonStore.comparisonSongs[0].artist }}</p>
            <audio controls :src="songComparisonStore.comparisonSongs[0].url" class="w-full mb-3" :ref="el => setAudioRef(0, el)"></audio>
            <div class="flex justify-center gap-2 mb-3">
                <button type="button" @click="playFullSong(0)" class="py-1 px-3 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">Play Full</button>
                <button type="button" @click="playClip(0, 30)" class="py-1 px-3 bg-indigo-500 text-white rounded-md text-sm hover:bg-indigo-600">Play 30s Clip</button>
            </div>
            <p class="text-gray-700 text-sm">
              Likes: <span class="font-bold text-green-700">{{ songComparisonStore.comparisonSongs[0].likes }}</span> |
              Dislikes: <span class="font-bold text-red-700">{{ songComparisonStore.comparisonSongs[0].dislikes }}</span>
            </p>
          </div>
          <button
            type="button"
            @click="handleComparisonVote(songComparisonStore.comparisonSongs[0].id, songComparisonStore.comparisonSongs[1].id)"
            class="mt-4 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            I Like This One!
          </button>
        </div>

        <!-- Song 2 -->
        <div class="p-4 border border-purple-200 rounded-md bg-purple-100 text-center flex flex-col justify-between">
          <div>
            <h3 class="font-semibold text-gray-800 text-lg mb-1 break-words">{{ songComparisonStore.comparisonSongs[1].title }}</h3>
            <p class="text-gray-600 text-sm mb-2 italic">{{ songComparisonStore.comparisonSongs[1].artist }}</p>
            <audio controls :src="songComparisonStore.comparisonSongs[1].url" class="w-full mb-3" :ref="el => setAudioRef(1, el)"></audio>
            <div class="flex justify-center gap-2 mb-3">
                <button type="button" @click="playFullSong(1)" class="py-1 px-3 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">Play Full</button>
                <button type="button" @click="playClip(1, 30)" class="py-1 px-3 bg-indigo-500 text-white rounded-md text-sm hover:bg-indigo-600">Play 30s Clip</button>
            </div>
            <p class="text-gray-700 text-sm">
              Likes: <span class="font-bold text-green-700">{{ songComparisonStore.comparisonSongs[1].likes }}</span> |
              Dislikes: <span class="font-bold text-red-700">{{ songComparisonStore.comparisonSongs[1].dislikes }}</span>
            </p>
          </div>
          <button
            type="button"
            @click="handleComparisonVote(songComparisonStore.comparisonSongs[1].id, songComparisonStore.comparisonSongs[0].id)"
            class="mt-4 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            I Like This One!
          </button>
        </div>
      </div>
    </div>

    <hr class="my-8 border-gray-200" />

    <h2 class="text-2xl font-bold text-center text-gray-700 mb-6">All Uploaded Songs</h2>
    <div v-if="songStore.loadingSongs" class="text-center text-gray-500">Loading songs...</div>
    <div v-else-if="songStore.songs.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
      <div v-for="song in songStore.songs" :key="song.id" class="border border-gray-200 rounded-lg p-4 text-center bg-gray-50 shadow-sm flex flex-col justify-between">
        <div>
          <h3 class="font-semibold text-gray-800 text-lg mb-1 break-words">{{ song.title }}</h3>
          <p class="text-gray-600 text-sm mb-2 italic">{{ song.artist }}</p>
          <audio controls :src="song.url" class="w-full mb-3"></audio>
          <p class="text-gray-700 text-sm">
            Total Votes: {{ song.likes + song.dislikes }} | 
            Approval: <span :class="{'text-green-700': calculateApprovalRate(song.likes, song.dislikes) >= 70, 'text-red-700': calculateApprovalRate(song.likes, song.dislikes) < 50}">
              {{ calculateApprovalRate(song.likes, song.dislikes) }}%
            </span>
          </p>
          <p class="text-xs text-gray-500 mt-2">Uploaded: {{ formatDate(song.created_at) }}</p>
          <!-- Removed ID line -->
        </div>
        <!-- Removed Like/Dislike buttons div -->
        <!-- Removed Download link -->
      </div>
    </div>
    <p v-else class="text-center text-gray-500 italic">No songs uploaded yet.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '~/store/authStore'; 
import { useUploadStore } from '~/store/uploadStore'; 
import { useSongComparisonStore } from '~/store/songComparisonStore'; 
import { useSongStore } from '~/store/songStore'; 

// Apply auth middleware to this page
definePageMeta({
  middleware: ['auth'] 
});

// --- Stores ---
// Initialize Pinia stores for use in this component
const authStore = useAuthStore(); 
const uploadStore = useUploadStore();
const songComparisonStore = useSongComparisonStore(); 
const songStore = useSongStore(); // This store manages fetching and displaying all songs

// --- Upload Section States (managed by uploadStore primarily) ---
const selectedFile = ref(null); // The file selected by the user
const songTitle = ref('');      // Input for song title
const songArtist = ref('');     // Input for song artist
const fileInput = ref(null);    // Reference to the file input element for clearing it

// --- Audio Playback Refs ---
const audioRefs = ref([]); // Array to hold references to the <audio> DOM elements for comparison songs
const audioClipTimeouts = []; // Array to store setTimeout IDs for managing 30-second clips

// Helper function to set audio element references for comparison players
const setAudioRef = (index, el) => {
  audioRefs.value[index] = el;
};

// Event handler for when a file is selected for upload
const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
};

// Initiates the song upload process by calling the uploadStore's action
const initiateUpload = async () => {
  // Log current authentication status for debugging purposes
  console.log('Initiating upload: Authenticated User:', authStore.authenticatedUser.value);
  console.log('Initiating upload: Supabase User ID (from authStore):', authStore.user ? authStore.user.value?.id : 'N/A');

  // Call the uploadStore's main action to handle file upload and metadata saving
  const success = await uploadStore.uploadSong(selectedFile.value, songTitle.value, songArtist.value);
  
  if (success) {
    // No need to explicitly call songStore.fetchSongs() here.
    // The songStore's Realtime subscription will automatically update the list
    // when the new song is inserted into the database.

    // Clear form inputs after a successful upload
    selectedFile.value = null;
    songTitle.value = '';
    songArtist.value = '';
    if (fileInput.value) {
      fileInput.value.value = ''; // Resets the file input field
    }
  }
};

// Initiates fetching two random songs for comparison via the songComparisonStore
const getComparisonSongs = async () => {
  stopAllComparisonAudio(); // Stop any currently playing audio before fetching new songs
  await songComparisonStore.fetchRandomComparisonSongs();
};

// Handles a comparison vote by calling the songComparisonStore's action
const handleComparisonVote = async (chosenSongId, unchosenSongId) => {
  stopAllComparisonAudio(); // Stop audio before recording the vote
  await songComparisonStore.recordComparisonVote(chosenSongId, unchosenSongId);
  // No need to explicitly call songStore.fetchSongs() here.
  // The songStore's Realtime subscription will automatically update the approval rates
  // when the song records are updated in the database by recordComparisonVote.
};

// --- Audio Playback Logic (Component-specific, interacts with DOM refs) ---

// Stops all currently playing comparison audio clips and clears any timeouts
const stopAllComparisonAudio = () => {
  audioRefs.value.forEach(audio => {
    if (audio) {
      audio.pause();      // Pause playback
      audio.currentTime = 0; // Reset to beginning
    }
  });
  // Clear any active setTimeout instances that were managing 30-second clips
  audioClipTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
  audioClipTimeouts.splice(0, audioClipTimeouts.length); // Clear the array
};

// Plays the full duration of a selected comparison song
const playFullSong = (index) => {
  stopAllComparisonAudio(); // Stop other audio first
  const audio = audioRefs.value[index];
  if (audio) {
    audio.currentTime = 0; // Ensure playback starts from the beginning
    audio.play().catch(e => console.error("Error playing full song:", e));
  }
};

// Plays a 30-second clip of a selected comparison song
const playClip = (index, durationSeconds) => {
  stopAllComparisonAudio(); // Stop other audio first
  const audio = audioRefs.value[index];
  if (audio) {
    audio.currentTime = 0; // Ensure playback starts from the beginning
    audio.play().then(() => {
      // Set a timeout to automatically pause the audio after the specified duration
      const timeoutId = setTimeout(() => {
        audio.pause();
        audio.currentTime = 0; // Reset after clip ends
        console.log(`Clip ended for song ${index}`);
      }, durationSeconds * 1000); // Convert seconds to milliseconds
      audioClipTimeouts[index] = timeoutId; // Store timeout ID for later clearing

      // Add an event listener to clear the timeout if the user manually pauses
      const onPause = () => {
        clearTimeout(timeoutId);
        audio.removeEventListener('pause', onPause); // Remove listener to prevent memory leaks
        // Clean up the timeout ID from the array if paused early
        if (audioClipTimeouts[index] === timeoutId) {
          delete audioClipTimeouts[index]; 
        }
      };
      audio.addEventListener('pause', onPause);

    }).catch(e => console.error(`Error playing clip for song ${index}:`, e));
  }
};

// Helper function to calculate the approval rate percentage
const calculateApprovalRate = (likes, dislikes) => {
  const totalVotes = likes + dislikes;
  if (totalVotes === 0) {
    return 'N/A'; // If no votes, display N/A
  }
  const percentage = (likes / totalVotes) * 100;
  return percentage.toFixed(0); // Return percentage rounded to a whole number
};

// Helper function to format ISO date strings for display
const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

// --- Lifecycle Hooks ---

// Runs when the component is mounted to the DOM
onMounted(() => {
  songStore.fetchSongs()
  // Initial fetch of songs is now handled by the watch(currentUser, ...) in songStore.
  // The immediate: true on that watcher ensures songs are fetched as soon as user is available.
  // songStore.fetchSongs(); // This line can be commented out or removed as it's redundant
});

// Runs when the component is unmounted from the DOM
onUnmounted(() => {
  stopAllComparisonAudio(); // Clean up any active audio playback
});
</script>

