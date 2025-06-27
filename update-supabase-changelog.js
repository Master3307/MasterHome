// update-supabase-changelog.js
// Dieses Skript ruft GitHub-Commits ab und aktualisiert die Supabase-Tabelle 'changelog'.

const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch'); // Für Node.js < v18, sonst ist fetch eingebaut

// ENVIRONMENT VARIABLEN:
// Diese sollten über GitHub Secrets gesetzt werden, NICHT direkt im Code!
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Dein GitHub Personal Access Token mit 'repo'-Rechten
const SUPABASE_KEY = process.env.SUPABASE_KEY; // Dein Supabase Key (sollte der 'anon' Schlüssel sein)

// Supabase URL (Direkt im Code, wie von dir gewünscht)
const SUPABASE_URL = 'https://joeygiadleywsruuwgyv.supabase.co';

// GitHub Repository Konfiguration (kann hier hartkodiert oder auch als Env-Variable sein)
const GITHUB_REPO_OWNER = 'Master3307';
const GITHUB_REPO_NAME = 'MasterHome';
const GITHUB_BRANCH = 'main';
const GITHUB_PER_PAGE = 100; // Maximale Commits pro Seite für GitHub API

// Supabase Client initialisieren
let supabase;
try {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    // Check if both URL and Key are provided as environment variables for safety.
    // Even if URL is hardcoded, the key is still dynamic.
    throw new Error('Supabase URL oder SUPABASE_KEY Umgebungsvariablen fehlen!');
  }
  // Verwende createClient mit der direkten URL und dem Umgebungsschlüssel
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('Supabase Client initialisiert.');
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

    // Authentifiziere Supabase anonym für Schreibzugriff (gemäß RLS-Regel)
    // Da SUPABASE_KEY der 'anon' Schlüssel ist, muss die anonyme Anmeldung erfolgen,
    // damit die Sitzung die Rolle 'authenticated' erhält, um Schreibrechte zu haben.
    const { error: authError } = await supabase.auth.signInAnonymously();
    if (authError) {
      throw new Error(`Supabase Auth Error: ${authError.message}`);
    }
    console.log('Supabase: Anonyme Authentifizierung erfolgreich.');

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

    const commitsToUpsert = [];

    console.log('2. Details für jeden Commit abrufen und vorbereiten...');
    for (const commitSummary of commitsSummary) {
      try {
        const commitDetails = await fetchCommitDetails(commitSummary.sha, githubHeaders);

        const filesChanged = commitDetails.files ? commitDetails.files.map(file => ({
          filename: file.filename,
          status: file.status,
          additions: file.additions,
          deletions: file.deletions
        })) : [];

        commitsToUpsert.push({
          sha: commitDetails.sha,
          date: commitDetails.commit.author.date,
          message: commitDetails.commit.message,
          author: commitDetails.commit.author.name,
          files_changed: filesChanged
        });
      } catch (detailError) {
        console.error(`Fehler beim Abrufen der Details für Commit ${commitSummary.sha}:`, detailError);
        // Falls Details nicht abgerufen werden können, füge den Commit trotzdem mit leeren Dateidetails hinzu
        commitsToUpsert.push({
          sha: commitSummary.sha,
          date: commitSummary.commit.author.date,
          message: commitSummary.commit.message,
          // Fixed: Ensure 'author.name' is used consistently.
          author: commitSummary.commit.author.name,
          files_changed: []
        });
      }
    }

    console.log(`Bereit zum Speichern/Aktualisieren von ${commitsToUpsert.length} Commits in Supabase.`);

    // 3. Daten in Supabase einfügen/aktualisieren (upsert)
    // `onConflict` verwendet den Primärschlüssel 'sha' um Konflikte zu lösen
    const { data, error: supabaseError } = await supabase
      .from('changelog') // Der Tabellenname ist 'changelog'
      .upsert(commitsToUpsert, { onConflict: 'sha' });

    if (supabaseError) {
      throw supabaseError;
    }

    console.log(`Erfolgreich ${commitsToUpsert.length} Commits in Supabase Tabelle 'changelog' gespeichert/aktualisiert!`);

  } catch (err) {
    console.error('Kritischer Fehler im Skript:', err);
    process.exit(1); // Beende den Workflow mit einem Fehlercode
  }
})();
