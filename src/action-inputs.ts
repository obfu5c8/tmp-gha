import * as core from '@actions/core';
import * as github from '@actions/github';

import { Config } from './config';

export interface ActionInputs {
    /** Directory to execute test command in */
    dir?: string;

    /** Command to execute to generate test results. */
    testCmd?: string;

    /** Display name for test run */
    name?: string;

    /** Github auth token */
    token: string;

    /** Optional file path to write json test output to */
    outputJson?: string;

    /** Amount of detail to show in summary */
    summarize?: string;
}

export function getActionInputs(): ActionInputs {
    return {
        dir: core.getInput('dir'),
        testCmd: core.getInput('testCmd'),
        name: core.getInput('name'),
        token: core.getInput('token'),
        outputJson: core.getInput('outputJson'),
        summarize: core.getInput('summarize'),
    };
}

export function getConfigFromActionInputs(inp: ActionInputs): Config {
    if (!['all', 'failed', 'not-passed'].includes(inp.summarize || 'all')) {
        throw new Error(`Unrecognised summarize value: '${inp.summarize || 'undefined'}'`);
    }

    const config: Config = {
        displayName: inp.name || 'Test Run',
        githubToken: inp.token,
        testDir: inp.dir || process.cwd(),
        testCmd: 'go test -v -json ./...',
        jsonOutputFile: inp.outputJson,
        summaryDetail: inp.summarize as Config['summaryDetail'],
        githubRepo: github.context.repo,
        githubSha: github.context.sha,
    };

    // Allow overriding the testCmd, or build it from inputs
    if (inp.testCmd) {
        config.testCmd = inp.testCmd;
    } else {
        const args = ['go', 'test', '-v', '-json'];
        config.testCmd = [...args, './...'].join(' ');
    }

    return config;
}
