import { Octokit } from '@octokit/rest'
import * as core from '@actions/core'
import { exec } from 'child_process'
import { addRepoAdmin, createRepo, createPublicFork, syncForkToMirror } from '../src/scripts/scripts.js'

jest.mock('@octokit/rest')
jest.mock('@actions/core')
jest.mock('child_process', () => ({
  exec: jest.fn()
}))

const mockExec = jest.fn()
exec.mockImplementation(mockExec)

describe('scripts.js', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('addRepoAdmin', () => {
    it('Adds a repository admin successfully', async () => {
      const mockAddCollaborator = jest.fn().mockResolvedValue({})
      Octokit.mockImplementation(() => ({
        rest: {
          repos: { addCollaborator: mockAddCollaborator }
        }
      }))

      const result = await addRepoAdmin('test-user', 'org/repo', 'test-token')

      expect(mockAddCollaborator).toHaveBeenCalledWith({
        owner: 'org',
        repo: 'repo',
        username: 'test-user',
        permission: 'admin'
      })
      expect(result).toBe(true)
    })

    it('Throws an error when adding a repository admin fails', async () => {
      const mockAddCollaborator = jest.fn().mockRejectedValue(new Error('API error'))
      Octokit.mockImplementation(() => ({
        rest: {
          repos: { addCollaborator: mockAddCollaborator }
        }
      }))

      await expect(addRepoAdmin('test-user', 'org/repo', 'test-token')).rejects.toThrow('Failed to add admin: API error')
    })
  })

  describe('createRepo', () => {
    it('Creates a private repository successfully', async () => {
      const mockCreateInOrg = jest.fn().mockResolvedValue({
        data: { full_name: 'org/repo' }
      })
      Octokit.mockImplementation(() => ({
        rest: {
          repos: { createInOrg: mockCreateInOrg }
        }
      }))

      const result = await createRepo('repo', 'test-token', 'org')

      expect(mockCreateInOrg).toHaveBeenCalledWith({
        org: 'org',
        name: 'repo',
        visibility: 'private'
      })
      expect(result).toBe('org/repo')
    })

    it('Throws an error for invalid repository names', async () => {
      await expect(createRepo('invalid name!', 'test-token', 'org')).rejects.toThrow('Invalid repository name: invalid name!.')
    })

    it('Throws an error when repository creation fails', async () => {
      const mockCreateInOrg = jest.fn().mockRejectedValue(new Error('API error'))
      Octokit.mockImplementation(() => ({
        rest: {
          repos: { createInOrg: mockCreateInOrg }
        }
      }))

      await expect(createRepo('repo', 'test-token', 'org')).rejects.toThrow('Failed to create repository: API error')
    })
  })

  describe('createPublicFork', () => {
    it('Creates a public fork successfully', async () => {
      const mockCreateFork = jest.fn().mockResolvedValue({
        data: { full_name: 'org/repo' }
      })
      Octokit.mockImplementation(() => ({
        repos: { createFork: mockCreateFork }
      }))

      const result = await createPublicFork('owner/repo', 'test-token', 'org')

      expect(mockCreateFork).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        organization: 'org'
      })
      expect(result).toBe('org/repo')
    })

    it('Throws an error for invalid upstreamRepo format', async () => {
      await expect(createPublicFork('invalid-repo', 'test-token', 'org')).rejects.toThrow(
        'Invalid upstreamRepo format: invalid-repo. Expected format: owner/repo.'
      )
    })

    it('Throws an error when fork creation fails', async () => {
      const mockCreateFork = jest.fn().mockRejectedValue(new Error('API error'))
      Octokit.mockImplementation(() => ({
        repos: { createFork: mockCreateFork }
      }))

      await expect(createPublicFork('owner/repo', 'test-token', 'org')).rejects.toThrow('Failed to create fork: API error')
    })
  })

  describe('syncForkToMirror', () => {
    it('Syncs a public fork to a private mirror successfully', async () => {
      mockExec.mockResolvedValue({ stdout: '' })

      await syncForkToMirror('owner/repo', 'org/repo')

      expect(mockExec).toHaveBeenCalledWith('git clone https://github.com/owner/repo.git')
      expect(mockExec).toHaveBeenCalledWith('git remote add privatemirror https://github.com/org/repo.git')
      expect(mockExec).toHaveBeenCalledWith('git push privatemirror --all')
      expect(mockExec).toHaveBeenCalledWith('git push privatemirror --tags')
      expect(mockExec).toHaveBeenCalledWith('cd .. && rm -rf repo')
    })

    it('Throws an error when syncing fails', async () => {
      mockExec.mockRejectedValue(new Error('Command failed'))

      await expect(syncForkToMirror('owner/repo', 'org/repo')).rejects.toThrow('Failed to sync fork to mirror: Command failed')
    })
  })
})