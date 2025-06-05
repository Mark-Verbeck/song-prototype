// server/api/songs/random.get.js
import fs from 'fs/promises';
import path from 'path';

export default defineEventHandler(async (event) => {
  const dataFilePath = path.join(process.cwd(), 'data', 'songs.json');

  try {
    await fs.access(dataFilePath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { message: 'No songs uploaded yet.', songs: [] };
    }
    console.error('Error accessing data file:', err);
    throw createError({ statusCode: 500, statusMessage: 'Could not access song data file.' });
  }

  try {
    const currentData = await fs.readFile(dataFilePath, 'utf-8');
    const songs = JSON.parse(currentData);

    if (songs.length < 2) {
      return { message: `Need at least 2 songs for comparison. Only ${songs.length} available.`, songs: [] };
    }

    // Select two distinct random indices
    let randomIndex1 = Math.floor(Math.random() * songs.length);
    let randomIndex2;
    do {
      randomIndex2 = Math.floor(Math.random() * songs.length);
    } while (randomIndex2 === randomIndex1); // Ensure distinct indices

    const randomSong1 = songs[randomIndex1];
    const randomSong2 = songs[randomIndex2];

    return {
      message: 'Two random songs retrieved for comparison!',
      songs: [randomSong1, randomSong2] // Return an array of two songs
    };
  } catch (error) {
    console.error('Error retrieving random songs:', error);
    throw createError({ statusCode: 500, statusMessage: 'Failed to retrieve random songs.' });
  }
});