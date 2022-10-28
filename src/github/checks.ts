import { Config } from '../config';
import { TestOutput } from '../test-runner';
import { log } from '../util/log';
import { GithubClient } from './types';

type repo = {
    repo: string;
    owner: string;
};

export class GithubCheckRun {
    constructor(
        private readonly gh: GithubClient,
        public readonly repo: repo,
        public readonly sha: string,
        public readonly name: string
    ) {}

    static fromConfig(gh: GithubClient, config: Config): GithubCheckRun {
        return new GithubCheckRun(gh, config.githubRepo, config.githubSha, config.displayName);
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
            const summary = generateSummaryMarkdown(results);

            await this.gh.rest.checks.update({
                ...this.repo,
                check_run_id: this.checkId,
                status: 'completed',
                completed_at: new Date().toISOString(),
                conclusion,
                output: {
                    title: this.name,
                    summary,
                    text: results.summary,
                },
            });
        } catch (err) {
            throw wrapError('Failed to complete check run', err);
        }
    }
}

const generateSummaryMarkdown = (results: TestOutput) => {
    const passed = results.totals.passed;
    const failed = results.totals.total - results.totals.passed - results.totals.skipped;
    const skipped = results.totals.skipped;
    const total = results.totals.total;
    const totalNotSkipped = total - skipped;
    const passPc = Math.round((passed / totalNotSkipped) * 100);
    const failPc = Math.round((failed / totalNotSkipped) * 100);

    const lines: string[] = [];
    if (passed > 0) {
        lines.push(`### ✅ ${passPc}% Passed <sup>(${passed}/${totalNotSkipped})</sup>`);
    }
    if (failed > 0) {
        lines.push(`### ❌ ${failPc}% Failed <sup>(${failed}/${totalNotSkipped})</sup>`);
    }
    if (skipped > 0) {
        lines.push(`#### 🚧 ${skipped} test${skipped > 1 ? 's' : ''} skipped`);
    }

    return lines.join('\n');
};

function wrapError<T>(name: string, err: T): T {
    if (err instanceof Error) {
        err.message = err.name + ': ' + err.message;
        err.name = name;
    }
    return err;
}
