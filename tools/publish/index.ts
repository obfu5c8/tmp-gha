/**
 * Publish script that is run to publish a new version
 *
 * Most of this code was stolen from https://github.com/JasonEtco/build-and-tag-action
 * with some changes/additions to support including additional files
 */
import * as github from '@actions/github'
import * as core from '@actions/core'
import log from './log'

interface publishargs {
    tagName: string
    core: typeof import('@actions/core')
    github: typeof import('@actions/github')
}


const tagName = 'foo';


export default async function publish() {

    if (!tagName) {
        core.error('No tag specified. Unable to publish');
        return;
    }
    log.info(`Publishing release ${tagName}`);


}



publish()
