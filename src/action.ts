import { ActionInputs, getConfigFromActionInputs } from './action-inputs';
import { runTests } from './test-runner';

export async function executeAction(inputs: ActionInputs) {
    //==< Generate config from inputs >=============================|
    const config = getConfigFromActionInputs(inputs);

    try {
        const results = await runTests(config);

        console.log('hello stdout!');
        console.error(results);
    } catch (err) {
        console.error('Failed to run tests:', err);
    }

    /* eslint-enable no-console */

    //==< Configure the github client >=================|
    // const gh = github.getOctokit(config.githubToken, {
    //     userAgent: 'wetransfer/gh-action-go-test'
    // })
    //

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
