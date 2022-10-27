import { ActionInputs, getConfigFromActionInputs } from './action-inputs';
import { streamFormattedResultsToStdout } from './formatters/cli-formatter';
import { generateSummary } from './formatters/summary-formatter';
import { spawnBashCommand } from './runner';
import { LabelledPromiseWaitier } from './util/promises';
import { createFileSink } from './util/stream-helpers';

export async function executeAction(inputs: ActionInputs) {
    //==< Generate config from inputs >=============================|
    const config = getConfigFromActionInputs(inputs);

    //==< Collect all the async stuff to wait for  >================|
    const bgTasks = new LabelledPromiseWaitier();

    //==< Set up the test runner >==================================|
    const testRunner = spawnBashCommand(config.testCmd, {
        cwd: config.testDir,
    });

    //==< Pipe test output to file >================================|
    if (config.jsonOutputFile) {
        const fileSink = createFileSink(config.jsonOutputFile);
        testRunner.stdout.pipe(fileSink);
        bgTasks.add('filesink', fileSink);
    }

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
    try {
        const results = await bgTasks.wait();
        console.error('DONE DONE DINE');
        console.error('%s', results.summary);
        console.error(results);
    } catch (err) {
        console.error('I GOT ERRORZ', err);
    }
    /* eslint-enable no-console */

    //==< Configure the github client >=================|
    // const gh = github.getOctokit(config.githubToken, {
    //     userAgent: 'wetransfer/gh-action-go-test'
    // })

    //==< Mark the test check as starting >=================|
    // const check = await gh.rest.checks.create({
    //     owner: github.context.repo.owner,
    //     repo: github.context.repo.repo,
    //     name: config.displayName,
    //     head_sha: github.context.sha,
    //     status: 'in_progress',
    //     started_at: new Date().toISOString(),
    // })

    //==< Run the tests & collect the output >==============|
    // const results = await executeTests({
    //     pwd,
    //     runName,
    //     goTestArgs,
    //     githubToken,
    // })

    //==< Mark the check as complete >=================|
    // await gh.rest.checks.update({
    //     owner: github.context.repo.owner,
    //     repo: github.context.repo.repo,
    //     check_run_id: check.data.id,

    //     status: 'completed',
    //     completed_at: new Date().toISOString(),
    //     conclusion: 'neutral',
    //     output: {
    //         title: runName,
    //         summary: "Some tests were run",
    //         text: results.summary
    //     }
    // })
}
