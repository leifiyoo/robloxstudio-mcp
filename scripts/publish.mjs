#!/usr/bin/env node

import { execSync } from 'child_process';

const run = (cmd) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
};

console.log('Building all packages...');
run('npm run build:all');

console.log('\nPublishing robloxstudio-mcp...');
run('npm publish -w packages/robloxstudio-mcp');

console.log('\nPublishing robloxstudio-mcp-inspector...');
run('npm publish -w packages/robloxstudio-mcp-inspector');

console.log('\nAll packages published successfully!');
