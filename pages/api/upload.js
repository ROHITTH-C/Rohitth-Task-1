import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method === 'POST') {
    const uploadDir = path.join(process.cwd(), '/Database');

    // Ensure the Database folder exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("Formidable parse error:", err);
        return res.status(500).json({ error: 'File upload failed during parsing' });
      }

      try {
        const file = files.file[0];
        const uploadDate = new Date().toISOString().split('T')[0];
        const fileDir = path.join(uploadDir, uploadDate);

        // Ensure date-specific folder exists within Database
        if (!fs.existsSync(fileDir)) {
          fs.mkdirSync(fileDir, { recursive: true });
        }

        const uniqueFileName = `${Date.now()}-${file.originalFilename}`;
        const newPath = path.join(fileDir, uniqueFileName);
        fs.renameSync(file.filepath, newPath);

        const metadata = {
          filename: file.originalFilename,
          path: newPath,
          uploadDate,
          uniqueLink: `/api/files/${uploadDate}/${uniqueFileName}`,
        };

        const metadataFile = path.join(uploadDir, 'metadata.json');

        // Check if metadata.json exists and is valid JSON; initialize if necessary
        let fileMetadata = [];
        if (fs.existsSync(metadataFile)) {
          try {
            const data = fs.readFileSync(metadataFile, 'utf-8');
            fileMetadata = JSON.parse(data);
          } catch (jsonError) {
            console.error("Invalid JSON in metadata.json, reinitializing:", jsonError);
            fileMetadata = [];
          }
        }

        fileMetadata.push(metadata);
        fs.writeFileSync(metadataFile, JSON.stringify(fileMetadata, null, 2));

        res.status(200).json(metadata);
      } catch (error) {
        console.error("File processing error:", error);
        res.status(500).json({ error: 'File processing failed' });
      }
    });
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
