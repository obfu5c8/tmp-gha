import * as github from '@actions/github';

export const getGithubClient = (token: string) =>
    github.getOctokit(token, {
        userAgent: 'wetransfer/gh-action-go-test',
    });
