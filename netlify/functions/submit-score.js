exports.handler = async (event, context) => {
  // CORS headers for browser requests - restrict to known domains
  const allowedOrigins = [
    'https://seedmint.github.io',
    'https://bipardy.netlify.app',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:5500' // VS Code Live Server
  ];
  
  const origin = event.headers.origin || event.headers.Origin;
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  
  const headers = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const GITHUB_REPO = process.env.GITHUB_REPO || 'BIP_quiz';
    const GITHUB_OWNER = process.env.GITHUB_OWNER;

    // Check if GitHub is configured
    if (!GITHUB_TOKEN || !GITHUB_OWNER) {
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({ error: 'Global leaderboard unavailable' })
      };
    }

    // Parse request body
    const body = JSON.parse(event.body);
    const { name, score, streak, words, combined, gameTime, gameLength } = body;

    // Basic validation
    if (!name || typeof name !== 'string') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid name' })
      };
    }

    // Enhanced HTML sanitization and input cleaning
    const sanitizedName = name
      .replace(/<[^>]*>?/gm, '')           // Remove HTML tags
      .replace(/[<>&"']/g, '')             // Remove potentially dangerous chars
      .replace(/\s+/g, ' ')                // Normalize whitespace
      .replace(/[^\w\s-_.]/g, '')          // Allow only alphanumeric, space, dash, underscore, dot
      .trim()
      .substring(0, 20);
    if (sanitizedName.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Name cannot be empty' })
      };
    }

    // Validate numeric values
    if (typeof score !== 'number' || typeof streak !== 'number' || typeof words !== 'number') {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid score data' })
      };
    }

    // Validate game length
    if (gameLength !== 12 && gameLength !== 24) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid game length' })
      };
    }

    // Basic reasonableness checks (prevent obvious cheating)
    if (score < 0 || score > 50000 || streak < 0 || streak > 1000 || words < 0 || words > gameLength) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Score values out of reasonable range' })
      };
    }

    // Validate game time (should be at least reasonable time based on game length)
    const minGameTime = gameLength === 12 ? 20 : 35; // 12 words: 20s, 24 words: 35s
    if (!gameTime || gameTime < minGameTime) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Game time too short' })
      };
    }

    // Calculate combined score if not provided
    const calculatedCombined = combined || parseInt(`${score}${streak}${words}`);

    // Create score entry
    const scoreEntry = {
      name: sanitizedName,
      score: Math.round(score),
      streak: Math.round(streak),
      words: Math.round(words),
      combined: calculatedCombined,
      timestamp: new Date().toISOString(),
      gameTime: Math.round(gameTime),
      gameLength: gameLength
    };

    // Fetch current scores from GitHub
    const githubUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/scores.json`;
    
    let currentScoresData = { scores: [] };
    let currentSha = null;

    try {
      const response = await fetch(githubUrl, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'BIPARDY-Game'
        }
      });

      if (response.ok) {
        const fileData = await response.json();
        currentSha = fileData.sha;
        const content = Buffer.from(fileData.content, 'base64').toString('utf8');
        currentScoresData = JSON.parse(content);
      } else if (response.status !== 404) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
    } catch (fetchError) {
      console.error('Error fetching current scores:', fetchError);
      // Continue with empty scores if fetch fails
    }

    // Server-side eligibility check to prevent API abuse
    const MINIMUM_THRESHOLD = 500; // Minimum score to allow any submission
    
    // Check if score meets minimum threshold
    if (calculatedCombined < MINIMUM_THRESHOLD) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Score does not meet minimum threshold',
          minRequired: MINIMUM_THRESHOLD,
          yourScore: calculatedCombined
        })
      };
    }
    
    // If leaderboard has 21+ entries, check if score qualifies for top 21
    if (currentScoresData.scores.length >= 21) {
      // Sort current scores to find the 21st place score
      const sortedScores = [...currentScoresData.scores].sort((a, b) => b.combined - a.combined);
      
      // Ensure we have at least 21 scores and get the 21st place score
      if (sortedScores.length >= 21) {
        const minQualifyingScore = sortedScores[20].combined; // 21st place (0-indexed)
        
        if (calculatedCombined <= minQualifyingScore) {
          // Calculate where this score would rank
          const wouldRank = sortedScores.findIndex(s => s.combined < calculatedCombined) + 1;
          
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
              error: 'Score does not qualify for global leaderboard',
              minRequired: minQualifyingScore + 1,
              yourScore: calculatedCombined,
              currentRank: wouldRank > 0 ? wouldRank : 'below top 100',
              leaderboardSize: sortedScores.length
            })
          };
        }
      }
    }

    // Add new score and sort
    currentScoresData.scores.push(scoreEntry);
    currentScoresData.scores.sort((a, b) => b.combined - a.combined);
    
    // Keep top 100 scores (to have some history)
    currentScoresData.scores = currentScoresData.scores.slice(0, 100);
    currentScoresData.lastUpdated = new Date().toISOString();

    // Find the rank of the submitted score
    const playerRank = currentScoresData.scores.findIndex(entry => 
      entry.combined === calculatedCombined && 
      entry.timestamp === scoreEntry.timestamp
    ) + 1;

    // Commit the updated scores back to GitHub
    const commitMessage = `Add score: ${sanitizedName} - ${calculatedCombined}`;
    const updatedContent = Buffer.from(JSON.stringify(currentScoresData, null, 2)).toString('base64');

    const commitPayload = {
      message: commitMessage,
      content: updatedContent
    };

    if (currentSha) {
      commitPayload.sha = currentSha;
    }

    const commitResponse = await fetch(githubUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'BIPARDY-Game'
      },
      body: JSON.stringify(commitPayload)
    });

    if (!commitResponse.ok) {
      const errorText = await commitResponse.text();
      console.error('GitHub commit failed:', commitResponse.status, errorText);
      throw new Error(`Failed to save score to GitHub: ${commitResponse.status}`);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        rank: playerRank > 0 ? playerRank : null,
        madeLeaderboard: playerRank > 0 && playerRank <= 21
      })
    };

  } catch (error) {
    console.error('Error submitting score:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to submit score to global leaderboard' })
    };
  }
};