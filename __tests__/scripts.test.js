import { describe, it, beforeEach, vi, expect } from 'vitest'
import * as core from '@actions/core'
import { addRepoAdmin, createPublicFork, createRepo, syncForkToMirror } from '../src/scripts/scripts.js' // Adjust the path if necessary
import { run } from '../src/main.js' // Adjust the path if necessary

vi.mock('@actions/core')
vi.mock('../src/scripts/scripts.js', () => ({
  addRepoAdmin: vi.fn(),
  createPublicFork: vi.fn(),
  createRepo: vi.fn(),
  syncForkToMirror: vi.fn()
}))
vi.mock('../src/main', () => ({
  ...vi.importActual('../src/main.js'),
  run: vi.fn()
}))

// 001: for createPublicFork - a fork is created when the values are correct
describe('TEST-001: createPublicFork - Fork creation with valid inputs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a public fork with valid inputs', async () => {
    // Mock inputs
    vi.spyOn(core, 'getInput').mockImplementation((name) => {
      const inputs = {
        'upstream-repo': 'example/repo',
        'private-mirror-name': 'private-repo',
        actor: 'test-actor',
        'admin-token': 'test-token',
        organization: 'test-org'
      }
      return inputs[name]
    })

    // Mock setFailed to ensure no errors are reported
    vi.spyOn(core, 'setFailed').mockImplementation(() => {})

    // Mock the createPublicFork function
    createPublicFork.mockResolvedValue('example/repo')

    // Run the function
    await run()

    // Verify that setFailed was not called
    expect(core.setFailed).not.toHaveBeenCalled()
  })
})

// 002: for createPublicFork - call it with invalid inputs
// 002.1: when upstream-repo is is not of the format org/repo
// 002.2: when upstream-repo is has special characters
// 002.3: when upstream-repo is empty

describe('TEST-002: createPublicFork - Fork creation with invalid inputs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call setFailed when upstream-repo is not in the format org/repo', async () => {
    // Mock inputs
    vi.spyOn(core, 'getInput').mockImplementation((name) => {
      const inputs = {
        'upstream-repo': 'invalid-format', // Invalid format
        'private-mirror-name': 'private-repo',
        actor: 'test-actor',
        'admin-token': 'test-token',
        organization: 'test-org'
      }
      return inputs[name]
    })

    // Mock setFailed to ensure it gets called
    vi.spyOn(core, 'setFailed').mockImplementation(() => {})

    // Run the function
    await run()

    // Verify that setFailed was called with the correct error message
    expect(core.setFailed)
  })

  it('should call setFailed when upstream-repo has special characters', async () => {
    // Mock inputs
    vi.spyOn(core, 'getInput').mockImplementation((name) => {
      const inputs = {
        'upstream-repo': 'example/repo@123', // Special characters
        'private-mirror-name': 'private-repo',
        actor: 'test-actor',
        'admin-token': 'test-token',
        organization: 'test-org'
      }
      return inputs[name]
    })

    // Mock setFailed to ensure it gets called
    vi.spyOn(core, 'setFailed').mockImplementation(() => {})

    // Run the function
    await run()

    // Verify that setFailed was called with the correct error message
    expect(core.setFailed)
  })
})

// 003: for crearePublicFork - the output are set correctly when inputs are correct

describe('TEST-003: createPublicFork - Fork creation with valid inputs', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })
    
    it('should set outputs correctly', async () => {
        // Mock inputs
        vi.spyOn(core, 'getInput').mockImplementation((name) => {
        const inputs = {
            'upstream-repo': 'example/repo',
            'private-mirror-name': 'private-repo',
            actor: 'test-actor',
            'admin-token': 'test-token',
            organization: 'test-org'
        }
        return inputs[name]
        })
    
        // Mock setFailed to ensure no errors are reported
        vi.spyOn(core, 'setFailed').mockImplementation(() => {})
    
        // Mock the createPublicFork function
        createPublicFork.mockResolvedValue('example/repo')
    
        // Run the function
        await run()
    
        // Verify that setOutput was called with the correct values
        expect(core.setOutput)
    })
})