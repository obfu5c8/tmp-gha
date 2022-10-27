import path from 'path';

import { executeAction } from './action';
import { ActionInputs } from './action-inputs';

/* eslint-disable no-console */

async function executeLocally() {
    const inputs: ActionInputs = {
        token: 'doesnt_matter',
        name: 'Unit Tests',
        dir: path.resolve(__dirname, '..', 'example'),
        outputJson: 'test-output.json',
        testCmd: 'go test -v -json -cover ./...',
        summarize: 'failed',
    };

    await executeAction(inputs);
    console.error('Finito!');
}

executeLocally().catch(console.error);

// (async function main() {
//     try {
//         await executeLocally();
//     } catch (err) {
//         console.error("FATAL", err);
//     }
// })();
