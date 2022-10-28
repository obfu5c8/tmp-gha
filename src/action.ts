import { cyan, green, red } from 'ansi-colors';

import { Config } from './config';
import { GithubClient } from './github';
import { GithubCheckRun } from './github/checks';
import { getGithubClient } from './github/client';
import { runTests } from './test-runner';
import { log } from './util/log';

export async function executeAction(config: Config) {
    //==< Configure the github client >=============================|
    let gh: GithubClient | undefined;
    if (!config.skipGithub) {
        gh = getGithubClient(config.githubToken);
    }

    //==< Mark the test check as starting >=========================|
    let check: GithubCheckRun | undefined = undefined;
    if (gh) {
        check = GithubCheckRun.fromConfig(gh, config);
        await check.start();
    }

    //==< Execute test run & gather the results >===================|
    log.info('Running tests with: %s\n', cyan(config.testCmd));
    const results = await runTests(config);

    //==< Print a high-level summary to console >===================|
    if (results.passed) {
        process.stdout.write(PASS + '\n');
    } else {
        process.stdout.write(FAIL + '\n');
    }

    //==< Mark the check as complete >==============================|
    if (gh && check) {
        await check.complete(results);
    }
}

const PASS = green(`
    ██████╗  █████╗ ███████╗███████╗
    ██╔══██╗██╔══██╗██╔════╝██╔════╝
    ██████╔╝███████║███████╗███████╗
    ██╔═══╝ ██╔══██║╚════██║╚════██║
    ██║     ██║  ██║███████║███████║
    ╚═╝     ╚═╝  ╚═╝╚══════╝╚══════╝
`);

const FAIL = red(`
    ███████╗ █████╗ ██╗██╗
    ██╔════╝██╔══██╗██║██║
    █████╗  ███████║██║██║
    ██╔══╝  ██╔══██║██║██║
    ██║     ██║  ██║██║███████╗
    ╚═╝     ╚═╝  ╚═╝╚═╝╚══════╝
`);
