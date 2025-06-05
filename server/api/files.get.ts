// server/api/files.get.js
import path from 'path';
import fs from 'fs/promises'; // Use promises-based fs for async operations

export default defineEventHandler(async (event) => {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const files = [];

  try {
    // Ensure the directory exists before trying to read it
    await fs.access(uploadsDir); // Check if directory exists
    const dirents = await fs.readdir(uploadsDir, { withFileTypes: true });

    for (const dirent of dirents) {
      if (dirent.isFile()) {
        const filename = dirent.name;
        // Basic check for common audio extensions. Expand this as needed.
        const isAudio = ['.mp3', '.wav', '.ogg', '.m4a', '.flac'].some(ext =>
          filename.toLowerCase().endsWith(ext)
        );

        if (isAudio) {
          files.push({
            name: filename,
            url: `/uploads/${filename}`, // Public URL to access the file
          });
        }
      }
    }

    return { files };
  } catch (error) {
    // If the directory doesn't exist, or other read errors
    if (error.code === 'ENOENT') {
      console.warn(`Uploads directory not found at: ${uploadsDir}. Returning empty list.`);
      return { files: [] };
    }
    console.error('Error reading uploads directory:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to retrieve files.',
    });
  }
});