const fs = require('fs');
const { execSync } = require('child_process'); // Require child_process for git commands

// Node.js v18+ has fetch built-in, but for older versions or compatibility, use this:
let fetch;
try {
  fetch = global.fetch || require('node-fetch');
} catch (e) {
  console.error('Please install node-fetch: npm install node-fetch');
  process.exit(1);
}

const TOKEN = process.env.TOKEN;
const REPO = 'Master3307/MasterHome';
const BRANCH = 'main';
const PER_PAGE = 100; // Max per page for listing commits
const API_LIST_COMMITS_URL = `https://api.github.com/repos/${REPO}/commits?sha=${BRANCH}&per_page=${PER_PAGE}`;

if (!TOKEN) {
  console.error('Please set the TOKEN environment variable.');
  process.exit(1);
}

async function fetchPaginatedData(url, headers) {
  let allData = [];
  let nextUrl = url;
  while (nextUrl) {
    console.log(`Fetching: ${nextUrl}`); // Log fetch URL
    const res = await fetch(nextUrl, { headers });
    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`GitHub API error: ${res.status} ${res.statusText}\nBody: ${errorBody}`);
    }
    const data = await res.json();
    allData = allData.concat(data);
    const link = res.headers.get('link');
    if (link && link.includes('rel="next"')) {
      const match = link.match(/<([^>]+)>;\s*rel="next"/);
      nextUrl = match ? match[1] : null;
    } else {
      nextUrl = null;
    }
  }
  return allData;
}

async function fetchCommitDetails(sha, headers) {
    const url = `https://api.github.com/repos/${REPO}/commits/${sha}`;
    console.log(`Fetching commit details for ${sha}: ${url}`); // Log fetch URL
    const res = await fetch(url, { headers });
    if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`GitHub API error fetching commit ${sha}: ${res.status} ${res.statusText}\nBody: ${errorBody}`);
    }
    return res.json();
}


(async () => {
  try {
    const headers = {
      'Authorization': `token ${TOKEN}`,
      'User-Agent': 'changelog-script',
      'Accept': 'application/vnd.github.v3+json' // Specify API version
    };

    // 1. Fetch the list of commits (summary)
    const commitsSummary = await fetchPaginatedData(API_LIST_COMMITS_URL, headers);

    const changelog = [];

    // 2. Fetch details for each commit to get file changes
    for (const commitSummary of commitsSummary) {
        try {
            const commitDetails = await fetchCommitDetails(commitSummary.sha, headers);

            // Extract filenames, status, additions, and deletions
            const filesChanged = commitDetails.files ? commitDetails.files.map(file => ({
                filename: file.filename,
                status: file.status, // Include file status
                additions: file.additions, // Include additions count
                deletions: file.deletions // Include deletions count
            })) : [];

            changelog.push({
                sha: commitDetails.sha,
                date: commitDetails.commit.author.date,
                message: commitDetails.commit.message,
                author: commitDetails.commit.author.name,
                filesChanged: filesChanged // Add the list of changed files with status and counts
            });
        } catch (detailError) {
            console.error(`Error fetching details for commit ${commitSummary.sha}:`, detailError);
            // If fetching details fails, still add the summary data
             changelog.push({
                sha: commitSummary.sha,
                date: commitSummary.commit.author.date,
                message: commitSummary.commit.message,
                author: commitSummary.commit.author.name,
                filesChanged: [] // Indicate files could not be fetched
            });
        }
    }

    // Sort changelog by date descending (newest first) - API usually returns this way, but good practice
    changelog.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Write the changelog to file
    // The path should be relative to where the script is run, which is the repo root in the workflow.
    const changelogFilePath = './changelog.json'; // Path relative to repo root
    fs.writeFileSync(changelogFilePath, JSON.stringify(changelog, null, 2));
    console.log(`${changelogFilePath} generated. (${changelog.length} commits)`);

    // If running in GitHub Actions, stage and commit/push the changelog
    if (process.env.GITHUB_ACTIONS) {
      // Ensure the working directory is the repo root (actions/checkout usually does this)
      // const repoRoot = process.env.GITHUB_WORKSPACE || '.';
      // process.chdir(repoRoot); // This might not be necessary depending on runner setup

      execSync('git config user.name "github-actions[bot]"');
      execSync('git config user.email "github-actions[bot]@users.noreply.github.com"');

      // Check if there are changes before attempting to add/commit
      // Use the correct path relative to the repo root for git commands
      const gitChangelogPath = './changelog.json'; // Path relative to repo root for git
      const status = execSync(`git status --porcelain ${gitChangelogPath}`).toString();
      if (status.trim().length > 0) {
          execSync(`git add ${gitChangelogPath}`);
          execSync('git commit -m "Update changelog.json [auto]"');
          execSync('git push');
          console.log(`${gitChangelogPath} committed and pushed.`);
      } else {
          console.log(`No changes to commit in ${gitChangelogPath}.`);
      }
    }
  } catch (err) {
    console.error('Error generating changelog:', err);
    process.exit(1); // Exit with a non-zero code on error
  }
})();

// Note about fetch-depth:
// The workflow needs fetch-depth: 0 in actions/checkout@v4
// to be able to fetch details for all commits via the API.
// Add this before your script execution step in the workflow:
// - uses: actions/checkout@v4
//   with:
//     fetch-depth: 0

