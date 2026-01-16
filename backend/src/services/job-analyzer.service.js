import aiService from './ai.service.js';
import { logger } from '../utils/logger.js';

class JobAnalyzerService {
  /**
   * Analyze job description
   */
  async analyzeJob(jobData) {
    try {
      logger.info(`Analyzing job: ${jobData.title} at ${jobData.company}`);
      
      const prompt = this.generateAnalyzerPrompt(jobData.description, jobData);
      const analysis = await aiService.generateStructuredResponse(prompt);
      
      return this.enhanceJobAnalysis(analysis, jobData);
      
    } catch (error) {
      logger.error('Job analysis error:', error);
      throw new Error('Failed to analyze job');
    }
  }

  /**
   * Generate job analyzer prompt
   */
  generateAnalyzerPrompt(description, metadata) {
    return `You are a senior recruiter and ATS specialist. Analyze this job description.

OUTPUT MUST BE VALID JSON:
{
  "job_metadata": {
    "title": "${metadata.title}",
    "company": "${metadata.company}",
    "location": "${metadata.location || 'Not specified'}",
    "seniority": "mid",
    "employment_type": "full-time"
  },
  "requirements": {
    "mandatory_skills": [
      {
        "skill": "string",
        "category": "language",
        "evidence": "quoted text from JD"
      }
    ],
    "optional_skills": [],
    "years_experience": {
      "minimum": 0.0,
      "preferred": 0.0,
      "evidence": "quoted requirement"
    }
  },
  "ats_keywords": [
    {
      "keyword": "string",
      "frequency": 1,
      "importance": "critical"
    }
  ],
  "recruiter_signals": {
    "deal_breakers": [],
    "nice_to_haves": [],
    "culture_keywords": [],
    "red_flags": []
  },
  "application_requirements": {
    "portfolio_required": false,
    "cover_letter_required": false,
    "referral_preferred": false,
    "custom_questions_expected": false
  }
}

Job description:
${description}

Extract all requirements accurately. Identify mandatory vs optional skills. Detect ATS keywords with importance levels. Flag any red flags.`;
  }

  /**
   * Enhance job analysis
   */
  enhanceJobAnalysis(analysis, jobData) {
    return {
      ...analysis,
      job_metadata: {
        ...analysis.job_metadata,
        url: jobData.url,
        platform: jobData.platform,
        extracted_at: jobData.extracted_at
      }
    };
  }
}

export default new JobAnalyzerService();
