import express from 'express';
import resumeParserService from '../services/resume-parser.service.js';
import jobAnalyzerService from '../services/job-analyzer.service.js';
import matchingEngineService from '../services/matching-engine.service.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/job/analyze
 * Analyze a job posting against a resume
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const { resume_id, job_data, job_url } = req.body;
    
    if (!job_data || !job_data.description) {
      return res.status(400).json({ error: 'Job data with description is required' });
    }
    
    // For MVP, we'll accept resume_data directly instead of fetching from DB
    // In production, you'd fetch from database using resume_id
    let resumeData;
    if (req.body.resume_data) {
      resumeData = req.body.resume_data;
    } else {
      return res.status(400).json({ error: 'Resume data is required for MVP' });
    }
    
    logger.info(`Analyzing job: ${job_data.title} for user`);
    
    // Step 1: Analyze job description
    const jobAnalysis = await jobAnalyzerService.analyzeJob(job_data);
    
    // Step 2: Match resume to job
    const matchResult = await matchingEngineService.matchResumeToJob(resumeData, jobAnalysis);
    
    res.json(matchResult);
    
  } catch (error) {
    logger.error('Job analysis error:', error);
    next(error);
  }
});

/**
 * GET /api/job/history
 * Get user's analysis history
 */
router.get('/history', async (req, res) => {
  // TODO: Implement with database
  res.json({ analyses: [] });
});

export default router;
