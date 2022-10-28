import path from 'path';

import { executeAction } from './action';
import { ActionInputs } from './action-inputs';
import { log } from './util/log';

/* eslint-disable no-console */

async function executeLocally() {
    const inputs: ActionInputs = {
        token: process.env.GITHUB_TOKEN as string,
        name: 'Unit Tests',
        dir: path.resolve(__dirname, '..', 'example'),
        // outputJson: 'test-output.json',
        testCmd: 'go test -v -json -cover ./...',
        // testCmd: 'cat foobar.txt',
        summarize: 'failed',
    };

    await executeAction(inputs);
}

executeLocally().catch((err: Error) => {
    log.fatal(err);
});

// (async function main() {
//     try {
//         await executeLocally();
//     } catch (err) {
//         console.error("FATAL", err);
//     }
// })();
