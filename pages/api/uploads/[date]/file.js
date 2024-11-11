import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { date, file } = req.query;
  const filePath = path.join(process.cwd(), 'Database', date, file);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
}
