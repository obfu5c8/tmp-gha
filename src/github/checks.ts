import type { context as ghContext, getOctokit } from '@actions/github';

import { TestOutput } from '../test-runner';
import { log } from '../util/log';

type githubClient = ReturnType<typeof getOctokit>;

type repo = {
    repo: string;
    owner: string;
};

export class GithubCheckRun {
    constructor(
        private readonly gh: githubClient,
        public readonly repo: repo,
        public readonly sha: string,
        public readonly name: string
    ) {}

    static fromContext(gh: githubClient, name: string, context: typeof ghContext): GithubCheckRun {
        return new GithubCheckRun(gh, context.repo, context.sha, name);
    }

    private checkId?: number;

    async start() {
        try {
            log.info('Starting check…');
            const check = await this.gh.rest.checks.create({
                ...this.repo,
                name: this.name,
                head_sha: this.sha,
                status: 'in_progress',
                started_at: new Date().toISOString(),
            });

            this.checkId = check.data.id;
            return check.data;
        } catch (err: any) {
            throw wrapError('Failed to start check', err);
        }
    }

    async complete(results: TestOutput) {
        try {
            if (this.checkId === undefined) {
                throw new Error('Check has not yet been started');
            }

            const conclusion = results.passed ? 'success' : 'failure';

            const title = `${this.name} - `;

            await this.gh.rest.checks.update({
                ...this.repo,
                check_run_id: this.checkId,
                status: 'completed',
                completed_at: new Date().toISOString(),
                conclusion,
                output: {
                    title: this.name,
                    summary: 'Some tests were run',
                    text: results.summary,
                },
            });
        } catch (err) {
            throw wrapError('Failed to complete check run', err);
        }
    }
}

function wrapError<T>(name: string, err: T): T {
    if (err instanceof Error) {
        err.message = err.name + ': ' + err.message;
        err.name = name;
    }
    return err;
}
