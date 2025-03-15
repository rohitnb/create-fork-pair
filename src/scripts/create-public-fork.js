import { Octokit } from '@octokit/rest'

/**
 * Creates a public fork of the upstream repository.
 *
 * @param {string} upstreamRepo The upstream repository to fork (format: owner/repo).
 * @param {string} adminToken The admin token for authentication.
 * @param {string} organization The organization to create the fork in.
 * @returns {Promise<string>} Resolves with the public fork name.
 */
export async function createPublicFork(upstreamRepo, adminToken, organization) {
  // Validate upstreamRepo format
  if (!/^[\w-]+\/[\w-]+$/.test(upstreamRepo)) {
    throw new Error(
      `Invalid upstreamRepo format: ${upstreamRepo}. Expected format: owner/repo.`
    )
  }

  console.log(`Forking ${upstreamRepo} as a public fork in ${organization}...`)

  // Extract owner and repo from upstreamRepo
  const [owner, repo] = upstreamRepo.split('/')

  // Initialize Octokit with the admin token
  const octokit = new Octokit({ auth: adminToken })

  try {
    // Create the fork using Octokit
    const response = await octokit.repos.createFork({
      owner,
      repo,
      organization
    })

    console.log(`Fork created successfully: ${response.data.full_name}`)

    // Return the public fork name
    return response.data.full_name
  } catch (error) {
    throw new Error(`Failed to create fork: ${error.message}`)
  }
}
