import * as core from '@actions/core'
import { createPublicFork } from './scripts/create-public-fork.js'
import { createRepo } from './scripts/create-repo.js'
import { addRepoAdmin } from './scripts/add-repo-admin.js'
import { syncForkToMirror } from './scripts/sync-fork-to-mirror.js'

/**
 * The main function for the action.
 *
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run() {
  try {
    // Get the input parameters
    const upstreamRepo = core.getInput('upstream-repo', { required: true })
    const privateMirrorName = core.getInput('private-mirror-name', { required: true })
    const actor = core.getInput('actor', { required: true })
    const adminToken = core.getInput('admin-token', { required: true })
    const organization = core.getInput('organization', { required: true })

    // Example usage of inputs
    core.debug(`Upstream Repo: ${upstreamRepo}`)
    core.debug(`Private Mirror Name: ${privateMirrorName}`)
    core.debug(`Actor: ${actor}`)
    core.debug(`Admin Token: ${adminToken}`)
    core.debug(`Organization: ${organization}`)

    // call createPublicFork function
    const publicFork = await createPublicFork(upstreamRepo, adminToken, organization)
    core.debug(`Public Fork: ${publicFork}`)
    const privateMirror = await createRepo(privateMirrorName, adminToken, organization)
    core.debug(`Private Mirror: ${privateMirror}`)
    // call syncForkToMirror function
    await syncForkToMirror(publicFork, privateMirror)
    core.debug(`Sync Fork to Mirror: ${publicFork} to ${privateMirror}`)
    const addAdmin = await addRepoAdmin(actor, privateMirror, adminToken)
    core.debug(`Add Admin: ${addAdmin}`)

    // Set outputs to be used in the workflow
    core.setOutput('public-fork', publicFork)
    core.setOutput('private-mirror', privateMirror)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
