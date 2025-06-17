<template>
  <div class="container mx-auto p-4 md:p-8 bg-white shadow-lg rounded-lg my-8 font-sans">
    <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">Sound Prototype with Comparison Voting</h1>
    <p class="text-center text-gray-600 mb-8">
      Uploads save files to <code class="bg-gray-100 px-1 py-0.5 rounded text-sm text-purple-700">public/uploads</code> and metadata to Supabase Database.
    </p>
    <SongUploader />
    <hr class="my-8 border-gray-200" />
    <SongComparison />
    <hr class="my-8 border-gray-200" />
    <SongList />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useSongStore } from '~/store/songStore'; 
import SongUploader from '~/components/dashboard/songUploader.vue';
import SongComparison from '~/components/dashboard/songComparison.vue'
import SongList from '~/components/dashboard/songList.vue';
// Apply auth middleware to this page
definePageMeta({
  middleware: ['auth'] 
});

const songStore = useSongStore(); // This store manages fetching and displaying all songs


// --- Audio Playback Refs ---
const audioRefs = ref([]); // Array to hold references to the <audio> DOM elements for comparison songs
const audioClipTimeouts = []; // Array to store setTimeout IDs for managing 30-second clips

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

