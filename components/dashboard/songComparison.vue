<template>
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
  </template>
  
  <script setup lang="ts">
  import { ref, onUnmounted } from 'vue';
  import { useSongComparisonStore } from '~/store/songComparisonStore';
  
  const emit = defineEmits(['comparison-vote-recorded']);
  
  const songComparisonStore = useSongComparisonStore();
  
  const audioRefs = ref([]); 
  const audioClipTimeouts: any[] = []; 
  

  const setAudioRef = (index: number, el: never) => {
    audioRefs.value[index] = el;
  };
  const getComparisonSongs = async () => {
    stopAllComparisonAudio(); 
    await songComparisonStore.fetchRandomComparisonSongs();
  };
  
  const handleComparisonVote = async (chosenSongId: string, unchosenSongId: string) => {
    stopAllComparisonAudio(); 
    await songComparisonStore.recordComparisonVote(chosenSongId, unchosenSongId);
    
    emit('comparison-vote-recorded'); 
  };
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
  const playFullSong = (index: number) => {
    stopAllComparisonAudio(); 
    const audio = audioRefs.value[index];
    if (audio) {
      audio.currentTime = 0; 
      audio.play().catch(e => console.error("Error playing full song:", e));
    }
  };
  
  const playClip = (index: number, durationSeconds: number) => {
    stopAllComparisonAudio(); 
    const audio = audioRefs.value[index];
    if (audio) {
      audio.currentTime = 0; 
      audio.play().then(() => {
        const timeoutId = setTimeout(() => {
          audio.pause();
          audio.currentTime = 0; 
          console.log(`Clip ended for song ${index}`);
        }, durationSeconds * 1000); 
        audioClipTimeouts[index] = timeoutId; 
        const onPause = () => {
          clearTimeout(timeoutId);
          audio.removeEventListener('pause', onPause); 
          if (audioClipTimeouts[index] === timeoutId) {
            delete audioClipTimeouts[index]; 
          }
        };
        audio.addEventListener('pause', onPause);
  
      }).catch(e => console.error(`Error playing clip for song ${index}:`, e));
    }
  };
  
  onUnmounted(() => {
    stopAllComparisonAudio(); 
  });
  </script>
  