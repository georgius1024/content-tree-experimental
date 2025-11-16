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


