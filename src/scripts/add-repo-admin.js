import { Octokit } from "@octokit/rest";

/**
 * Adds a repository admin to the private mirror.
 *
 * @param {string} actor The actor to be added as an admin.
 * @param {string} privateMirrorName The name of the private mirror.
 * @param {string} adminToken The admin token for authentication.
 * @returns {Promise<boolean>} Resolves with true if the admin was added successfully.
 */

export async function addRepoAdmin(actor, privateMirrorName, adminToken) {
    console.log(`Adding ${actor} as a repo admin to ${privateMirrorName}...`);
    
    // Initialize Octokit with the admin token
    const octokit = new Octokit({ auth: adminToken });

    try {
        // Add the repo admin using Octokit
        const response = await octokit.rest.repos.addCollaborator({
            owner: privateMirrorName.split("/")[0],
            repo: privateMirrorName.split("/")[1],
            username: actor,
            permission: "admin"
        });

        console.log(`Admin added successfully`);

        // Return Success message
        return true;
    } catch (error) {
        throw new Error(`Failed to add admin: ${error.message}`);
    }

}