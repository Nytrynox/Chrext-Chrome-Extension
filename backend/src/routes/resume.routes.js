import express from 'express';
import multer from 'multer';
import resumeParserService from '../services/resume-parser.service.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Configure multer for file upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

/**
 * POST /api/resume/upload
 * Upload and parse resume PDF
 */
router.post('/upload', upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    logger.info(`Resume upload: ${req.file.originalname}, ${req.file.size} bytes`);
    
    // Parse resume
    const parsedData = await resumeParserService.parseResume(
      req.file.buffer,
      req.file.originalname
    );
    
    // For MVP, return data directly
    // In production, save to database and return resume_id
    const resumeId = `resume_${Date.now()}`;
    
    res.json({
      resume_id: resumeId,
      resume: parsedData,
      message: 'Resume parsed successfully'
    });
    
  } catch (error) {
    logger.error('Resume upload error:', error);
    next(error);
  }
});

/**
 * POST /api/resume/parse
 * Parse resume from base64 content
 */
router.post('/parse', async (req, res, next) => {
  try {
    const { filename, content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Resume content is required' });
    }
    
    // Convert base64 to buffer
    const buffer = Buffer.from(content, 'base64');
    
    logger.info(`Resume parse: ${filename}, ${buffer.length} bytes`);
    
    // Parse resume
    const parsedData = await resumeParserService.parseResume(buffer, filename);
    
    const resumeId = `resume_${Date.now()}`;
    
    res.json({
      resume_id: resumeId,
      resume: parsedData,
      message: 'Resume parsed successfully'
    });
    
  } catch (error) {
    logger.error('Resume parse error:', error);
    next(error);
  }
});

/**
 * GET /api/resume/:id
 * Get resume data
 */
router.get('/:id', async (req, res) => {
  // TODO: Implement with database
  res.status(404).json({ error: 'Resume not found' });
});

export default router;
