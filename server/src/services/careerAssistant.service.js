import { generateAIResponse } from './ai.service.js';
import { mergeTextSources } from './fileParser.service.js';

const FOLLOW_UP_MOTIVATIONS = [
    (company) => `A thoughtful follow-up to ${company} shows initiative without being pushy.`,
    (company) => `Recruiters at ${company} often appreciate candidates who stay engaged professionally.`,
    (company) => `One concise note to ${company} can refresh their memory of your application.`,
    (company) => `Staying visible at ${company} takes just a few minutes — a follow-up email does exactly that.`,
    (company) => `Your interest in ${company} is worth communicating; a brief follow-up keeps momentum alive.`
];

const INTERVIEW_MOTIVATIONS = [
    (company, role) => `Focused prep for ${role} at ${company} will help you walk in with confidence.`,
    (company, role) => `Reviewing likely ${role} questions for ${company} today gives you a real edge.`,
    (company) => `A little preparation now makes your ${company} interview feel much less stressful.`,
    (company, role) => `Understanding ${company}'s expectations for ${role} helps you tell a sharper story.`,
    (company) => `Strong preparation for ${company} turns nerves into clear, confident answers.`
];

function pickMotivation(priorities, index, company, role, actionType) {
    const pool = actionType === 'INTERVIEW' ? INTERVIEW_MOTIVATIONS : FOLLOW_UP_MOTIVATIONS;
    const seed = (company.length + role.length + index + priorities.length) % pool.length;
    return pool[seed](company, role);
}

export function buildFallbackRecommendation(priority, index = 0, allPriorities = []) {
    const { company, role, actionType, reason } = priority;

    if (actionType === 'INTERVIEW') {
        return {
            title: reason === 'Interview Today' ? 'Prepare for today\'s interview' : 'Get interview-ready',
            description: `Your ${role} interview at ${company} is coming up — spend a few minutes on targeted preparation.`,
            suggestedAction: 'Upload the job description and your resume to generate tailored questions and tips.',
            motivation: pickMotivation(allPriorities, index, company, role, actionType)
        };
    }

    return {
        title: 'Draft a recruiter follow-up',
        description: `Your ${role} application at ${company} could use a polite check-in to stay on the recruiter's radar.`,
        suggestedAction: 'Generate and review a concise follow-up email draft.',
        motivation: pickMotivation(allPriorities, index, company, role, actionType)
    };
}

const CAREER_ASSISTANT_SYSTEM_PROMPT = 'You are an AI career assistant for a job tracking app. Return valid JSON only.';

function buildPrompt(priorities) {
    return `
Return JSON only. Do not include markdown, code fences, comments, or extra text.

For EACH priority below, write a UNIQUE recommendation. Every "motivation" field MUST be different — reference the specific company name and/or role. Never reuse the same motivation sentence across items.

Return an array with this exact shape:
[
  {
    "applicationId": "string (must match exactly)",
    "title": "short title",
    "description": "one sentence explanation specific to this company and role",
    "suggestedAction": "one concrete next action",
    "motivation": "one unique short motivational tip referencing this company or role"
  }
]

Use the deterministic reason and actionType as source of truth. Do not invent deadlines, interview topics, company facts, recruiter details, or application status.
For FOLLOW_UP priorities, guide the user toward reviewing a concise recruiter follow-up email draft.
For INTERVIEW priorities, guide the user toward interview preparation for the scheduled interview.

Priorities:
${JSON.stringify(priorities.map((p) => ({
    applicationId: p.applicationId,
    company: p.company,
    role: p.role,
    reason: p.reason,
    actionType: p.actionType
})), null, 2)}
`;
}

function stripCodeFence(value) {
    return value
        .trim()
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
}

function parseRecommendations(text, priorities) {
    const parsed = JSON.parse(stripCodeFence(text));
    if (!Array.isArray(parsed)) {
        throw new Error('AI response must be a JSON array.');
    }

    const recommendations = {};

    parsed.forEach((item, index) => {
        const priority = priorities.find((p) => p.applicationId === item.applicationId)
            || priorities[index];

        if (!priority) return;

        const fallback = buildFallbackRecommendation(priority, index, priorities);

        recommendations[priority.applicationId] = {
            title: item.title || fallback.title,
            description: item.description || fallback.description,
            suggestedAction: item.suggestedAction || fallback.suggestedAction,
            motivation: item.motivation || fallback.motivation
        };
    });

    return recommendations;
}

function daysSince(date) {
    if (!date) return null;
    const ms = Date.now() - new Date(date).getTime();
    return Math.floor(ms / (24 * 60 * 60 * 1000));
}

function buildFollowUpPrompt(application, user) {
    const daysApplied = daysSince(application.appliedDate);
    const daysSinceUpdate = daysSince(application.updatedAt || application.createdAt);

    return `
You write concise recruiter follow-up emails for job applicants.

Return JSON only. Do not include markdown, code fences, comments, or extra text.

Use this exact shape:
{
  "subject": "short email subject",
  "body": "plain text email body"
}

Write 150 to 190 words across 3 short paragraphs plus a sign-off. Keep the email polite, warm, and specific.
Mention the company name (${application.companyName}) and role (${application.role}) naturally in the opening.
Tailor the tone to the application status (${application.status}) and how long ago they applied (${daysApplied ?? 'unknown'} days).
If notes are provided, weave in one relevant detail from them without inventing facts.
Do not use markdown, HTML, bullet points, or numbered lists.
Do not invent recruiter names, interview details, deadlines, or company facts.
Make this email distinctly different from a generic template — vary phrasing based on the role and company.

Applicant:
${JSON.stringify({ name: user.name, email: user.email }, null, 2)}

Application:
${JSON.stringify({
    companyName: application.companyName,
    role: application.role,
    status: application.status,
    appliedDate: application.appliedDate,
    daysSinceApplied: daysApplied,
    daysSinceLastUpdate: daysSinceUpdate,
    source: application.source,
    notes: application.notes
}, null, 2)}
`;
}

function fallbackFollowUpDraft(application, user) {
    const noteLine = application.notes
        ? ` I was especially drawn to this opportunity because of ${application.notes.slice(0, 80)}${application.notes.length > 80 ? '...' : ''}.`
        : '';

    return {
        subject: `Following up for ${application.role} at ${application.companyName}`,
        body: `Hello,\n\nI hope you are doing well. I wanted to follow up on my application for the ${application.role} position at ${application.companyName}, which I submitted on ${new Date(application.appliedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.${noteLine}\n\nI remain very interested in contributing to the team and would appreciate any update on the hiring timeline or next steps. Please let me know if there is any additional information I can provide to support your review.\n\nThank you for your time and consideration. I look forward to hearing from you.\n\nBest regards,\n${user.name}`
    };
}

function parseFollowUpDraft(text, application, user) {
    const parsed = JSON.parse(stripCodeFence(text));
    const fallback = fallbackFollowUpDraft(application, user);

    return {
        subject: parsed.subject || fallback.subject,
        body: parsed.body || fallback.body
    };
}

function buildInterviewPrepPrompt(application, jobDescription, resumeText) {
    return `
You are an interview coach. Analyze the job description and resume, then return tailored interview preparation.

Return JSON only. Do not include markdown, code fences, comments, or extra text.

Use this exact shape:
{
  "topics": ["3 to 5 key topics likely to come up"],
  "likelyQuestions": [
    {
      "question": "a likely interview question",
      "tip": "how the candidate should approach answering it based on their resume"
    }
  ] (provide 8 to 12 diverse questions covering behavioral, technical, and role-specific angles),
  "preparationTips": ["3 to 5 practical preparation tips"],
  "strengthsToHighlight": ["2 to 4 resume strengths that match the role"],
  "gapsToAddress": ["1 to 3 potential gaps and how to frame them positively"]
}

Base questions and tips ONLY on the provided job description and resume text. Do not invent company-specific facts not present in the inputs.

Application context:
${JSON.stringify({
    companyName: application.companyName,
    role: application.role,
    status: application.status,
    interviewDate: application.interviewDate
}, null, 2)}

Job description:
${jobDescription || 'Not provided.'}

Resume:
${resumeText || 'Not provided.'}
`;
}

function fallbackInterviewPrep(application) {
    return {
        topics: [
            `Your experience relevant to ${application.role}`,
            'Problem-solving and past project impact',
            'Team collaboration and communication',
            `Why you want to join ${application.companyName}`
        ],
        likelyQuestions: [
            {
                question: `Tell me about yourself and why you are interested in the ${application.role} role at ${application.companyName}.`,
                tip: 'Open with your current focus, highlight 2 relevant achievements, and connect them to this role.'
            },
            {
                question: 'Describe a challenging project you worked on and how you handled it.',
                tip: 'Use a clear situation-action-result structure with measurable outcomes.'
            },
            {
                question: 'What are your strengths and areas you are actively improving?',
                tip: 'Lead with strengths that match the job description, then show self-awareness on one growth area.'
            },
            {
                question: `Why do you want to work at ${application.companyName} specifically?`,
                tip: 'Connect your values and career goals to what you know about the company and role.'
            },
            {
                question: 'Tell me about a time you had to learn something new quickly to deliver on a deadline.',
                tip: 'Show resourcefulness, how you prioritized learning, and the outcome.'
            },
            {
                question: 'Describe a situation where you disagreed with a teammate or manager. How did you handle it?',
                tip: 'Focus on respectful communication, finding common ground, and the result.'
            },
            {
                question: `How does your background prepare you for the ${application.role} responsibilities?`,
                tip: 'Map specific resume experiences to key requirements from the job description.'
            },
            {
                question: 'Where do you see yourself in the next few years, and how does this role fit?',
                tip: 'Align your growth goals with the trajectory of the role without overcommitting.'
            }
        ],
        preparationTips: [
            `Research ${application.companyName}'s products, culture, and recent news.`,
            'Prepare 3 concise stories that demonstrate impact using the STAR method.',
            'Draft thoughtful questions to ask the interviewer about the team and role.',
            'Review the job description and map your experience to each requirement.',
            'Do a brief mock interview out loud to tighten your answers.'
        ],
        strengthsToHighlight: [
            'Relevant technical or domain experience from your resume',
            'Examples of ownership and delivering results',
            'Ability to learn quickly and collaborate across teams'
        ],
        gapsToAddress: [
            'If any requirement is lighter on your resume, prepare an honest plan for ramping up quickly.'
        ]
    };
}

function parseInterviewPrep(text, application) {
    const parsed = JSON.parse(stripCodeFence(text));
    const fallback = fallbackInterviewPrep(application);

    return {
        topics: Array.isArray(parsed.topics) && parsed.topics.length ? parsed.topics : fallback.topics,
        likelyQuestions: Array.isArray(parsed.likelyQuestions) && parsed.likelyQuestions.length
            ? parsed.likelyQuestions
            : fallback.likelyQuestions,
        preparationTips: Array.isArray(parsed.preparationTips) && parsed.preparationTips.length
            ? parsed.preparationTips
            : fallback.preparationTips,
        strengthsToHighlight: Array.isArray(parsed.strengthsToHighlight) && parsed.strengthsToHighlight.length
            ? parsed.strengthsToHighlight
            : fallback.strengthsToHighlight,
        gapsToAddress: Array.isArray(parsed.gapsToAddress) && parsed.gapsToAddress.length
            ? parsed.gapsToAddress
            : fallback.gapsToAddress
    };
}

export async function generateCareerRecommendations(priorities) {
    if (!priorities.length) {
        return {};
    }

    if (!process.env.GROQ_API_KEY) {
        return priorities.reduce((recommendations, priority, index) => {
            recommendations[priority.applicationId] = buildFallbackRecommendation(priority, index, priorities);
            return recommendations;
        }, {});
    }

    const response = await generateAIResponse(buildPrompt(priorities), CAREER_ASSISTANT_SYSTEM_PROMPT);
    return parseRecommendations(response || '', priorities);
}

export async function generateFollowUpEmailDraft(application, user) {
    if (!process.env.GROQ_API_KEY) {
        return fallbackFollowUpDraft(application, user);
    }

    try {
        const response = await generateAIResponse(buildFollowUpPrompt(application, user), CAREER_ASSISTANT_SYSTEM_PROMPT);
        return parseFollowUpDraft(response || '', application, user);
    } catch (error) {
        console.error('[career-assistant] Follow-up draft generation failed:', error.message);
        return fallbackFollowUpDraft(application, user);
    }
}

export async function generateInterviewPrep(application, { jobDescriptionText, resumeText }) {
    const jobDescription = mergeTextSources(jobDescriptionText);
    const resume = mergeTextSources(resumeText);

    if (!jobDescription && !resume) {
        throw new Error('Provide a job description and/or resume to generate interview prep.');
    }

    if (!process.env.GROQ_API_KEY) {
        return fallbackInterviewPrep(application);
    }

    try {
        const response = await generateAIResponse(
            buildInterviewPrepPrompt(application, jobDescription, resume),
            CAREER_ASSISTANT_SYSTEM_PROMPT
        );
        return parseInterviewPrep(response || '', application);
    } catch (error) {
        console.error('[career-assistant] Interview prep generation failed:', error.message);
        return fallbackInterviewPrep(application);
    }
}