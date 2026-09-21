import assert from 'node:assert';
import fs from 'node:fs';
import { execSync } from 'node:child_process';

console.log('Running production readiness verification...');

// 1. Check gitignore contents
const rootGitignore = fs.readFileSync('.gitignore', 'utf8');
assert(rootGitignore.includes('.env*') || rootGitignore.includes('.env'), 'Root .gitignore must ignore .env files');
assert(rootGitignore.includes('!.env.example'), 'Root .gitignore must allow .env.example');
assert(rootGitignore.includes('node_modules/'), 'Root .gitignore must ignore node_modules/');
assert(rootGitignore.includes('dist/'), 'Root .gitignore must ignore dist/');
assert(rootGitignore.includes('.next/'), 'Root .gitignore must ignore .next/');

// 2. Check git tracked files
const trackedFiles = execSync('git ls-files', { encoding: 'utf8' }).split('\n');
const trackedEnvFiles = trackedFiles.filter(f => f.includes('.env') && !f.endsWith('.env.example'));
assert.strictEqual(trackedEnvFiles.length, 0, `No active .env files should be tracked! Found: ${trackedEnvFiles.join(', ')}`);

// 3. Check .env.example files exist and have required keys
assert(fs.existsSync('.env.example'), 'Root .env.example must exist');
assert(fs.existsSync('backend/.env.example'), 'backend/.env.example must exist');
assert(fs.existsSync('frontend/.env.example'), 'frontend/.env.example must exist');

const backendEnv = fs.readFileSync('backend/.env.example', 'utf8');
assert(backendEnv.includes('MONGODB_URI='), 'backend/.env.example must specify MONGODB_URI');
assert(backendEnv.includes('JWT_SECRET='), 'backend/.env.example must specify JWT_SECRET');
assert(backendEnv.includes('REFRESH_TOKEN_SECRET='), 'backend/.env.example must specify REFRESH_TOKEN_SECRET');
assert(backendEnv.includes('PORT='), 'backend/.env.example must specify PORT');
assert(backendEnv.includes('CORS_ORIGIN='), 'backend/.env.example must specify CORS_ORIGIN');

const frontendEnv = fs.readFileSync('frontend/.env.example', 'utf8');
assert(frontendEnv.includes('NEXT_PUBLIC_API_BASE_URL='), 'frontend/.env.example must specify NEXT_PUBLIC_API_BASE_URL');

console.log('Verification passed successfully!');
