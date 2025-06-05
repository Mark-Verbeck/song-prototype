// server/api/upload.post.js
import formidable from 'formidable';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid'; // For unique IDs

export default defineEventHandler(async (event) => {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const dataFilePath = path.join(process.cwd(), 'data', 'songs.json');

  // Ensure uploads directory exists
  await fs.mkdir(uploadsDir, { recursive: true }).catch(() => {});
  // Ensure data file exists and is initialized as an empty array if not
  try {
    await fs.access(dataFilePath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(dataFilePath, '[]', 'utf-8');
    } else {
      console.error('Error accessing data file:', err);
      throw createError({ statusCode: 500, statusMessage: 'Server initialization error.' });
    }
  }

  const form = formidable({
    multiples: false,
    uploadDir: uploadsDir, // formidable uses this for initial temp storage then moves
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(event.req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return reject(createError({ statusCode: 500, statusMessage: 'File upload failed.' }));
      }

      const uploadedFile = files.soundFile;

      if (!uploadedFile || uploadedFile.length === 0) {
        return reject(createError({ statusCode: 400, statusMessage: 'No file uploaded.' }));
      }

      const file = Array.isArray(uploadedFile) ? uploadedFile[0] : uploadedFile;

      const title = Array.isArray(fields.title) ? fields.title[0] : fields.title || 'Untitled Song';
      const artist = Array.isArray(fields.artist) ? fields.artist[0] : fields.artist || 'Unknown Artist';

      // formidable saves the file to uploadDir with a new filename.
      // We need to construct the public URL using this new filename.
      const fileUrl = `/uploads/${path.basename(file.filepath)}`;

      // Create new song metadata object
      const newSong = {
        id: uuidv4(), // Unique ID
        title: title,
        artist: artist,
        filename: path.basename(file.filepath),
        url: fileUrl,
        uploadDate: new Date().toISOString(),
        likes: 0,    // Initialize likes
        dislikes: 0, // Initialize dislikes
      };

      try {
        const currentData = await fs.readFile(dataFilePath, 'utf-8');
        let songs = JSON.parse(currentData);

        songs.unshift(newSong); // Add to the beginning

        await fs.writeFile(dataFilePath, JSON.stringify(songs, null, 2), 'utf-8');

        resolve({
          message: 'File and data uploaded successfully!',
          song: newSong,
        });
      } catch (saveError) {
        console.error('Error saving song metadata:', saveError);
        // Attempt to clean up the uploaded file if metadata saving fails
        await fs.unlink(file.filepath).catch(unlinkErr => console.error('Failed to unlink temporary file:', unlinkErr));
        return reject(createError({ statusCode: 500, statusMessage: 'Failed to save song metadata.' }));
      }
    });
  });
});