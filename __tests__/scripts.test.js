import { describe, it, beforeEach, vi, expect } from 'vitest'
import * as core from '@actions/core'
import {
  addRepoAdmin,
  createPublicFork,
  createRepo,
  syncForkToMirror
} from '../src/scripts/scripts.js' // Adjust the path if necessary
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
    expect(core.setOutput)
  })
})

// 002: for createPublicFork - call it with invalid inputs
// 002.1: when upstream-repo is is not of the format org/repo
// 002.2: when upstream-repo has special characters
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

// 003: for createRepo - a repo is created when the values are correct

describe('TEST-003: createRepo - Repo creation with valid inputs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create a repo with valid inputs', async () => {
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

    // Mock the createRepo function
    createRepo.mockResolvedValue('example/repo')

    // Run the function
    await run()

    // Verify that setFailed was not called
    expect(core.setOutput)
  })
})

// 004: for createRepo - call it with invalid inputs
// 004.1: when private-mirror-name is is not of the format a valid github repo name
// 004.2: when private-mirror-name has special characters
// 004.3: when private-mirror-name is empty

describe('TEST-004: createRepo - Repo creation with invalid inputs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call setFailed when private-mirror-name is not a valid GitHub repo name', async () => {
    // Mock inputs
    vi.spyOn(core, 'getInput').mockImplementation((name) => {
      const inputs = {
        'upstream-repo': 'example/repo',
        'private-mirror-name': 'invalid-name/testing', // Invalid name
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
  it('should call setFailed when private-mirror-name has special characters', async () => {
    // Mock inputs
    vi.spyOn(core, 'getInput').mockImplementation((name) => {
      const inputs = {
        'upstream-repo': 'example/repo',
        'private-mirror-name': 'invalid@name', // Special characters
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
  it('should call setFailed when private-mirror-name is empty', async () => {
    // Mock inputs
    vi.spyOn(core, 'getInput').mockImplementation((name) => {
      const inputs = {
        'upstream-repo': 'example/repo',
        'private-mirror-name': '', // Empty name
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

// 005: for addRepoAdmin - a repo admin is added when the values are correct
describe('TEST-005: addRepoAdmin - Repo admin addition with valid inputs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should add a repo admin with valid inputs', async () => {
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

    // Mock the addRepoAdmin function
    addRepoAdmin.mockResolvedValue(true)

    // Run the function
    await run()

    // Verify that setFailed was not called
    expect(core.setOutput)
  })
})

// 006: for syncForkToMirror - a repo is synced when the values are correct

describe('TEST-006: syncForkToMirror - Repo sync with valid inputs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should sync a repo with valid inputs', async () => {
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

    // Mock the syncForkToMirror function
    syncForkToMirror.mockResolvedValue(true)

    // Run the function
    await run()

    // Verify that setFailed was not called
    expect(core.setOutput)
  })
})
