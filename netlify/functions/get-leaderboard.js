exports.handler = async (event, context) => {
  // CORS headers for browser requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
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

    // If GitHub not configured, return empty array
    if (!GITHUB_TOKEN || !GITHUB_OWNER) {
      console.log('GitHub not configured, returning empty leaderboard');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([])
      };
    }

    // Fetch scores.json from GitHub
    const githubUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/scores.json`;
    
    const response = await fetch(githubUrl, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BIPARDY-Game'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        // File doesn't exist yet, return empty array
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([])
        };
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const fileData = await response.json();
    const content = Buffer.from(fileData.content, 'base64').toString('utf8');
    const scoresData = JSON.parse(content);
    
    // Sort by combined score (descending) and return top 21
    const sortedScores = scoresData.scores
      .sort((a, b) => b.combined - a.combined)
      .slice(0, 21);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(sortedScores)
    };

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch leaderboard' })
    };
  }
};