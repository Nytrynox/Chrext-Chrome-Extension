import aiService from './ai.service.js';
import { logger } from '../utils/logger.js';

class MatchingEngineService {
  /**
   * Match resume against job description
   */
  async matchResumeToJob(resumeData, jobAnalysis) {
    try {
      logger.info('Running matching engine');
      
      // Calculate quantitative scores
      const skillOverlap = this.calculateSkillOverlap(resumeData, jobAnalysis);
      const experienceGap = this.calculateExperienceGap(resumeData, jobAnalysis);
      const atsScore = this.calculateATSScore(resumeData, jobAnalysis);
      const seniorityFit = this.calculateSeniorityFit(resumeData, jobAnalysis);
      
      // Calculate overall match score
      const matchScore = this.calculateMatchScore(skillOverlap, experienceGap, atsScore, seniorityFit);
      
      // Get AI-powered reasoning
      const aiReview = await this.getAIReview(resumeData, jobAnalysis, matchScore);
      
      // Determine verdict
      const verdict = this.getVerdict(matchScore, aiReview.brutal_feedback);
      
      return {
        match_score: matchScore,
        verdict,
        breakdown: {
          skill_overlap: skillOverlap,
          experience_gap: experienceGap,
          ats_score: atsScore,
          seniority_fit: seniorityFit
        },
        brutal_feedback: aiReview.brutal_feedback,
        recommended_actions: aiReview.recommended_actions,
        verdict_reasoning: aiReview.verdict_reasoning,
        job_data: jobAnalysis.job_metadata
      };
      
    } catch (error) {
      logger.error('Matching engine error:', error);
      throw new Error('Failed to match resume to job');
    }
  }

  /**
   * Calculate skill overlap
   */
  calculateSkillOverlap(resume, job) {
    const resumeSkills = [
      ...resume.skills.technical,
      ...resume.skills.tools
    ].map(s => s.toLowerCase());
    
    const mandatorySkills = job.requirements.mandatory_skills.map(s => s.skill.toLowerCase());
    const optionalSkills = job.requirements.optional_skills.map(s => s.skill?.toLowerCase() || s.toLowerCase());
    
    const matchedMandatory = mandatorySkills.filter(skill => 
      resumeSkills.some(rs => rs.includes(skill) || skill.includes(rs))
    );
    
    const matchedOptional = optionalSkills.filter(skill => 
      resumeSkills.some(rs => rs.includes(skill) || skill.includes(rs))
    );
    
    const missingCritical = mandatorySkills.filter(skill => !matchedMandatory.includes(skill));
    const missingOptional = optionalSkills.filter(skill => !matchedOptional.includes(skill));
    
    const percentage = mandatorySkills.length > 0
      ? (matchedMandatory.length / mandatorySkills.length) * 100
      : 50;
    
    return {
      percentage: Math.round(percentage),
      matched_skills: matchedMandatory,
      missing_critical: missingCritical,
      missing_optional: missingOptional
    };
  }

  /**
   * Calculate experience gap
   */
  calculateExperienceGap(resume, job) {
    const candidateYears = resume.total_years_experience;
    const requiredYears = job.requirements.years_experience.minimum || 0;
    const gap = candidateYears - requiredYears;
    
    let assessment;
    if (gap < -2) assessment = 'under-qualified';
    else if (gap > 5) assessment = 'over-qualified';
    else assessment = 'qualified';
    
    return {
      required_years: requiredYears,
      candidate_years: candidateYears,
      gap: gap,
      assessment
    };
  }

  /**
   * Calculate ATS keyword match
   */
  calculateATSScore(resume, job) {
    const resumeText = JSON.stringify(resume).toLowerCase();
    const criticalKeywords = job.ats_keywords
      .filter(k => k.importance === 'critical' || k.importance === 'high');
    
    const matched = criticalKeywords.filter(kw => 
      resumeText.includes(kw.keyword.toLowerCase())
    );
    
    const percentage = criticalKeywords.length > 0
      ? (matched.length / criticalKeywords.length) * 100
      : 50;
    
    return {
      keyword_match_percentage: Math.round(percentage),
      matched_keywords: matched.map(k => k.keyword),
      missing_keywords: criticalKeywords.filter(k => !matched.includes(k)).map(k => k.keyword)
    };
  }

  /**
   * Calculate seniority fit
   */
  calculateSeniorityFit(resume, job) {
    const levels = ['intern', 'junior', 'mid', 'senior', 'staff', 'principal'];
    const candidateLevel = resume.seniority_signals.level;
    const requiredLevel = job.job_metadata.seniority;
    
    const candidateIndex = levels.indexOf(candidateLevel);
    const requiredIndex = levels.indexOf(requiredLevel);
    const diff = candidateIndex - requiredIndex;
    
    let fit;
    if (diff < -1) fit = 'under-leveled';
    else if (diff > 1) fit = 'over-leveled';
    else fit = 'appropriate';
    
    return {
      required: requiredLevel,
      candidate: candidateLevel,
      fit
    };
  }

  /**
   * Calculate overall match score (35-85% range)
   */
  calculateMatchScore(skillOverlap, experienceGap, atsScore, seniorityFit) {
    // Weight factors
    const skillWeight = 0.40;
    const expWeight = 0.30;
    const atsWeight = 0.20;
    const seniorityWeight = 0.10;
    
    // Skill score
    let skillScore = skillOverlap.percentage * skillWeight;
    
    // Experience score
    let expScore;
    if (experienceGap.gap >= 0) {
      expScore = 30; // Meets requirement
    } else if (experienceGap.gap >= -1) {
      expScore = 20; // Close enough
    } else {
      expScore = Math.max(0, 30 + (experienceGap.gap * 10)); // Penalty
    }
    
    // ATS score
    let atsPoints = atsScore.keyword_match_percentage * atsWeight;
    
    // Seniority score
    let seniorityPoints;
    if (seniorityFit.fit === 'appropriate') seniorityPoints = 10;
    else if (seniorityFit.fit === 'over-leveled') seniorityPoints = 7;
    else seniorityPoints = 5;
    
    // Total score
    let totalScore = skillScore + expScore + atsPoints + seniorityPoints;
    
    // Cap at realistic range (35-85)
    if (totalScore > 85) {
      totalScore = 75 + Math.random() * 10; // 75-85 range
    }
    if (totalScore < 35) {
      totalScore = 35 + Math.random() * 5; // 35-40 range
    }
    
    return Math.round(totalScore);
  }

  /**
   * Get AI-powered review and brutal feedback
   */
  async getAIReview(resume, job, matchScore) {
    const prompt = `You are a brutally honest recruiter. Review this candidate's fit for the job.

Resume Summary:
- Experience: ${resume.total_years_experience} years (${resume.seniority_signals.level})
- Skills: ${resume.skills.technical.join(', ')}
- Red Flags: ${resume.red_flags.map(r => r.description).join('; ')}

Job Requirements:
- Seniority: ${job.job_metadata.seniority}
- Required Years: ${job.requirements.years_experience.minimum}
- Mandatory Skills: ${job.requirements.mandatory_skills.map(s => s.skill).join(', ')}
- Deal Breakers: ${job.recruiter_signals.deal_breakers.join(', ')}

Current Match Score: ${matchScore}%

Provide HONEST feedback. OUTPUT VALID JSON:
{
  "brutal_feedback": [
    {
      "category": "missing_skills",
      "issue": "Lacks X skill",
      "impact": "critical",
      "suggestion": "Add project using X"
    }
  ],
  "recommended_actions": [
    "Add project demonstrating X skill",
    "Rephrase bullet to include Y keyword"
  ],
  "verdict_reasoning": "2-3 sentence explanation of why they should/shouldn't apply"
}

Be direct, honest, and helpful. No sugarcoating.`;

    return await aiService.generateStructuredResponse(prompt);
  }

  /**
   * Determine verdict based on score and feedback
   */
  getVerdict(score, brutalFeedback) {
    const criticalIssues = brutalFeedback.filter(f => f.impact === 'critical').length;
    
    if (score >= 70 && criticalIssues === 0) return 'APPLY';
    if (score >= 55 && criticalIssues <= 1) return 'APPLY_WITH_CHANGES';
    return 'SKIP';
  }
}

export default new MatchingEngineService();
