import core from '@actions/core';
import { exec } from '@actions/exec';

import { executeAction } from './src/index.js';

const entry = core.getInput('entry') || 'src/index.ts';
const name = core.getInput('name');
const treatWarningsAsErrors = core.getInput('treatWarningsAsErrors') === 'true';

function onWarn(message) {
  core.warning(message);
}

try {
  await executeAction({ entry, name, treatWarningsAsErrors, onWarn, exec });
} catch (error) {
  core.setFailed(error);
}
