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

definePageMeta({
  middleware: ['auth'] 
});

const songStore = useSongStore(); 


const audioRefs = ref([]); 
const audioClipTimeouts = []; 


const stopAllComparisonAudio = () => {
  audioRefs.value.forEach(audio => {
    if (audio) {
      audio.pause();      
      audio.currentTime = 0; 
    }
  });
  
  audioClipTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
  audioClipTimeouts.splice(0, audioClipTimeouts.length); 
};


onMounted(() => {
  songStore.fetchSongs()
});

onUnmounted(() => {
  stopAllComparisonAudio(); 
});
</script>

