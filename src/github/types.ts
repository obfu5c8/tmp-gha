import type { getOctokit } from '@actions/github';

export type GithubClient = ReturnType<typeof getOctokit>;
