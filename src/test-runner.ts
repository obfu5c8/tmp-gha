import { Config } from './config';
import { streamFormattedResultsToStdout } from './formatters/cli-formatter';
import { generateSummary } from './formatters/summary-formatter';
import { countTestResults, TestResultTotals } from './formatters/test-counter';
import { spawnBashCommand } from './runner';
import { LabelledPromiseWaitier } from './util/promises';
import { createFileSink } from './util/stream-helpers';

interface testOutput {
    passed: boolean;
    summary: string;
    totals: TestResultTotals;
}

export async function runTests(config: Config): Promise<testOutput> {
    //==< Collect all the async stuff to wait for  >================|
    const bgTasks = new LabelledPromiseWaitier();

    //==< Set up the test runner >==================================|
    const testRunner = spawnBashCommand(config.testCmd, {
        cwd: config.testDir,
    });

    //==< Pipe test output to file >================================|
    if (config.jsonOutputFile) {
        const fileSink = createFileSink(config.jsonOutputFile);
        testRunner.pipe(fileSink);
        bgTasks.add('filesink', fileSink);
    }

    //==< Calculate totals >============================|
    bgTasks.add('totals', countTestResults(testRunner.stdout, config));

    //==< Write full results to stdout >============================|
    bgTasks.add('cli', streamFormattedResultsToStdout(testRunner.stdout, config));

    //==< Capture summary markdown as a string >====================|
    bgTasks.add('summary', generateSummary(testRunner.stdout, config));

    //==< Start the pipeline >======================================|
    const testRunnerPromise = testRunner.execute();
    bgTasks.add('testrunner', testRunnerPromise);

    //==< Wait for pipeline to complete >===========================|
    // const results = await Promise.all(thingsToWaitFor)

    /* eslint-disable no-console */
    const results = (await bgTasks.wait()) as {
        testrunner: {
            code: number;
        };
        totals: TestResultTotals;
        summary: string;
    };

    return {
        passed: results.testrunner.code === 0,
        summary: results.summary,
        totals: results.totals,
    };
}
