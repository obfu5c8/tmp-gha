import path from 'path';

import { executeAction } from './action';
import { Config } from './config';

console.log('hello world');

async function main() {
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

main().catch(console.error);
