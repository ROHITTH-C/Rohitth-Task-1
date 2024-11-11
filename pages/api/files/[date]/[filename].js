// pages/api/files/[date]/[filename].js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { date, filename } = req.query;

  const filePath = path.join(process.cwd(), 'Database', date, filename);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    const fileExtension = path.extname(filename).toLowerCase();
    let contentType;

    // Set content type based on file extension for proper display
    switch (fileExtension) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      default:
        contentType = 'application/octet-stream'; // default for unsupported types
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
}
