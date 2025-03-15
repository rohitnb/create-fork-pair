/**
 * Unit tests for the action's main functionality, src/main.js
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import { wait } from '../__fixtures__/wait.js'
import {
  createPublicFork,
  createRepo,
  addRepoAdmin,
  syncForkToMirror
} from '../__fixtures__/scripts.js'

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../src/wait.js', () => ({ wait }))
/**
 * Unit tests for the action's main functionality, src/main.js
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('../src/scripts/scripts.js', () => ({
  createPublicFork,
  createRepo,
  addRepoAdmin,
  syncForkToMirror
}))

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.js', () => {
  beforeEach(() => {
    // Set the action's inputs as return values from core.getInput().
    core.getInput.mockImplementation((input) => {
      const inputs = {
        'upstream-repo': 'owner/repo',
        'private-mirror-name': 'private-mirror',
        actor: 'test-actor',
        'admin-token': 'test-token',
        organization: 'test-org'
      }
      return inputs[input]

    // Mock the script functions to return resolved promises.
    createPublicFork.mockImplementation(() =>
      Promise.resolve('https://github.com/test-org/repo-fork')
    )
    createRepo.mockImplementation(() =>
      Promise.resolve('https://github.com/test-org/private-mirror')
    )
    addRepoAdmin.mockImplementation(() => Promise.resolve(true))
    syncForkToMirror.mockImplementation(() => Promise.resolve())
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Runs successfully and sets outputs', async () => {
    await run()

    // Verify the outputs were set correctly.
    expect(core.setOutput).toHaveBeenNthCalledWith(
      1,
      'public-fork',
      'https://github.com/test-org/repo-fork'
    )
    expect(core.setOutput).toHaveBeenNthCalledWith(
      2,
      'private-mirror',
      'https://github.com/test-org/private-mirror'
    )
  })

  it('Fails when createPublicFork throws an error', async () => {
    createPublicFork.mockRejectedValueOnce(new Error('Fork creation failed'))

    await run()

    // Verify that the action was marked as failed.
    expect(core.setFailed).toHaveBeenNthCalledWith(1, 'Fork creation failed')
  })

  it('Fails when createRepo throws an error', async () => {
    createRepo.mockRejectedValueOnce(new Error('Repo creation failed'))

    await run()

    // Verify that the action was marked as failed.
    expect(core.setFailed).toHaveBeenNthCalledWith(1, 'Repo creation failed')
  })

  it('Fails when syncForkToMirror throws an error', async () => {
    syncForkToMirror.mockRejectedValueOnce(new Error('Sync failed'))

    await run()

    // Verify that the action was marked as failed.
    expect(core.setFailed).toHaveBeenNthCalledWith(1, 'Sync failed')
  })

  it('Fails when addRepoAdmin throws an error', async () => {
    addRepoAdmin.mockRejectedValueOnce(new Error('Add admin failed'))

    await run()

    // Verify that the action was marked as failed.
    expect(core.setFailed).toHaveBeenNthCalledWith(1, 'Add admin failed')
  })
})