import path from 'path';

import { executeAction } from './action';
import { Config } from './config';
import { log } from './util/log';

/* eslint-disable no-console */

async function executeLocally() {
    // const inputs: ActionInputs = {
    //     token: process.env.GITHUB_TOKEN as string,
    //     name: 'Unit Tests',
    //     dir: path.resolve(__dirname, '..', 'example'),
    //     outputJson: 'test-output.json',
    //     testCmd: 'go test -v -json -cover ./...',
    //     // testCmd: 'cat foobar.txt',
    //     summarize: 'failed',
    // };

    //==< Generate config from inputs >=============================|
    // const config = getConfigFromActionInputs(inputs);

    const config2: Config = {
        displayName: 'My test run',
        githubRepo: {
            owner: 'obfu5c8',
            repo: 'whatever',
        },
        githubSha: '1234',
        githubToken: 'foo',
        summaryDetail: 'failed',
        testCmd: 'go test -v -json -cover ./...',
        testDir: path.resolve(__dirname, '..', 'example'),
        skipGithub: true,
    };

    await executeAction(config2);
}

executeLocally().catch((err: Error) => {
    log.fatal(err);
});
