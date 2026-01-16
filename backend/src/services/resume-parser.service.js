import aiService from './ai.service.js';
import pdfParse from 'pdf-parse';
import { logger } from '../utils/logger.js';

class ResumeParserService {
  /**
   * Parse PDF resume to structured JSON
   */
  async parseResume(pdfBuffer, filename) {
    try {
      // Extract text from PDF
      const pdfData = await pdfParse(pdfBuffer);
      const resumeText = pdfData.text;
      
      logger.info(`Parsing resume: ${filename}, ${resumeText.length} chars`);
      
      // Generate parsing prompt
      const prompt = this.generateParserPrompt(resumeText);
      
      // Get structured data from AI
      const parsedData = await aiService.generateStructuredResponse(prompt);
      
      // Validate and enhance data
      const enhancedData = this.enhanceResumeData(parsedData);
      
      return enhancedData;
      
    } catch (error) {
      logger.error('Resume parsing error:', error.message || error);
      throw new Error('Failed to parse resume: ' + (error.message || 'Unknown error'));
    }
  }

  /**
   * Generate resume parser prompt
   */
  generateParserPrompt(resumeText) {
    return `You are an expert ATS system and resume parser. Extract structured data from this resume.

OUTPUT MUST BE VALID JSON with this exact structure:
{
  "contact": {
    "name": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "linkedin": "string",
    "portfolio": "string"
  },
  "skills": {
    "technical": ["skill1", "skill2"],
    "tools": ["tool1", "tool2"],
    "soft_skills": ["skill1", "skill2"]
  },
  "experience": [
    {
      "title": "string",
      "company": "string",
      "duration": "string",
      "years_calculated": 0.0,
      "achievements": [
        {
          "text": "string",
          "impact_verbs": ["led", "built"],
          "quantified": true,
          "metrics": ["20% increase"]
        }
      ],
      "technologies": ["tech1", "tech2"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "year": "string",
      "gpa": "string or null"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": [],
      "type": "professional",
      "url": "string or null"
    }
  ],
  "certifications": [],
  "red_flags": [
    {
      "type": "gap",
      "description": "string",
      "severity": "low"
    }
  ],
  "total_years_experience": 0.0,
  "seniority_signals": {
    "level": "mid",
    "indicators": []
  }
}

Resume text:
${resumeText}

CRITICAL: Output ONLY the JSON object. No explanations, no markdown, no code blocks. Start directly with { and end with }. Do not say anything before or after the JSON.`;
  }

  /**
   * Enhance and validate resume data
   */
  enhanceResumeData(data) {
    // Ensure all required fields exist
    const enhanced = {
      contact: data.contact || {},
      skills: data.skills || { technical: [], tools: [], soft_skills: [] },
      experience: data.experience || [],
      education: data.education || [],
      projects: data.projects || [],
      certifications: data.certifications || [],
      red_flags: data.red_flags || [],
      total_years_experience: data.total_years_experience || 0,
      seniority_signals: data.seniority_signals || { level: 'junior', indicators: [] }
    };
    
    // Calculate total years if not provided
    if (enhanced.total_years_experience === 0 && enhanced.experience.length > 0) {
      enhanced.total_years_experience = enhanced.experience.reduce(
        (sum, exp) => sum + (exp.years_calculated || 0),
        0
      );
    }
    
    // Determine seniority if not provided
    if (!enhanced.seniority_signals.level) {
      const years = enhanced.total_years_experience;
      if (years < 2) enhanced.seniority_signals.level = 'junior';
      else if (years < 5) enhanced.seniority_signals.level = 'mid';
      else if (years < 8) enhanced.seniority_signals.level = 'senior';
      else if (years < 12) enhanced.seniority_signals.level = 'staff';
      else enhanced.seniority_signals.level = 'principal';
    }
    
    return enhanced;
  }
}

export default new ResumeParserService();
