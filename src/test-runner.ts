import { Config } from './config';
import { streamFormattedResultsToStdout } from './processors/cli-formatter';
import { streamJsonToFile } from './processors/stream-json-to-file';
import { generateSummary } from './processors/summary-formatter';
import { calculateTotals, TestResultTotals } from './processors/test-counter';
import { promiseMapAll } from './util/promises';
import { spawnChild } from './util/streams';

export interface TestOutput {
    passed: boolean;
    summary: string;
    totals: TestResultTotals;
}

export async function runTests(config: Config): Promise<TestOutput> {
    //==< Set up the test runner >=====================================|
    const testRunner = spawnChild('bash', ['-c', config.testCmd], {
        cwd: config.testDir,
        onExit(code, signal) {
            if (code && code > 1) {
                return new Error(`Bad exit code ${code}`);
            }
        },
    });

    //==< Run our processing pipelines >===============================|
    const results = await promiseMapAll({
        // Format the full results output and pipe to stdout
        cli: streamFormattedResultsToStdout(testRunner, config),
        // Generate a summary as markdown to use later
        summary: generateSummary(testRunner, config),
        // Calculate totals & pass rates for the run
        totals: calculateTotals(testRunner, config),
        // Stream raw test result json to a file
        jsonFile: !!config.jsonOutputFile && streamJsonToFile(testRunner, config.jsonOutputFile),
    });

    return {
        passed: results.totals.passed == results.totals.total - results.totals.skipped,
        totals: results.totals,
        summary: results.summary,
    };
}
