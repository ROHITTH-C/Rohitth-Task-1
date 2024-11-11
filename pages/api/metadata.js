import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const metadataFile = path.join(process.cwd(), 'Database', 'metadata.json');

  // Check if the metadata file exists
  if (fs.existsSync(metadataFile)) {
    let fileMetadata = [];

    try {
      // Try reading and parsing the file
      const fileContent = fs.readFileSync(metadataFile, 'utf-8');
      fileMetadata = fileContent ? JSON.parse(fileContent) : [];
    } catch (error) {
      console.error("Error parsing metadata.json:", error);
      // Return an empty array if there's an error parsing JSON
      fileMetadata = [];
    }

    res.status(200).json(fileMetadata);
  } else {
    // If metadata file doesn't exist, return an empty array
    res.status(200).json([]);
  }
}
