const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'tmp/' });
const storageService = require('../services/storage');
const db = require('../db');

const router = express.Router();

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'file is required' });
  try {
    const saved = await storageService.saveFile(req.file);
    db.run('INSERT INTO uploads (original_name, path) VALUES (?, ?)', [saved.originalName, saved.path], function (err) {
      if (err) return res.status(500).json({ error: 'db error' });
      res.json({ id: this.lastID, original_name: saved.originalName, path: saved.path });
    });
  } catch (err) {
    res.status(500).json({ error: 'failed to save file' });
  }
});

module.exports = router;
