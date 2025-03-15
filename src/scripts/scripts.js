import { Octokit } from '@octokit/rest'
import * as core from '@actions/core'
import { exec } from 'child_process'
import util from 'util'

const execPromise = util.promisify(exec)

/**
 * Adds a repository admin to the private mirror.
 *
 * @param {string} actor The actor to be added as an admin.
 * @param {string} privateMirrorNameWithOwner The name of the private mirror.
 * @param {string} adminToken The admin token for authentication.
 * @returns {Promise<boolean>} Resolves with true if the admin was added successfully.
 */
export async function addRepoAdmin(
  actor,
  privateMirrorNameWithOwner,
  adminToken
) {
  console.log(
    `Adding ${actor} as a repo admin to ${privateMirrorNameWithOwner}...`
  )
  // Validate the format of privateMirrorNameWithOwner
  if (!/^[\w-]+\/[\w-]+$/.test(privateMirrorNameWithOwner)) {
    throw new Error(
      `Invalid repository name: ${privateMirrorNameWithOwner}. Expected format: owner/repo.`
    )
  }
  const octokit = new Octokit({ auth: adminToken })

  try {
    await octokit.rest.repos.addCollaborator({
      owner: privateMirrorNameWithOwner.split('/')[0],
      repo: privateMirrorNameWithOwner.split('/')[1],
      username: actor,
      permission: 'admin'
    })

    console.log(`Admin added successfully to ${privateMirrorNameWithOwner}`)
    core.debug(`Admin added successfully to ${privateMirrorNameWithOwner}`)
    return true
  } catch (error) {
    throw new Error(`Failed to add admin: ${error.message}`)
  }
}

/**
 * Creates a private repository in the specified organization.
 *
 * @param {string} privateMirrorName The name of the private repository.
 * @param {string} adminToken The admin token for authentication.
 * @param {string} organization The organization to create the repository in.
 * @returns {Promise<string>} Resolves with the private mirror name.
 */
export async function createRepo(privateMirrorName, adminToken, organization) {
  if (!/^[\w-]+$/.test(privateMirrorName)) {
    throw new Error(`Invalid repository name: ${privateMirrorName}.`)
  }

  console.log(
    `Creating private mirror ${privateMirrorName} in ${organization}...`
  )

  const octokit = new Octokit({ auth: adminToken })

  try {
    const response = await octokit.rest.repos.createInOrg({
      org: organization,
      name: privateMirrorName,
      visibility: 'private'
    })

    console.log(`Repository created successfully: ${response.data.full_name}`)
    return response.data.full_name
  } catch (error) {
    throw new Error(`Failed to create repository: ${error.message}`)
  }
}

/**
 * Creates a public fork of the upstream repository.
 *
 * @param {string} upstreamRepo The upstream repository to fork (format: owner/repo).
 * @param {string} adminToken The admin token for authentication.
 * @param {string} organization The organization to create the fork in.
 * @returns {Promise<string>} Resolves with the public fork name.
 */
export async function createPublicFork(upstreamRepo, adminToken, organization) {
  if (!/^[\w-]+\/[\w-]+$/.test(upstreamRepo)) {
    throw new Error(
      `Invalid upstreamRepo format: ${upstreamRepo}. Expected format: owner/repo.`
    )
  }

  console.log(`Forking ${upstreamRepo} as a public fork in ${organization}...`)

  const [owner, repo] = upstreamRepo.split('/')
  const octokit = new Octokit({ auth: adminToken })

  try {
    const response = await octokit.repos.createFork({
      owner,
      repo,
      organization
    })

    console.log(`Fork created successfully: ${response.data.full_name}`)
    return response.data.full_name
  } catch (error) {
    throw new Error(`Failed to create fork: ${error.message}`)
  }
}

/**
 * Syncs a public fork to a private mirror.
 *
 * @param {string} publicFork The URL of the public fork.
 * @param {string} privateMirror The URL of the private mirror.
 * @param {string} adminToken The admin token for authentication.
 * @returns {Promise<void>} Resolves when the operation is complete.
 */
export async function syncForkToMirror(publicFork, privateMirror, adminToken) {
  try {
    // Set up Git credentials
    core.debug(`Setting up Git credentials`)
    await execPromise(`git config --global user.name "github-actions[bot]"`)
    await execPromise(
      `git config --global user.email "github-actions[bot]@users.noreply.github.com"`
    )
    await execPromise(
      `git config --global credential.helper '!f() { echo "username=x-access-token"; echo "password=${adminToken}"; }; f'`
    )

    core.debug(`Cloning the public fork: ${publicFork}`)
    const publicForkUrl = `https://github.com/${publicFork}.git`
    await retryClone(publicForkUrl)

    core.debug(`Changing directory to the cloned repository`)
    const repoName = publicFork.split('/')[1]
    process.chdir(repoName)
    // list the files in the directory
    core.debug(`Current directory: ${process.cwd()}`)
    core.debug(`Files in the directory: ${await execPromise('ls -la')}`)

    core.debug(`Adding the private mirror as a remote`)
    const privateMirrorUrl = `https://github.com/${privateMirror}.git`
    await execPromise(`git remote add privatemirror ${privateMirrorUrl}`)

    const { stdout: remoteOutput } = await execPromise(`git remote -v`)
    core.debug(`Remote output: ${remoteOutput}`)

    core.debug(`Pushing to the private mirror`)
    await execPromise(`git push privatemirror --all`)
    await execPromise(`git push privatemirror --tags`)

    core.debug(`Successfully pushed to the private mirror`)

    core.debug(`Cleaning up the cloned repository`)
    try {
      await execPromise(`[ -d "${repoName}" ] && rm -rf ${repoName}`)
      core.debug(`Cleaned up the cloned repository`)
    } catch (error) {
      core.debug(`No repository directory found to clean up: ${repoName}`)
    }
    core.debug(`Cleaned up the cloned repository`)
    core.debug(`Fork ${publicFork} synced to mirror ${privateMirror}`)
  } catch (error) {
    core.setFailed(`Failed to sync fork to mirror: ${error.message}`)
    core.error(error.stack)
    throw error
  }
}

/**
 * Retries the git clone operation with a specified number of retries and delay.
 * 

 * @param {string} publicForkUrl The URL of the public fork to clone.
 * @param {number} [retries=5] The number of retries for cloning.
 * @param {number} [delay=3000] The delay between retries in milliseconds.
 */
async function retryClone(publicForkUrl, retries = 5, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await execPromise(`git clone ${publicForkUrl}`)
      return
    } catch (error) {
      if (i === retries - 1) throw error
      console.log(`Retrying clone... (${i + 1}/${retries})`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
}
