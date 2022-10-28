import * as github from '@actions/github';
import { green, red } from 'ansi-colors';

import { ActionInputs, getConfigFromActionInputs } from './action-inputs';
import { GithubCheckRun } from './github/checks';
import { runTests } from './test-runner';
import { log } from './util/log';

export async function executeAction(inputs: ActionInputs) {
    //==< Generate config from inputs >=============================|
    const config = getConfigFromActionInputs(inputs);

    //==< Configure the github client >=============================|
    const gh = github.getOctokit(config.githubToken, {
        userAgent: 'wetransfer/gh-action-go-test',
    });

    //==< Mark the test check as starting >=========================|
    const check = GithubCheckRun.fromContext(gh, config.displayName, github.context);
    await check.start();

    //==< Execute test run & gather the results >===================|
    log.info('Running tests with: %s\n', config.testCmd);
    const results = await runTests(config);

    //==< Print a high-level summary to console >===================|
    if (results.passed) {
        console.log(PASS);
    } else {
        console.log(FAIL);
    }

    //==< Mark the check as complete >==============================|
    await check.complete(results.summary);
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
