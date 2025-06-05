<template>
  <div class="container mx-auto p-4 md:p-8 bg-white shadow-lg rounded-lg my-8 font-sans">
    <h1 class="text-3xl font-bold text-center text-gray-800 mb-6">Sound Prototype with Comparison Voting</h1>
    <p class="text-center text-gray-600 mb-8">
      Uploads save files to <code class="bg-gray-100 px-1 py-0.5 rounded text-sm text-purple-700">public/uploads</code> and metadata to <code class="bg-gray-100 px-1 py-0.5 rounded text-sm text-purple-700">data/songs.json</code>.
    </p>

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
        @click="uploadFile"
        :disabled="!selectedFile || uploading || !songTitle || !songArtist"
        class="py-2 px-6 rounded-md transition-colors duration-300
               text-white font-semibold w-full sm:w-auto self-center"
        :class="{
          'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2': !uploading && selectedFile && songTitle && songArtist,
          'bg-gray-400 cursor-not-allowed': uploading || !selectedFile || !songTitle || !songArtist
        }"
      >
        {{ uploading ? 'Uploading...' : 'Upload Song' }}
      </button>
    </div>

    <div
      v-if="uploadMessage"
      class="p-4 rounded-md text-center text-sm font-medium mb-8"
      :class="{
        'bg-green-100 text-green-700 border border-green-200': isSuccess,
        'bg-red-100 text-red-700 border border-red-200': !isSuccess
      }"
    >
      <p class="mb-2">{{ uploadMessage }}</p>
      <div v-if="uploadedSongDetails.filename">
        <p><strong class="font-bold">ID:</strong> {{ uploadedSongDetails.id }}</p>
        <p><strong class="font-bold">File:</strong> {{ uploadedSongDetails.filename }}</p>
        <p><strong class="font-bold">Title:</strong> {{ uploadedSongDetails.title }}</p>
        <p><strong class="font-bold">Artist:</strong> {{ uploadedSongDetails.artist }}</p>
        <p><strong class="font-bold">Likes:</strong> {{ uploadedSongDetails.likes }} | <strong class="font-bold">Dislikes:</strong> {{ uploadedSongDetails.dislikes }}</p>
        <p class="break-all"><strong class="font-bold">URL:</strong>
          <a :href="uploadedSongDetails.url" target="_blank" class="text-blue-600 hover:underline ml-1">{{ uploadedSongDetails.url }}</a>
        </p>
        <audio v-if="uploadedSongDetails.url" controls :src="uploadedSongDetails.url" class="w-full mt-4"></audio>
      </div>
    </div>

    <hr class="my-8 border-gray-200" />

    <div class="flex flex-col gap-4 mb-8 p-4 border border-gray-200 rounded-md bg-purple-50">
      <h2 class="text-xl font-semibold text-gray-700 mb-2 text-center">Compare Two Songs</h2>
      <button
        @click="getComparisonSongs"
        :disabled="gettingComparisonSongs"
        class="py-2 px-6 rounded-md transition-colors duration-300
               text-white font-semibold w-full sm:w-auto self-center"
        :class="{
          'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2': !gettingComparisonSongs,
          'bg-gray-400 cursor-not-allowed': gettingComparisonSongs
        }"
      >
        {{ gettingComparisonSongs ? 'Picking...' : 'Get Songs for Comparison' }}
      </button>

      <div v-if="comparisonDisplay.message" class="text-center text-sm font-medium mt-4 text-purple-700">
        {{ comparisonDisplay.message }}
      </div>

      <div v-if="comparisonDisplay.songs.length === 2" class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="p-4 border border-purple-200 rounded-md bg-purple-100 text-center">
          <h3 class="font-semibold text-gray-800 text-lg mb-1 break-words">{{ comparisonDisplay.songs[0].title }}</h3>
          <p class="text-gray-600 text-sm mb-2 italic">{{ comparisonDisplay.songs[0].artist }}</p>
          <audio controls :src="comparisonDisplay.songs[0].url" class="w-full mb-3"></audio>
          <p class="text-gray-700 text-sm">
            Likes: <span class="font-bold text-green-700">{{ comparisonDisplay.songs[0].likes }}</span> |
            Dislikes: <span class="font-bold text-red-700">{{ comparisonDisplay.songs[0].dislikes }}</span>
          </p>
          <button
            @click="handleComparisonVote(comparisonDisplay.songs[0].id, comparisonDisplay.songs[1].id)"
            class="mt-4 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            I Like This One!
          </button>
        </div>

        <div class="p-4 border border-purple-200 rounded-md bg-purple-100 text-center">
          <h3 class="font-semibold text-gray-800 text-lg mb-1 break-words">{{ comparisonDisplay.songs[1].title }}</h3>
          <p class="text-gray-600 text-sm mb-2 italic">{{ comparisonDisplay.songs[1].artist }}</p>
          <audio controls :src="comparisonDisplay.songs[1].url" class="w-full mb-3"></audio>
          <p class="text-gray-700 text-sm">
            Likes: <span class="font-bold text-green-700">{{ comparisonDisplay.songs[1].likes }}</span> |
            Dislikes: <span class="font-bold text-red-700">{{ comparisonDisplay.songs[1].dislikes }}</span>
          </p>
          <button
            @click="handleComparisonVote(comparisonDisplay.songs[1].id, comparisonDisplay.songs[0].id)"
            class="mt-4 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            I Like This One!
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const selectedFile = ref(null);
const songTitle = ref('');
const songArtist = ref('');
const uploadMessage = ref('');
const uploadedSongDetails = ref({});
const uploading = ref(false);
const isSuccess = ref(true);
const fileInput = ref(null);

const existingSongs = ref([]);
const loadingFiles = ref(true);

const comparisonDisplay = ref({ message: '', songs: [] }); // Now holds an array for two songs
const gettingComparisonSongs = ref(false);


const handleFileChange = (event) => {
  selectedFile.value = event.target.files[0];
};

const uploadFile = async () => {
  if (!selectedFile.value || !songTitle.value.trim() || !songArtist.value.trim()) {
    uploadMessage.value = 'Please select a file and provide a title and artist.';
    isSuccess.value = false;
    return;
  }

  uploading.value = true;
  uploadMessage.value = 'Uploading...';
  isSuccess.value = true;

  const formData = new FormData();
  formData.append('soundFile', selectedFile.value);
  formData.append('title', songTitle.value.trim());
  formData.append('artist', songArtist.value.trim());

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json();
      uploadMessage.value = data.message;
      uploadedSongDetails.value = data.song;
      isSuccess.value = true;

      await fetchExistingSongs(); // Refresh the list

      // Clear inputs
      selectedFile.value = null;
      songTitle.value = '';
      songArtist.value = '';
      if (fileInput.value) {
        fileInput.value.value = '';
      }

    } else {
      const errorData = await response.json();
      uploadMessage.value = `Upload failed: ${errorData.statusMessage || response.statusText}`;
      isSuccess.value = false;
      uploadedSongDetails.value = {};
    }
  } catch (error) {
    console.error('Error during upload:', error);
    uploadMessage.value = `An unexpected error occurred: ${error.message}`;
    isSuccess.value = false;
    uploadedSongDetails.value = {};
  } finally {
    uploading.value = false;
  }
};

const fetchExistingSongs = async () => {
  loadingFiles.value = true;
  try {
    const response = await fetch('/api/files');
    if (response.ok) {
      existingSongs.value = await response.json();
    } else {
      console.error('Failed to fetch existing songs:', response.statusText);
      existingSongs.value = [];
    }
  } catch (error) {
    console.error('Error fetching existing songs:', error);
    existingSongs.value = [];
  } finally {
    loadingFiles.value = false;
  }
};

// --- Single Like/Dislike (for All Uploaded Songs section) ---
const likeSong = async (songId) => {
  try {
    const response = await fetch(`/api/songs/${songId}/like`, { method: 'POST' });
    if (response.ok) {
      const data = await response.json();
      const index = existingSongs.value.findIndex(s => s.id === songId);
      if (index !== -1) {
        existingSongs.value[index].likes = data.song.likes;
      }
      console.log(`Liked song ${songId}. New likes: ${data.song.likes}`);
    } else {
      console.error(`Failed to like song ${songId}:`, response.statusText);
    }
  } catch (error) {
    console.error(`Error liking song ${songId}:`, error);
  }
};

const dislikeSong = async (songId) => {
  try {
    const response = await fetch(`/api/songs/${songId}/dislike`, { method: 'POST' });
    if (response.ok) {
      const data = await response.json();
      const index = existingSongs.value.findIndex(s => s.id === songId);
      if (index !== -1) {
        existingSongs.value[index].dislikes = data.song.dislikes;
      }
      console.log(`Disliked song ${songId}. New dislikes: ${data.song.dislikes}`);
    } else {
      console.error(`Failed to dislike song ${songId}:`, response.statusText);
    }
  } catch (error) {
    console.error(`Error disliking song ${songId}:`, error);
  }
};

// --- Comparison Logic ---
const getComparisonSongs = async () => {
  gettingComparisonSongs.value = true;
  comparisonDisplay.value = { message: 'Picking two random songs...', songs: [] };
  try {
    const response = await fetch('/api/songs/random'); // This now returns two songs
    if (response.ok) {
      const data = await response.json();
      if (data.songs && data.songs.length === 2) {
        comparisonDisplay.value = { message: data.message, songs: data.songs };
      } else {
        comparisonDisplay.value = { message: data.message || 'Not enough songs for comparison.', songs: [] };
      }
    } else {
      console.error('Failed to get comparison songs:', response.statusText);
      comparisonDisplay.value = { message: 'Failed to retrieve songs for comparison.', songs: [] };
    }
  } catch (error) {
    console.error('Error getting comparison songs:', error);
    comparisonDisplay.value = { message: `Error: ${error.message}`, songs: [] };
  } finally {
    gettingComparisonSongs.value = false;
  }
};

const handleComparisonVote = async (chosenSongId, unchosenSongId) => {
  comparisonDisplay.value.message = 'Recording your vote...';
  try {
    const response = await fetch('/api/songs/compare-vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chosenSongId, unchosenSongId }),
    });

    if (response.ok) {
      const data = await response.json();
      comparisonDisplay.value.message = data.message;
      // Optionally update the displayed comparison songs with new counts, or just clear
      comparisonDisplay.value.songs = []; // Clear for next comparison
      await fetchExistingSongs(); // Refresh the main list to show updated counts
    } else {
      const errorData = await response.json();
      comparisonDisplay.value.message = `Vote failed: ${errorData.statusMessage || response.statusText}`;
    }
  } catch (error) {
    console.error('Error recording comparison vote:', error);
    comparisonDisplay.value.message = `An unexpected error occurred during vote: ${error.message}`;
  }
};


const formatDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

onMounted(() => {
  fetchExistingSongs();
});
</script>