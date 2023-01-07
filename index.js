'use strict';

const { existsSync } = require('fs');
const fs = require('fs').promises;
const path = require('path');

const core = require('@actions/core');
const { exec } = require('@actions/exec');

const entry = core.getInput('entry') || 'src/index.ts';
const name = core.getInput('name');
const cwd = process.cwd();

const defaultTsconfig = `{
  "compilerOptions": {
    "lib": ["DOM", "ESNext"]
  }
}
`;

(async () => {
  const packageJson = await getPackageJson();
  const { hasTsConfig, tsConfigPath } = await ensureTsConfig();

  if (!existsSync('node_modules')) {
    core.warning('node_modules is not present. Running `npm install`...');
    await exec('npm', ['install']);
  }

  await writeTypedocJson(name || packageJson.name, tsConfigPath);

  const args = [path.join(__dirname, 'node_modules/typedoc/bin/typedoc')];

  await exec('node', args, {
    cwd: __dirname,
  });
  if (!hasTsConfig) {
    await fs.unlink(tsConfigPath);
  }
})().catch((error) => {
  core.setFailed(error);
});

async function writeTypedocJson(name, tsConfigPath) {
  const options = {
    out: path.resolve('docs'),
    name,
    excludePrivate: true,
    hideGenerator: true,
    tsconfig: path.resolve(tsConfigPath),
    entryPoints: entry.split(/ +/).map((entry) => path.resolve(entry)),
    // typedoc-plugin-katex plugin options
    katex: {
      options: {
        delimiters: [{ left: '$', right: '$', display: true }],
        fleqn: 'true',
        leqno: 'false',
      },
    },
  };
  await fs.writeFile(
    path.join(__dirname, 'typedoc.json'),
    JSON.stringify(options, null, 2),
  );
}

async function getPackageJson() {
  return JSON.parse(await fs.readFile('package.json', 'utf-8'));
}

async function ensureTsConfig() {
  let has = true;
  if (!existsSync('tsconfig.json')) {
    has = false;
    await fs.writeFile('tsconfig.json', defaultTsconfig);
  }
  return { hasTsConfig: has, tsConfigPath: path.resolve('tsconfig.json') };
}
