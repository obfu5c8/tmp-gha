export interface Config {
    /** The directory from which to execute testCmd */
    testDir: string;

    /** The command to execute to output test results */
    testCmd: string;

    /** The display name of the test run */
    displayName: string;

    /** Github auth token */
    githubToken: string;

    /** File to write json results to */
    jsonOutputFile?: string;

    /** Amount of detail to show in summary */
    summaryDetail: 'all' | 'failed' | 'not-passed';

    /** If true, skip all github interactions (useful for debugging locally) */
    skipGithub?: boolean;

    githubRepo: {
        owner: string;
        repo: string;
    };
    githubSha: string;
}
