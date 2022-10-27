import { actionsCore, actionsGithub } from "./types"
import type { Octokit } from '@octokit/core';

interface createCommitArgs {
    core: actionsCore
    github: Octokit
}

export default async function createCommit({core, github}: createCommitArgs) {
    core.info('Creating tree')

    const tree = await github.git.createTree({
      ...tools.context.repo,
      tree: [
        {
          path: 'action.yml',
          mode: '100644',
          type: 'blob',
          content: await readFile(tools.workspace, 'action.yml')
        },
        {
          path: main,
          mode: '100644',
          type: 'blob',
          content: await readFile(tools.workspace, main)
        }
      ]
    })
  
    tools.log.complete('Tree created')
  
    tools.log.info('Creating commit')
    const commit = await tools.github.git.createCommit({
      ...tools.context.repo,
      message: 'Automatic compilation',
      tree: tree.data.sha,
      parents: [tools.context.sha]
    })
    tools.log.complete('Commit created')
  
    return commit.data
  }
