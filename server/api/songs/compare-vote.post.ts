// server/api/songs/compare-vote.post.js
import fs from 'fs/promises';
import path from 'path';

export default defineEventHandler(async (event) => {
  const dataFilePath = path.join(process.cwd(), 'data', 'songs.json');
  const body = await readBody(event); // Nuxt's way to read POST body

  const chosenSongId = body.chosenSongId;
  const unchosenSongId = body.unchosenSongId;

  if (!chosenSongId || !unchosenSongId) {
    throw createError({ statusCode: 400, statusMessage: 'Both chosenSongId and unchosenSongId are required.' });
  }

  try {
    const currentData = await fs.readFile(dataFilePath, 'utf-8');
    let songs = JSON.parse(currentData);

    let chosenSongUpdated = null;
    let unchosenSongUpdated = null;

    // Find and update chosen song
    const chosenIndex = songs.findIndex(song => song.id === chosenSongId);
    if (chosenIndex !== -1) {
      songs[chosenIndex].likes = (songs[chosenIndex].likes || 0) + 1;
      chosenSongUpdated = songs[chosenIndex];
    }

    // Find and update unchosen song
    const unchosenIndex = songs.findIndex(song => song.id === unchosenSongId);
    if (unchosenIndex !== -1) {
      songs[unchosenIndex].dislikes = (songs[unchosenIndex].dislikes || 0) + 1;
      unchosenSongUpdated = songs[unchosenIndex];
    }

    if (!chosenSongUpdated && !unchosenSongUpdated) {
      throw createError({ statusCode: 404, statusMessage: 'Neither song found.' });
    }

    // Write updated data back to the file
    await fs.writeFile(dataFilePath, JSON.stringify(songs, null, 2), 'utf-8');

    return {
      message: 'Comparison vote recorded successfully!',
      chosenSong: chosenSongUpdated,
      unchosenSong: unchosenSongUpdated,
    };
  } catch (error) {
    console.error('Error recording comparison vote:', error);
    throw createError({ statusCode: 500, statusMessage: 'Failed to record comparison vote.' });
  }
});