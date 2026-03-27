const { execSync } = require('child_process');

try {
  // Run build directly on Windows
  execSync('npx react-scripts build', { stdio: 'inherit' });
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}