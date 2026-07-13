// update-supabase-changelog.js
// Dieses Skript ruft GitHub-Commits ab und aktualisiert die Supabase-Tabelle 'changelog'.

const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

// ENVIRONMENT VARIABLEN:
// Diese sollten über GitHub Secrets gesetzt werden, NICHT direkt im Code!
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Supabase URL
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://rywbhwhagjwhepkgeqax.supabase.co';

// GitHub Repository Konfiguration
const GITHUB_REPO_OWNER = 'Master3307';
const GITHUB_REPO_NAME = 'MasterHome';
const GITHUB_BRANCH = 'main';
const GITHUB_PER_PAGE = 100;

// Supabase Client initialisieren
let supabase;
try {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase URL oder SUPABASE_KEY Umgebungsvariablen fehlen!');
  }

  supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: false
    },
    realtime: {
      transport: WebSocket
    }
  });

  console.log('Supabase Client mit Service Role Key initialisiert.');
} catch (error) {
  console.error('Fehler beim Initialisieren des Supabase Clients:', error.message);
  process.exit(1);
}

// Hilfsfunktion zum Abrufen von paginierten GitHub-Daten
async function fetchPaginatedData(url, headers) {
  let allData = [];
  let nextUrl = url;

  while (nextUrl) {
    console.log(`Fetching: ${nextUrl}`);
    const res = await fetch(nextUrl, { headers });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`GitHub API Fehler: ${res.status} ${res.statusText}\nBody: ${errorBody}`);
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

// Hilfsfunktion zum Abrufen von Commit-Details
async function fetchCommitDetails(sha, headers) {
  const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commits/${sha}`;
  console.log(`Fetching commit details for ${sha}: ${url}`);
  const res = await fetch(url, { headers });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`GitHub API Fehler beim Abrufen von Commit ${sha}: ${res.status} ${res.statusText}\nBody: ${errorBody}`);
  }

  return res.json();
}

(async () => {
  try {
    if (!GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN Umgebungsvariable fehlt.');
    }

    console.log('Supabase: Verwende Service Role Key für direkten Datenbankzugriff. Keine explizite Anmeldung erforderlich.');

    const githubHeaders = {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'User-Agent': 'supabase-github-actions-updater',
      'Accept': 'application/vnd.github.v3+json'
    };

    console.log('1. Liste der Commits von GitHub abrufen...');
    const commitsSummary = await fetchPaginatedData(
      `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/commits?sha=${GITHUB_BRANCH}&per_page=${GITHUB_PER_PAGE}`,
      githubHeaders
    );
    console.log(`Abgerufen: ${commitsSummary.length} Commits-Zusammenfassungen.`);

    console.log('Checking existing SHAs...');
    const { data: existingRows, error: fetchShaError } = await supabase
      .from('changelog')
      .select('sha');

    if (fetchShaError) {
      throw fetchShaError;
    }

    const existingShas = new Set((existingRows || []).map(row => row.sha));
    console.log(`Gefundene vorhandene SHAs: ${existingShas.size}`);

    const commitsToUpsert = [];

    console.log('2. Details für jeden Commit abrufen und vorbereiten...');
    for (const commitSummary of commitsSummary) {
      if (existingShas.has(commitSummary.sha)) {
        continue;
      }

      try {
        const commitDetails = await fetchCommitDetails(commitSummary.sha, githubHeaders);

        const filesChanged = commitDetails.files
          ? commitDetails.files.map(file => ({
              filename: file.filename,
              status: file.status,
              additions: file.additions,
              deletions: file.deletions
            }))
          : [];

        commitsToUpsert.push({
          sha: commitDetails.sha,
          date: commitDetails.commit.author.date,
          message: commitDetails.commit.message,
          author: commitDetails.commit.author.name,
          fileschanged: filesChanged
        });
      } catch (detailError) {
        console.error(`Fehler beim Abrufen der Details für Commit ${commitSummary.sha}:`, detailError);

        commitsToUpsert.push({
          sha: commitSummary.sha,
          date: commitSummary.commit.author.date,
          message: commitSummary.commit.message,
          author: commitSummary.commit.author.name,
          fileschanged: []
        });
      }
    }

    console.log(`Bereit zum Speichern/Aktualisieren von ${commitsToUpsert.length} Commits in Supabase.`);

    const { error: supabaseError } = await supabase
      .from('changelog')
      .upsert(commitsToUpsert, { onConflict: 'sha' });

    if (supabaseError) {
      throw supabaseError;
    }

    console.log(`Erfolgreich ${commitsToUpsert.length} Commits in Supabase Tabelle 'changelog' gespeichert/aktualisiert!`);
  } catch (err) {
    console.error('Kritischer Fehler im Skript:', err);
    process.exit(1);
  }
})();