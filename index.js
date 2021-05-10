'use strict';

const exists = require('fs').existsSync;
const fs = require('fs').promises;
const path = require('path');

const core = require('@actions/core');
const { exec } = require('@actions/exec');

const entry = core.getInput('entry') || 'src/index.ts';
const name = core.getInput('name');

const defaultTsconfig = `{
  "compilerOptions": {
    "lib": ["DOM", "ESNext"]
  }
}
`;

(async () => {
  const packageJson = await getPackageJson();
  const { hasTsConfig, tsConfigPath } = await ensureTsConfig();

  if (!exists('node_modules')) {
    core.warning('node_modules is not present. Running `npm install`...');
    await exec('npm', ['install']);
  }

  const args = [
    path.join(__dirname, 'node_modules/typedoc/bin/typedoc'),
    '--out',
    'docs',
    '--name',
    name || packageJson.name,
    '--excludePrivate',
    '--hideGenerator',
    '--tsconfig',
    tsConfigPath,
  ];

  args.push(entry);

  await exec('node', args);
  await fs.writeFile('docs/.nojekyll', '');
  if (!hasTsConfig) {
    await fs.unlink(tsConfigPath);
  }
})().catch((error) => {
  core.setFailed(error);
});

async function getPackageJson() {
  return JSON.parse(await fs.readFile('package.json', 'utf-8'));
}

async function ensureTsConfig() {
  let has = true;
  if (!exists('tsconfig.json')) {
    has = false;
    await fs.writeFile('tsconfig.json', defaultTsconfig);
  }
  return { hasTsConfig: has, tsConfigPath: path.resolve('tsconfig.json') };
}
