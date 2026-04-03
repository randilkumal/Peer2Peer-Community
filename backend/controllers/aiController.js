const Resource = require('../models/Resource');
const Session = require('../models/Session');
const User = require('../models/User');

// @desc    Get AI-powered resource suggestions
// @route   GET /api/ai/suggest-resources
// @access  Private
exports.suggestResources = async (req, res) => {
  try {
    console.log('=== AI SUGGEST RESOURCES DEBUG ===');
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    console.log('Search query:', query);

    // Search for approved resources matching the query
    const searchRegex = new RegExp(query.split(' ').join('|'), 'i');
    
    const matchingResources = await Resource.find({
      status: 'approved',
      $or: [
        { title: { $regex: searchRegex } },
        { description: { $regex: searchRegex } },
        { moduleCode: { $regex: searchRegex } },
        { type: { $regex: searchRegex } }
      ]
    })
    .populate('uploadedBy', 'name fullName')
    .limit(20) // allow more matches to build suggestions
    .sort({ downloads: -1, averageRating: -1, createdAt: -1 });

    console.log(`Found ${matchingResources.length} matching resources`);

    // Generate suggestions with relevance scores
    const suggestions = matchingResources.map(resource => {
      // Calculate relevance score
      let relevance = 50;
      const lowerQuery = query.toLowerCase();
      const lowerTitle = resource.title.toLowerCase();
      const lowerDesc = (resource.description || '').toLowerCase();
      
      if (lowerTitle.includes(lowerQuery)) {
        relevance += 30;
      } else if (lowerTitle.split(' ').some(word => lowerQuery.includes(word) || word.includes(lowerQuery))) {
        relevance += 20;
      }
      
      if (lowerDesc.includes(lowerQuery)) {
        relevance += 10;
      }
      
      if (resource.moduleCode.toLowerCase().includes(lowerQuery)) {
        relevance += 15;
      }
      
      if (resource.averageRating > 4) {
        relevance += 5;
      }
      if (resource.downloads > 20) {
        relevance += 5;
      } else if (resource.downloads > 10) {
        relevance += 3;
      }
      
      relevance = Math.min(relevance, 100);

      const googleQuery = encodeURIComponent(`${resource.title} ${resource.moduleCode || ''}`.trim());

      return {
        title: resource.title,
        description: resource.description || `${resource.type} for ${resource.moduleCode}`,
        type: resource.type,
        moduleCode: resource.moduleCode,
        relevance: relevance,
        resourceId: resource._id,
        downloads: resource.downloads,
        rating: resource.averageRating,
        uploader: resource.uploadedBy?.fullName || resource.uploadedBy?.name,
        isGeneric: false,
        externalUrl: `https://www.google.com/search?q=${googleQuery}`
      };
    });

    // Sort by relevance
    suggestions.sort((a, b) => b.relevance - a.relevance);

    // Add generic suggestions if we have few results
    if (suggestions.length < 5) {
      const keywords = query.toLowerCase().split(' ');
      
      if (keywords.some(k => ['exam', 'test', 'quiz', 'paper', 'past'].includes(k))) {
        const q = encodeURIComponent(`past papers ${query}`);
        suggestions.push({
          title: `Past Papers and Exam Resources for ${query}`,
          description: 'Find past examination papers and test preparation materials',
          type: 'Past Papers',
          relevance: 85,
          isGeneric: true,
          icon: '📝',
          externalUrl: `https://www.google.com/search?q=${q}`
        });
      }

      if (keywords.some(k => ['lecture', 'notes', 'slides', 'handout'].includes(k))) {
        const q = encodeURIComponent(`lecture notes ${query}`);
        suggestions.push({
          title: `Lecture Notes and Study Materials for ${query}`,
          description: 'Comprehensive lecture notes and study guides',
          type: 'Lecture Notes',
          relevance: 80,
          isGeneric: true,
          icon: '📚',
          externalUrl: `https://www.google.com/search?q=${q}`
        });
      }

      if (keywords.some(k => ['assignment', 'homework', 'project', 'coursework'].includes(k))) {
        const q = encodeURIComponent(`assignments ${query}`);
        suggestions.push({
          title: `Assignment Help for ${query}`,
          description: 'Guidelines, rubrics, and sample assignments',
          type: 'Assignments',
          relevance: 75,
          isGeneric: true,
          icon: '✍️',
          externalUrl: `https://www.google.com/search?q=${q}`
        });
      }

      if (keywords.some(k => ['textbook', 'book', 'reference', 'reading'].includes(k))) {
        const q = encodeURIComponent(`textbooks ${query}`);
        suggestions.push({
          title: `Recommended Textbooks for ${query}`,
          description: 'Essential reading materials and textbooks',
          type: 'Textbooks',
          relevance: 70,
          isGeneric: true,
          icon: '📖',
          externalUrl: `https://www.google.com/search?q=${q}`
        });
      }
    }

    // Absolute fallback: always provide at least a few generic text suggestions
    if (suggestions.length === 0) {
      suggestions.push(
        {
          title: `Introduction resources for "${query}"`,
          description: `Look for lecture notes, slides, and beginner-friendly materials that explain the basics of "${query}".`,
          type: 'General',
          relevance: 80,
          isGeneric: true,
          externalUrl: `https://www.google.com/search?q=${encodeURIComponent(query + ' introduction')}`
        },
        {
          title: `Practice problems for "${query}"`,
          description: `Search for assignments, exercises, and past papers that include "${query}" to test your understanding.`,
          type: 'Practice',
          relevance: 75,
          isGeneric: true,
          externalUrl: `https://www.google.com/search?q=${encodeURIComponent(query + ' practice problems')}`
        },
        {
          title: `Deep dive reading on "${query}"`,
          description: `Find detailed articles, textbooks, or official documentation that cover "${query}" in depth.`,
          type: 'Reading',
          relevance: 70,
          isGeneric: true,
          externalUrl: `https://www.google.com/search?q=${encodeURIComponent(query + ' deep dive reading')}`
        }
      );
    }

    console.log(`Generated ${suggestions.length} suggestions`);

    // Ensure we always return up to 10 suggestions; if we have fewer,
    // pad with additional generic ideas so the UI has enough options.
    while (suggestions.length < 10) {
      suggestions.push({
        title: `More study ideas for "${query}"`,
        description: 'Look for extra notes, solved examples, and discussion videos.',
        type: 'General',
        relevance: 60 - suggestions.length, // just to vary slightly
        isGeneric: true,
        externalUrl: `https://www.google.com/search?q=${encodeURIComponent(query)}`
      });
    }

    res.json({
      success: true,
      query,
      suggestions: suggestions.slice(0, 10) // return up to 10 suggestions
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