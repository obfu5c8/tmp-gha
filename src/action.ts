import * as github from '@actions/github'
import { ActionInputs, getConfigFromActionInputs } from "./action-inputs";
import { spawnAsync, spawnBashCommand, streamTestResultsToSummaryString } from "./runner";
import { asyncPipeline, createFileSink, spawnStreamDuplex } from './util/stream-helpers';
import { LabelledPromiseWaitier } from './util/promises';
import { generateSummary2 } from './summary-formatter';



export async function executeAction(inputs: ActionInputs) {

    //==< Generate config from inputs >=============================|
    const config = getConfigFromActionInputs(inputs)


    //==< Collect all the async stuff to wait for  >================|
    const bgTasks = new LabelledPromiseWaitier()


    //==< Set up the test runner >==================================|
    const testRunner = spawnBashCommand(config.testCmd, {
        cwd: config.testDir,
    })


    //==< Pipe test output to file >================================|
    if (config.jsonOutputFile) {
        const fileSink = createFileSink(config.jsonOutputFile)
        testRunner.stdout.pipe(fileSink)
        bgTasks.add('filesink', fileSink)
    }

    //==< Write full results to stdout >============================|
    const cliOut = asyncPipeline(testRunner.stdout, spawnStreamDuplex('gotestfmt-bad'), process.stdout)
    bgTasks.add('cli', cliOut)


    //==< Capture summary markdown as a string >====================|
    bgTasks.add('summary', generateSummary2(testRunner.stdout, config))
     

    //==< Start the pipeline >======================================|
    const testRunnerPromise = testRunner.execute()
    bgTasks.add('testrunner', testRunnerPromise)


    //==< Capture testRunner's exit code >==========================|
    let testRunnerExitCode: number|null = null
    testRunnerPromise.then(out => {
        testRunnerExitCode = out.code
    })


    //==< Wait for pipeline to complete >===========================|
    // const results = await Promise.all(thingsToWaitFor)
    try {
        const results = await bgTasks.wait()
        console.log('%s', results.summary)
        }
    catch (err) {
        console.error("I GOT ERRORZ", err)
    }

    

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
