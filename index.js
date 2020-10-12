'use strict';

const fs = require('fs').promises;
const path = require('path');

const core = require('@actions/core');
const { exec } = require('@actions/exec');

const entry = core.getInput('entry') || 'src/index.ts';
const name = core.getInput('name');

(async () => {
  const packageJson = await getPackageJson();

  const args = [
    path.join(__dirname, 'node_modules/typedoc/bin/typedoc'),
    '--ignoreCompilerErrors',
    '--out',
    'docs',
    '--name',
    name || packageJson.name,
    '--excludePrivate',
    '--hideGenerator',
    '--moduleResolution',
    'node',
    '--mode',
    'file',
  ];

  if (entry.endsWith('.d.ts')) {
    args.push('--includeDeclarations', '--excludeExternals');
  }

  args.push(entry);

  await exec('node', args);
  await fs.writeFile('docs/.nojekyll', '');
})().catch((error) => {
  core.setFailed(error);
});

async function getPackageJson() {
  return JSON.parse(await fs.readFile('package.json', 'utf-8'));
}
