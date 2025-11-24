import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ghpages from 'gh-pages';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const distDir = path.join(projectRoot, 'dist');

const repo = process.env.GH_PAGES_REPO || undefined; // default to origin
const branch = process.env.GH_PAGES_BRANCH || 'gh-pages';
const base = process.env.GH_PAGES_BASE ?? '/';

console.log(`[deploy] Using base: ${base}`);
console.log(`[deploy] Target repo: ${repo ?? 'origin (default)'} branch: ${branch}`);

// Function to get GitHub Pages URL
function getGitHubPagesUrl() {
  try {
    let repoUrl = repo;
    
    // If repo is not provided, try to get it from git remote
    if (!repoUrl) {
      try {
        const remoteUrl = execSync('git config --get remote.origin.url', {
          cwd: projectRoot,
          encoding: 'utf-8',
          stdio: ['pipe', 'pipe', 'ignore']
        }).trim();
        repoUrl = remoteUrl;
      } catch (e) {
        // If we can't get remote URL, return null
        return null;
      }
    }
    
    // Extract username and repo name from URL
    // Handle formats: https://github.com/user/repo.git, git@github.com:user/repo.git, user/repo
    let match;
    if (repoUrl.includes('github.com')) {
      match = repoUrl.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
    } else if (repoUrl.includes('/')) {
      // Assume format: user/repo
      match = repoUrl.match(/^([^/]+)\/([^/]+?)(?:\.git)?$/);
    }
    
    if (match) {
      const [, username, repoName] = match;
      const basePath = base === '/' ? '' : base.replace(/^\/|\/$/g, '');
      const url = `https://${username}.github.io/${repoName}${basePath ? `/${basePath}` : ''}`;
      return url;
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

// Build with base passed via env (vite.config.ts reads GH_PAGES_BASE)
execSync(`GH_PAGES_BASE='${base}' npm run build`, {
  cwd: projectRoot,
  stdio: 'inherit'
});

// Ensure .nojekyll exists to avoid Jekyll processing on GH Pages
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

// Publish dist to gh-pages branch
await new Promise((resolve, reject) => {
  ghpages.publish(
    distDir,
    {
      branch,
      repo,
      dotfiles: true,
      message: `deploy: ${new Date().toISOString()}`
    },
    (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    }
  );
});

console.log('[deploy] Published to GitHub Pages successfully.');

// Log the app URL
const appUrl = getGitHubPagesUrl();
if (appUrl) {
  console.log(`\n✅ Your app is live at: ${appUrl}\n`);
} else {
  console.log('\n⚠️  Could not determine GitHub Pages URL. Please check your repository settings.\n');
}


