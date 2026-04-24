const Resource = require('../models/Resource');
const Session = require('../models/Session');
const User = require('../models/User');

// @desc    Get AI-powered resource suggestions
// @route   GET /api/ai/suggest-resources
// @access  Private
exports.suggestResources = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    const suggestions = [];
    const keywords = query.toLowerCase().split(' ');
    const qRaw = encodeURIComponent(query);
    
    // Always provide diverse generic document-based suggestions
    suggestions.push(
      {
        title: `PPTX & Presentation Slides for "${query}"`,
        description: `Download presentation slides and lecture decks covering "${query}".`,
        type: 'Slides',
        relevance: 98,
        isGeneric: true,
        icon: '📊',
        externalUrl: `https://www.google.com/search?q=${qRaw}+filetype:pptx`
      },
      {
        title: `Past Papers & Exam Sets for "${query}"`,
        description: `Review previous exam questions and marks schemes to prepare for "${query}".`,
        type: 'Papers',
        relevance: 95,
        isGeneric: true,
        icon: '📝',
        externalUrl: `https://www.google.com/search?q=${qRaw}+past+papers`
      },
      {
        title: `Research Papers & Academic Journals: "${query}"`,
        description: `Access deep-dive academic insights and research findings regarding "${query}".`,
        type: 'Research',
        relevance: 92,
        isGeneric: true,
        icon: '🔬',
        externalUrl: `https://scholar.google.com/scholar?q=${qRaw}`
      }
    );

    if (keywords.some(k => ['lecture', 'notes', 'slides', 'handout'].includes(k))) {
      suggestions.push({
        title: `Lecture Notes and Study Materials for ${query}`,
        description: 'Comprehensive lecture notes and study guides discovered by AI.',
        type: 'Lecture Notes',
        relevance: 88,
        isGeneric: true,
        icon: '📚',
        externalUrl: `https://www.google.com/search?q=${encodeURIComponent('lecture notes ' + query)}`
      });
    }

    if (keywords.some(k => ['assignment', 'homework', 'project', 'coursework'].includes(k))) {
      suggestions.push({
        title: `Assignment Help for ${query}`,
        description: 'Guidelines, rubrics, and sample assignments from external academic sources.',
        type: 'Assignments',
        relevance: 85,
        isGeneric: true,
        icon: '✍️',
        externalUrl: `https://www.google.com/search?q=${encodeURIComponent('assignments ' + query)}`
      });
    }

    if (keywords.some(k => ['textbook', 'book', 'reference', 'reading'].includes(k))) {
      suggestions.push({
        title: `Recommended Textbooks for ${query}`,
        description: 'Essential reading materials and textbooks found externally.',
        type: 'Textbooks',
        relevance: 82,
        isGeneric: true,
        icon: '📖',
        externalUrl: `https://www.google.com/search?q=${encodeURIComponent('textbooks ' + query)}`
      });
    }

    suggestions.push(
      {
        title: `Textbooks & Educational Booklets: "${query}"`,
        description: `Consult comprehensive textbooks and reference manuals for "${query}".`,
        type: 'Books',
        relevance: 80,
        isGeneric: true,
        icon: '📖',
        externalUrl: `https://www.google.com/search?q=${qRaw}+textbook+pdf`
      },
      {
        title: `Excel Sheets & Data Tables for "${query}"`,
        description: `Analyze spreadsheets, datasets, and calculation tables for practical "${query}" work.`,
        type: 'Sheets',
        relevance: 75,
        isGeneric: true,
        icon: '📅',
        externalUrl: `https://www.google.com/search?q=${qRaw}+filetype:xlsx`
      },
      {
        title: `Lecture Handouts & PDF Guides`,
        description: `Formal lecture material and instructional guides for "${query}".`,
        type: 'Handouts',
        relevance: 70,
        isGeneric: true,
        icon: '📑',
        externalUrl: `https://www.google.com/search?q=${qRaw}+lecture+notes+pdf`
      }
    );

    // Padding for UI consistency
    while (suggestions.length < 8) {
      suggestions.push({
        title: `More study ideas for "${query}"`,
        description: 'Look for extra notes, solved examples, and discussion videos.',
        type: 'General',
        relevance: 60 - suggestions.length,
        isGeneric: true,
        externalUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}`
      });
    }

    res.json({
      success: true,
      query,
      suggestions: suggestions.slice(0, 10)
    });
  } catch (error) {
    console.error('AI suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating suggestions',
      error: error.message
    });
  }
};

// @desc    Get recommended sessions - real platform sessions only (no YouTube/video links)
// @route   GET /api/ai/recommend-sessions
// @access  Private
exports.recommendSessions = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's enrolled modules for personalization
    const user = await User.findById(userId).select('enrolledModules expertiseModules masteredModules');
    const userModules = [
      ...((user && user.enrolledModules) || []),
      ...((user && user.expertiseModules) || []),
      ...((user && user.masteredModules) || [])
    ].filter(Boolean);

    // Fetch real session announcements (status requested) - same as Announcements tab
    const query = { status: 'requested' };

    const sessions = await Session.find(query)
      .populate('participants', 'fullName email')
      .populate('expert', 'fullName email averageRating totalReviews')
      .populate('createdBy', 'fullName email')
      .populate('pendingRequests.user', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Exclude sessions user already joined or requested
    const filtered = sessions.filter((s) => {
      const inParticipants = (s.participants || []).some(
        (p) => (typeof p === 'object' ? p._id : p)?.toString() === userId.toString()
      );
      const hasRequested = (s.pendingRequests || []).some(
        (r) => (r.user?._id || r.user)?.toString() === userId.toString()
      );
      return !inParticipants && !hasRequested;
    });

    // Enrich with recommendation reason (prioritize user's modules)
    const enriched = filtered.map((s) => {
      const moduleMatch = userModules.length && userModules.includes(s.moduleCode);
      let recommendationReason = moduleMatch
        ? `Matches your enrolled module ${s.moduleCode}`
        : `Session for ${s.moduleCode}`;
      return {
        ...s,
        recommendationReason
      };
    });

    // Sort: user's modules first, then by date
    if (userModules.length) {
      enriched.sort((a, b) => {
        const aMatch = userModules.includes(a.moduleCode) ? 1 : 0;
        const bMatch = userModules.includes(b.moduleCode) ? 1 : 0;
        if (bMatch !== aMatch) return bMatch - aMatch;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
    }

    res.json({
      success: true,
      sessions: enriched.slice(0, 10)
    });
  } catch (error) {
    console.error('recommendSessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations',
      error: error.message
    });
  }
};

// @desc    Suggest external YouTube videos for sessions based on a query
// @route   GET /api/ai/suggest-session-videos
// @access  Private
exports.suggestSessionVideos = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    const trimmed = query.trim();
    const baseSearch = 'https://www.youtube.com/results?search_query=';
    const encode = (q) => encodeURIComponent(q);

    const suggestions = [
      {
        title: `Full lecture playlist for "${trimmed}"`,
        description: `YouTube playlist with lectures and complete explanations for "${trimmed}".`,
        type: 'Playlist',
        videoUrl: `${baseSearch}${encode(trimmed + ' lecture playlist')}`,
        platform: 'YouTube',
        relevance: 98
      },
      {
        title: `Concept explanation: ${trimmed}`,
        description: `Short conceptual videos that explain the core ideas of "${trimmed}".`,
        type: 'Concept',
        videoUrl: `${baseSearch}${encode(trimmed + ' explained')}`,
        platform: 'YouTube',
        relevance: 95
      },
      {
        title: `Tutorials & walkthroughs for "${trimmed}"`,
        description: `Step‑by‑step tutorials and coding walkthroughs related to "${trimmed}".`,
        type: 'Tutorial',
        videoUrl: `${baseSearch}${encode(trimmed + ' tutorial')}`,
        platform: 'YouTube',
        relevance: 93
      },
      {
        title: `Exam preparation videos for "${trimmed}"`,
        description: `Revision, past paper discussions, and exam‑oriented sessions for "${trimmed}".`,
        type: 'Exam Prep',
        videoUrl: `${baseSearch}${encode(trimmed + ' exam preparation revision')}`,
        platform: 'YouTube',
        relevance: 90
      },
      {
        title: `Quick revision for "${trimmed}"`,
        description: 'Short revision videos and summaries to quickly review the topic.',
        type: 'Revision',
        videoUrl: `${baseSearch}${encode(trimmed + ' quick revision')}`,
        platform: 'YouTube',
        relevance: 88
      },
      {
        title: `Beginner friendly introduction to "${trimmed}"`,
        description: 'Introductory videos aimed at complete beginners.',
        type: 'Beginner',
        videoUrl: `${baseSearch}${encode(trimmed + ' for beginners')}`,
        platform: 'YouTube',
        relevance: 86
      },
      {
        title: `Advanced topics in "${trimmed}"`,
        description: 'Deep‑dive videos that explore advanced concepts.',
        type: 'Advanced',
        videoUrl: `${baseSearch}${encode(trimmed + ' advanced topics')}`,
        platform: 'YouTube',
        relevance: 83
      },
      {
        title: `Interview / viva questions on "${trimmed}"`,
        description: 'Common interview and viva questions with explanations.',
        type: 'Interview',
        videoUrl: `${baseSearch}${encode(trimmed + ' interview questions')}`,
        platform: 'YouTube',
        relevance: 80
      },
      {
        title: `Lab / practical sessions for "${trimmed}"`,
        description: 'Hands‑on lab style videos and demos.',
        type: 'Practical',
        videoUrl: `${baseSearch}${encode(trimmed + ' lab practical')}`,
        platform: 'YouTube',
        relevance: 78
      },
      {
        title: `Past paper discussions for "${trimmed}"`,
        description: 'Videos going through exam or past paper questions.',
        type: 'Past Papers',
        videoUrl: `${baseSearch}${encode(trimmed + ' past paper discussion')}`,
        platform: 'YouTube',
        relevance: 75
      }
    ];

    return res.json({
      success: true,
      query: trimmed,
      suggestions
    });
  } catch (error) {
    console.error('suggestSessionVideos error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating YouTube session suggestions',
      error: error.message
    });
  }
};

const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

if (typeof globalThis.DOMMatrix === 'undefined') {
  try {
    const { DOMMatrix } = require('canvas');
    globalThis.DOMMatrix = DOMMatrix;
  } catch (err) {
    console.warn('Warning: canvas DOMMatrix polyfill not available. PDF parsing may fail on Node 18+ without canvas installed.');
  }
}

const pdf = require('pdf-parse');

/**
 * @desc    Generate a quiz based on an uploaded document (PDF, Slides, etc)
 * @route   POST /api/ai/generate-quiz
 * @access  Private
 */
exports.generateQuiz = async (req, res) => {
  try {
    console.log('=== AI GENERATE QUIZ START ===');
    const { moduleCode, difficulty = 'Medium', numQuestions = 5, instructions = '' } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }

    const fileName = req.file.originalname;
    const filePath = req.file.path;
    const mimetype = req.file.mimetype;

    // 1. Extract content
    let documentContent = '';
    try {
      const fileBuffer = fs.readFileSync(filePath);
      if (mimetype === 'application/pdf') {
        const data = await pdf(fileBuffer);
        documentContent = data.text;
      } else if (mimetype.includes('text') || mimetype.includes('json')) {
        documentContent = fileBuffer.toString('utf-8');
      } else {
        documentContent = `Topic: ${fileName}. Content extraction limited for this format.`;
      }
    } catch (err) {
      console.warn('Extraction skipped:', err.message);
      documentContent = `Topic: ${fileName}. Proceeding with general knowledge generation.`;
    }

    const cleanedContent = (documentContent || '').slice(0, 4000).replace(/\s+/g, ' ');

    // 2. AI Generation or Fallback
    const count = parseInt(numQuestions) || 5;
    let quizData = null;

    try {
      if (!process.env.GROQ_API_KEY) throw new Error('API Key Missing');
      
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const promptText = `Generate a ${difficulty} difficulty quiz with ${count} multiple-choice questions.

CONSTRAINTS & IMPORTANT RULES:
1. Base questions ONLY on the attached document content. Focus entirely on the extracted text provided. Do not hallucinate or add external knowledge.
2. Each question must have EXACTLY 4 answer choices (A, B, C, D).
3. Mark the correct answer clearly.
4. Each question MUST be UNIQUE. Cover different topics, sections, or ideas.

Difficulty Guidelines used for distractors:
- Easy: Basic recall questions, obvious distractors.
- Medium: Application/understanding questions, plausible distractors.
- Hard: Analysis/synthesis questions, very similar distractors. Require critical thinking. Include "all of the above" or "none of the above" options occasionally.

Context / Uploaded Text: ${cleanedContent ? cleanedContent : `(ERROR: No text extracted. Focus on filename: ${fileName})`}

Output format (strict JSON):
{
  "questions": [
    {
      "text": "question here",
      "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
      "correct_answer": "A",
      "explanation": "brief explanation why this is correct"
    }
  ]
}`;

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: `You are an academic quiz generator. You return ONLY valid JSON. Focus on creativity (SEED: ${Date.now()}-${Math.random()}).` },
          { role: 'user', content: promptText }
        ],
        model: 'llama-3.1-8b-instant',
        temperature: 0.4,
        response_format: { type: 'json_object' }
      });

      let rawContent = completion.choices[0]?.message?.content || '{}';
      
      // Clean up potential markdown formatting from the AI before parsing
      rawContent = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
      
      const jsonStart = rawContent.indexOf('{');
      const jsonEnd = rawContent.lastIndexOf('}') + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        rawContent = rawContent.slice(jsonStart, jsonEnd);
      }
      
      quizData = JSON.parse(rawContent);
      
      if (!quizData || !quizData.questions || quizData.questions.length === 0) {
        throw new Error("AI returned empty or invalid question structure.");
      }
      
      // Map strict JSON format to frontend expected format
      quizData.questions = quizData.questions.map((q, idx) => {
         let ansIndex = 0;
         if (typeof q.correct_answer === 'string') {
            const letter = q.correct_answer.replace(/[^a-zA-Z]/g, '').charAt(0).toUpperCase();
            ansIndex = letter.charCodeAt(0) - 65; // 'A' -> 0, 'B' -> 1
            if (ansIndex < 0 || ansIndex > 4) ansIndex = 0;
         } else if (typeof q.correct_answer === 'number') {
            ansIndex = q.correct_answer;
         }
         return {
            id: q.id || idx + 1,
            question: q.text || q.question,
            options: q.options,
            answer: ansIndex,
            explanation: q.explanation
         };
      });
      
      // Shuffle the questions array so it's guaranteed to be in a different order
      quizData.questions = quizData.questions.sort(() => Math.random() - 0.5);

    } catch (aiError) {
      console.error('AI Call or Parsing failed:', aiError.message);
      return res.status(500).json({
        success: false,
        message: `AI Generation Error. Did you add your GROQ_API_KEY? Detail: ${aiError.message}`
      });
    }

    // 3. Final Response
    res.json({
      success: true,
      quiz: {
        title: quizData.title || `Self-Assessment: ${fileName}`,
        moduleCode: moduleCode || 'General Knowledge',
        difficulty,
        questionCount: quizData.questions.length,
        questions: quizData.questions.map((q, idx) => ({
          ...q,
          id: q.id || idx + 1
        })),
        sourceFile: fileName
      }
    });

  } catch (error) {
    console.error('CRITICAL QUIZ ERROR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate quiz generation system.',
      error: error.message
    });
  }
};