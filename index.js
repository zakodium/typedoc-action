'use strict';

const { existsSync } = require('fs');
const fs = require('fs').promises;
const path = require('path');

const core = require('@actions/core');
const { exec } = require('@actions/exec');

const entry = core.getInput('entry') || 'src/index.ts';

(async () => {
  const args = [
    path.join(__dirname, 'node_modules/typedoc/bin/typedoc'),
    '--ignoreCompilerErrors',
    '--out',
    'docs',
    entry,
  ];

  if (hasTypedocConfig()) {
    args.push('--options', 'typedoc.config.js');
  }

  await exec('node', args);
  await fs.writeFile('docs/.nojekyll', '');
})().catch((error) => {
  core.setFailed(error);
});

function hasTypedocConfig() {
  return existsSync('typedoc.config.js');
}
