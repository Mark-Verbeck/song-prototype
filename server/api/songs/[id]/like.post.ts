// server/api/songs/[id]/like.post.js
import fs from 'fs/promises';
import path from 'path';

export default defineEventHandler(async (event) => {
  const songId = event.context.params.id; // Get the ID from the URL parameter
  const dataFilePath = path.join(process.cwd(), 'data', 'songs.json');

  if (!songId) {
    throw createError({ statusCode: 400, statusMessage: 'Song ID is required.' });
  }

  try {
    const currentData = await fs.readFile(dataFilePath, 'utf-8');
    let songs = JSON.parse(currentData);

    const songIndex = songs.findIndex(song => song.id === songId);

    if (songIndex === -1) {
      throw createError({ statusCode: 404, statusMessage: 'Song not found.' });
    }

    songs[songIndex].likes = (songs[songIndex].likes || 0) + 1; // Increment likes, handle undefined
    await fs.writeFile(dataFilePath, JSON.stringify(songs, null, 2), 'utf-8');

    return { message: 'Liked successfully!', song: songs[songIndex] };
  } catch (error) {
    console.error('Error liking song:', error);
    throw createError({ statusCode: 500, statusMessage: 'Failed to like song.' });
  }
});