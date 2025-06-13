// stores/songStore.ts
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useAuthStore } from '~/store/authStore'; 

// Define Song interface (ensure consistency across stores if defined elsewhere)
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

export const useSongStore = defineStore('songStore', () => {
  const authStore = useAuthStore(); 
  const supabase = authStore.supabase; 
  const currentUser = authStore.user; 

  const songs = ref<Song[]>([]); 
  const loadingSongs = ref(true); 

  // Variable to hold the Realtime channel subscription
  let songsChannel: any | null = null; 

  /**
   * Fetches songs from the Supabase database.
   * If a user is authenticated, it fetches only their songs.
   */
  const fetchSongs = async () => {
    loadingSongs.value = true;
    songs.value = []; // Clear current songs before fetching

    if (!currentUser) {
      console.warn('SongStore: No authenticated user found to fetch songs for. Returning empty list.');
      loadingSongs.value = false;
      return;
    }
    
    console.log('SongStore: Fetching songs for user ID:', currentUser.id);

    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', currentUser.id) 
        .order('created_at', { ascending: false }); 

      if (error) {
        console.error('SongStore: Failed to fetch songs:', error.message);
        songs.value = [];
        return;
      }
      songs.value = data as Song[];
      console.log(`SongStore: Fetched ${songs.value.length} songs for user.`);
    } catch (error: any) {
      console.error('SongStore: Unexpected error fetching songs:', error.message);
      songs.value = [];
    } finally {
      loadingSongs.value = false;
      // After initial fetch, set up Realtime subscription
      subscribeToSongsChanges(); 
    }
  };

  /**
   * Subscribes to real-time changes on the 'songs' table.
   */
  const subscribeToSongsChanges = () => {
    // Unsubscribe from any existing channel first to prevent duplicate listeners
    if (songsChannel) {
      songsChannel.unsubscribe();
      songsChannel = null;
      console.log('SongStore: Unsubscribed from previous Realtime channel.');
    }

    if (!supabase || !currentUser) {
        console.warn('SongStore: Cannot subscribe to Realtime. Supabase client or user not available.');
        return;
    }

    console.log('SongStore: Subscribing to Realtime changes for songs table...');
    songsChannel = supabase
      .channel(`songs_user_${currentUser.id}`) // Create a unique channel for this user's songs
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'songs',
          // Optionally filter by user_id if RLS doesn't fully handle it,
          // but RLS on SELECT should manage what the user is *allowed* to see.
          // You might use filter: `user_id=eq.${currentUser.value.id}` if you only want changes to *their* records.
          // However, for approval rate updates from *any* user, a broader filter might be needed,
          // then filter client-side based on user_id if necessary for displaying "my songs".
        },
        (payload) => {
          console.log('SongStore: Realtime change received:', payload);
          const newRecord = payload.new as Song | null;
          const oldRecord = payload.old as Song | null;
          const eventType = payload.eventType;

          if (!newRecord && !oldRecord) return; // Should not happen

          // Handle updates to existing songs (e.g., likes/dislikes)
          if (eventType === 'UPDATE' && newRecord) {
            const index = songs.value.findIndex(s => s.id === newRecord.id);
            if (index !== -1) {
              // Only update if the song belongs to the current user (if fetching only their songs)
              if (newRecord.user_id === currentUser.id) {
                console.log('SongStore: Updating existing song via Realtime:', newRecord.id);
                songs.value[index] = newRecord; // Update the record directly
              }
            } else {
                // If an updated record is received that's not in our list (e.g., a new song for user)
                // it means our initial fetch might be stale. Re-fetch or add if it's new for this user.
                if (newRecord.user_id === currentUser.id) {
                    console.log('SongStore: Adding updated song not in list via Realtime (likely new/missed):', newRecord.id);
                    // Add it if it's meant for this user and not present
                    const exists = songs.value.some(s => s.id === newRecord.id);
                    if (!exists) {
                      songs.value.unshift(newRecord); // Add to beginning
                    }
                }
            }
          }
          // Handle inserts (new songs uploaded)
          else if (eventType === 'INSERT' && newRecord) {
            // Only add if the new song belongs to the current user and isn't already present
            if (newRecord.user_id === currentUser.id && !songs.value.some(s => s.id === newRecord.id)) {
                console.log('SongStore: New song inserted via Realtime:', newRecord.id);
                songs.value.unshift(newRecord); // Add new song to the beginning of the list
            }
          }
          // Handle deletes
          else if (eventType === 'DELETE' && oldRecord) {
            const index = songs.value.findIndex(s => s.id === oldRecord.id);
            if (index !== -1) {
              console.log('SongStore: Deleting song via Realtime:', oldRecord.id);
              songs.value.splice(index, 1); // Remove from array
            }
          }
        }
      )
      .subscribe(); // Start listening!
  };

  // Watch for changes in the authenticated user.
  // This ensures that when the user logs in/out, the songs list is refreshed
  // AND the Realtime subscription is re-established for the correct user.
  watch(currentUser, (newUser, oldUser) => {
    console.log(oldUser, newUser)
    if ((!oldUser && newUser) || (oldUser && !newUser) || (newUser && newUser.id !== oldUser?.id)) {
      console.log('SongStore: User changed, re-initializing songs and Realtime subscription...');
      fetchSongs(); // Re-fetch all songs for the new user context
    }
  }, { immediate: true }); 

  // Initial fetch on store creation if a user is already available (e.g., on page load)
  // This is now redundant due to the immediate: true in the watch, but can stay.
  // if (currentUser.value) {
  //   fetchSongs();
  // }


  // Ensure to unsubscribe when the store is no longer active (e.g., app unmounts)
  // Pinia stores might not have direct unmount hooks like components.
  // If your app is single-page, the channel might persist.
  // For robustness, you might manage subscription on component mount/unmount if needed,
  // or rely on the `watch` to re-subscribe on user change.

  return {
    songs,
    loadingSongs,
    fetchSongs, // Expose fetchSongs for manual refresh
  };
});