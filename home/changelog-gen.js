const fs = require('fs');

// Node.js v18+ has fetch built-in, but for older versions or compatibility, use this:
let fetch;
try {
  fetch = global.fetch || require('node-fetch');
} catch (e) {
  console.error('Please install node-fetch: npm install node-fetch');
  process.exit(1);
}

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = 'Master3307/MasterHome';
const BRANCH = 'main';
const PER_PAGE = 100;
const API_URL = `https://api.github.com/repos/${REPO}/commits?sha=${BRANCH}&per_page=${PER_PAGE}`;

if (!GITHUB_TOKEN) {
  console.error('Please set the GITHUB_TOKEN environment variable.');
  process.exit(1);
}

async function fetchAllCommits(url, headers) {
  let allCommits = [];
  let nextUrl = url;
  while (nextUrl) {
    const res = await fetch(nextUrl, { headers });
    if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    const commits = await res.json();
    allCommits = allCommits.concat(commits);
    const link = res.headers.get('link');
    if (link && link.includes('rel="next"')) {
      const match = link.match(/<([^>]+)>;\s*rel="next"/);
      nextUrl = match ? match[1] : null;
    } else {
      nextUrl = null;
    }
  }
  return allCommits;
}

(async () => {
  try {
    const headers = {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'changelog-script'
    };
    const commits = await fetchAllCommits(API_URL, headers);
    const changelog = commits.map(commit => ({
      sha: commit.sha,
      date: commit.commit.author.date,
      message: commit.commit.message,
      author: commit.commit.author.name
    }));
    fs.writeFileSync('changelog.json', JSON.stringify(changelog, null, 2));
    console.log(`changelog.json generated. (${changelog.length} commits)`);
  } catch (err) {
    console.error('Error fetching commits:', err);
  }
})();

