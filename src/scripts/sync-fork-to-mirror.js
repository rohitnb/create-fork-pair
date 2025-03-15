import * as core from '@actions/core'
import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)

/**
 * Checks out the public fork, adds the private mirror as a remote, and pushes to the private mirror.
 *
 * @param {string} publicFork The URL of the public fork.
 * @param {string} privateMirror The URL of the private mirror.
 * @returns {Promise<void>} Resolves when the operation is complete.
 */
export async function syncForkToMirror(publicFork, privateMirror) {
  try {
    core.debug(`Cloning the public fork: ${publicFork}`)
    const publicForkUrl = `https://github.com/${publicFork}.git`
    await execPromise(`git clone ${publicForkUrl}`)

    core.debug(`Changing directory to the cloned repository`)
    const repoName = publicFork.split('/')[1]
    process.chdir(repoName)

    core.debug(`Adding the private mirror as a remote`)
    const privateMirrorUrl = `https://github.com/${privateMirror}.git`
    await execPromise(`git remote add privatemirror ${privateMirrorUrl}`)
    // run git remote -v
    const { stdout: remoteOutput } = await execPromise(`git remote -v`)
    core.debug(`Remote output: ${remoteOutput}`)

    core.debug(`Pushing to the private mirror`)
    await execPromise(`git push privatemirror --all`)
    await execPromise(`git push privatemirror --tags`)

    core.debug(`Successfully pushed to the private mirror`)
  } catch (error) {
    core.setFailed(`Failed to sync fork to mirror: ${error.message}`)
    throw error
  }
}
