import { Octokit } from '@octokit/rest';

/**
 * Creates a public fork of the upstream repository.
 *
 * @param {string} privateMirrorName The upstream repository to fork (format: owner/repo).
 * @param {string} adminToken The admin token for authentication.
 * @param {string} organization The organization to create the fork in.
 * @returns {Promise<string>} Resolves with the private mirror name.
 */

export async function createRepo(privateMirrorName, adminToken, organization) {
    
    // Validate privateMirrorName
    // It is supposed to be an alphanumeric string with dashes and underscores
    if (!/^[\w-]+$/.test(privateMirrorName)) {
        throw new Error(`Invalid repository name: ${privateMirrorName}.`);
    }

    console.log(`Creating private mirror ${privateMirrorName} for ${actor} in ${organization}...`);

    // Initialize Octokit with the admin token
    const octokit = new Octokit({ auth: adminToken });

    try {
        // Create the repository using Octokit
        const response = await octokit.rest.repos.createInOrg({
            organization,
            privateMirrorName
        });

        console.log(`Repository created successfully: ${response.data.full_name}`);

        // Return the private mirror name
        return response.data.full_name;
    } catch (error) {
        throw new Error(`Failed to create repository: ${error.message}`);
    }
    
}