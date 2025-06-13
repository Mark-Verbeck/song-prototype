// stores/songComparisonStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from '~/store/authStore'; 

// Define Song interface if not already globally defined
interface Song {
  id: string;
  user_id: string;
  title: string;
  artist: string;
  filename: string;
  url: string;
  likes: number;
  dislikes: number;
  created_at: string;
}

export const useSongComparisonStore = defineStore('songComparisonStore', () => {
  const authStore = useAuthStore(); // Access authStore for Supabase client
  const supabase = authStore.supabase; // Get the Supabase client instance

  const comparisonSongs = ref<Song[]>([]); // Stores the two songs for comparison
  const comparisonMessage = ref(''); // Message for the comparison section
  const loadingComparison = ref(false); // Loading state

  /**
   * Fetches two random songs for comparison from the Supabase database.
   */
  const fetchRandomComparisonSongs = async () => {
    loadingComparison.value = true;
    comparisonMessage.value = 'Picking two random songs...';
    comparisonSongs.value = []; // Clear previous songs

    try {
      // Use ORDER BY RANDOM() for simple random selection.
      // This is efficient enough for small to medium tables.
      const { data: songs, error } = await supabase
        .from('songs')
        .select('*')
        .order(Math.random() > 0.5 ? 'id' : 'created_at', { ascending: Math.random() > 0.5 }) // Simple way to encourage index usage or not
        .limit(2);

      // Fallback for random order (might be slow for large tables)
      // .order('random') // Not a standard Postgrest function directly, needs custom RPC or UUID trick
      // A common trick is to order by a random UUID:
      // const { data: songs, error } = await supabase
      //   .from('songs')
      //   .select('*')
      //   .order('gen_random_uuid()') // Requires pg_crypto extension enabled in Supabase DB
      //   .limit(2);

      if (error) {
        console.error('Supabase fetch random songs error:', error.message);
        comparisonMessage.value = `Failed to retrieve songs: ${error.message}`;
        return;
      }

      if (!songs || songs.length < 2) {
        comparisonMessage.value = `Need at least 2 songs for comparison. Only ${songs.length} available.`;
        return;
      }

      comparisonSongs.value = songs as Song[]; // Cast to Song[]
      comparisonMessage.value = 'Two random songs retrieved for comparison!';

    } catch (error: any) {
      console.error('Error fetching random songs:', error.message);
      comparisonMessage.value = `An unexpected error occurred: ${error.message}`;
    } finally {
      loadingComparison.value = false;
    }
  };

  /**
   * Handles the comparison vote, updating likes/dislikes in the database.
   * @param chosenSongId The ID of the song the user liked.
   * @param unchosenSongId The ID of the song the user disliked.
   */
  const recordComparisonVote = async (chosenSongId: string, unchosenSongId: string) => {
    comparisonMessage.value = 'Recording your vote...';
    
    try {
      // Fetch current likes/dislikes (less ideal for high concurrency but simple)
      const { data: songsToUpdate, error: fetchError } = await supabase
        .from('songs')
        .select('id, likes, dislikes')
        .in('id', [chosenSongId, unchosenSongId]);

      if (fetchError || !songsToUpdate || songsToUpdate.length !== 2) {
        console.error('Failed to fetch songs for vote update:', fetchError?.message);
        comparisonMessage.value = 'Failed to record vote: Could not retrieve song data.';
        return;
      }

      const chosenSong = songsToUpdate.find(s => s.id === chosenSongId);
      const unchosenSong = songsToUpdate.find(s => s.id === unchosenSongId);

      if (!chosenSong || !unchosenSong) {
        console.error('Chosen or unchosen song not found after fetch for vote.');
        comparisonMessage.value = 'Failed to record vote: Song data mismatch.';
        return;
      }

      // Perform updates
      const { error: chosenError } = await supabase
        .from('songs')
        .update({ likes: (chosenSong.likes || 0) + 1 })
        .eq('id', chosenSongId);

      const { error: unchosenError } = await supabase
        .from('songs')
        .update({ dislikes: (unchosenSong.dislikes || 0) + 1 })
        .eq('id', unchosenSongId);

      if (chosenError || unchosenError) {
        console.error('Error updating song counts:', chosenError?.message, unchosenError?.message);
        comparisonMessage.value = `Failed to record vote: ${chosenError?.message || unchosenError?.message}`;
        return;
      }

      comparisonMessage.value = 'Vote recorded successfully!';
      comparisonSongs.value = []; // Clear for next comparison
      // The calling component (dashboard) should re-fetch all songs to update the main list
      
    } catch (error: any) {
      console.error('Error recording comparison vote:', error.message);
      comparisonMessage.value = `An unexpected error occurred: ${error.message}`;
    }
  };

  /**
   * Clears the current comparison display.
   */
  const clearComparison = () => {
    comparisonSongs.value = [];
    comparisonMessage.value = '';
  };

  return {
    comparisonSongs,
    comparisonMessage,
    loadingComparison,
    fetchRandomComparisonSongs,
    recordComparisonVote,
    clearComparison,
  };
});