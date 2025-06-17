<template>
    <div>
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
          </div>
        </div>
      </div>
      <p v-else class="text-center text-gray-500 italic">No songs uploaded yet.</p>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useSongStore } from '~/store/songStore';
 
  const songStore = useSongStore(); 
  const calculateApprovalRate = (likes: number, dislikes: number) => {
    const totalVotes = likes + dislikes;
    if (totalVotes === 0) {
      return 'N/A'; 
    }
    const percentage = (likes / totalVotes) * 100;
    return percentage.toFixed(0); 
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };
  </script>
  