// OpenAI API helper functions
// Uses gpt-4o-mini for cost efficiency

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const API_URL = 'https://api.openai.com/v1/chat/completions'

async function callOpenAI(messages, options = {}) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key not configured. Please add it to your .env file.')
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: options.model || 'gpt-4o-mini', // Cost-efficient model
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 1000,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'OpenAI API error')
  }

  const data = await response.json()
  return data.choices[0].message.content
}

// Generate AI bio from user profile data
export async function generateBio(profileData) {
  const { name, skills, experience, education, projects } = profileData
  const messages = [
    {
      role: 'system',
      content: 'You are a professional career coach. Write compelling, concise professional bios. Keep it under 150 words. Make it sound human and impressive.',
    },
    {
      role: 'user',
      content: `Write a professional bio for:
Name: ${name}
Skills: ${skills?.join(', ')}
Experience: ${experience}
Education: ${education}
Notable Projects: ${projects?.map(p => p.title).join(', ')}

Write a 2-3 paragraph professional bio in first person.`,
    },
  ]
  return callOpenAI(messages)
}

// Calculate ATS score and give improvement tips
export async function analyzeResume(resumeText) {
  const messages = [
    {
      role: 'system',
      content: 'You are an expert ATS (Applicant Tracking System) analyzer. Return a JSON object with: score (0-100), strengths (array of strings), weaknesses (array of strings), suggestions (array of strings), keywords (array of missing keywords). Be specific and actionable.',
    },
    {
      role: 'user',
      content: `Analyze this resume for ATS optimization:\n\n${resumeText.substring(0, 3000)}`,
    },
  ]

  const result = await callOpenAI(messages, { temperature: 0.3, maxTokens: 1500 })

  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 0, strengths: [], weaknesses: [], suggestions: [], keywords: [] }
  } catch {
    return { score: 0, strengths: [], weaknesses: [result], suggestions: [], keywords: [] }
  }
}

// Improve resume content with AI
export async function improveResume(resumeText) {
  const messages = [
    {
      role: 'system',
      content: 'You are an expert resume writer. Improve the resume content to be more impactful, use stronger action verbs, quantify achievements, and optimize for ATS. Maintain the same structure but improve the language.',
    },
    {
      role: 'user',
      content: `Improve this resume section:\n\n${resumeText}`,
    },
  ]
  return callOpenAI(messages, { maxTokens: 2000 })
}

// Generate cover letter
export async function generateCoverLetter(data) {
  const { name, jobTitle, company, skills, experience } = data
  const messages = [
    {
      role: 'system',
      content: 'You are a professional cover letter writer. Write compelling, personalized cover letters that get interviews. Keep it under 300 words.',
    },
    {
      role: 'user',
      content: `Write a cover letter for:
Applicant: ${name}
Applying for: ${jobTitle} at ${company}
Key Skills: ${skills?.join(', ')}
Experience: ${experience}`,
    },
  ]
  return callOpenAI(messages)
}

// Generate interview questions based on job title
export async function generateInterviewQuestions(jobTitle, skills) {
  const messages = [
    {
      role: 'system',
      content: 'You are an interview coach. Generate a JSON array of 10 interview questions with answers. Format: [{question: string, answer: string, type: "behavioral"|"technical"|"situational"}]',
    },
    {
      role: 'user',
      content: `Generate interview questions for: ${jobTitle}\nKey skills: ${skills?.join(', ')}`,
    },
  ]

  const result = await callOpenAI(messages, { temperature: 0.5, maxTokens: 2000 })
  try {
    const jsonMatch = result.match(/\[[\s\S]*\]/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : []
  } catch {
    return []
  }
}

// Skill gap analysis
export async function analyzeSkillGap(currentSkills, targetRole) {
  const messages = [
    {
      role: 'system',
      content: 'You are a career development expert. Return JSON with: {missingSkills: [], learningPath: [], timeEstimate: string, resources: []}',
    },
    {
      role: 'user',
      content: `Current skills: ${currentSkills?.join(', ')}\nTarget role: ${targetRole}\n\nAnalyze the skill gap and provide a learning path.`,
    },
  ]

  const result = await callOpenAI(messages, { temperature: 0.4, maxTokens: 1500 })
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {}
  } catch {
    return {}
  }
}

// Career suggestions based on profile
export async function getCareerSuggestions(profile) {
  const messages = [
    {
      role: 'system',
      content: 'You are a career advisor. Return JSON: {suggestions: [{role: string, match: number, reason: string, salary: string}], topRecommendation: string}',
    },
    {
      role: 'user',
      content: `Based on this profile, suggest career paths:\nSkills: ${profile.skills?.join(', ')}\nExperience: ${profile.experience}\nEducation: ${profile.education}`,
    },
  ]

  const result = await callOpenAI(messages, { temperature: 0.5, maxTokens: 1500 })
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {}
  } catch {
    return {}
  }
}
