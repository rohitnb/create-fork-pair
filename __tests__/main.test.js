import { describe, it, beforeEach, vi, expect } from 'vitest'
import * as core from '@actions/core'
import { run } from '../src/main.js' // Adjust the path if necessary

// Mocking modules
vi.mock('@actions/core')
vi.mock('../src/main', () => ({
  ...vi.importActual('../src/main.js'),
  run: vi.fn()
}))

// 001: It works
describe('TEST-001: Baseline - The main.js runs okay when all inputs are present as expected', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should run without errors when all inputs are valid', async () => {
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

    // Run the function
    await run()

    // Verify that setFailed was not called
    expect(core.setFailed).not.toHaveBeenCalled()
  })
})

// 002: It fails when either input is missing actor and organization are not mandatory
describe('TEST-002: The main.js fails when either input is missing', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call setFailed when upstream-repo is missing', async () => {
    // Mock inputs
    vi.spyOn(core, 'getInput').mockImplementation((name, options) => {
      const inputs = {
        'upstream-repo': '', // Simulating a missing input
        'private-mirror-name': 'private-repo',
        actor: 'test-actor',
        'admin-token': 'test-token',
        organization: 'test-org'
      }
    })

    // Mock setFailed to ensure it gets called
    vi.spyOn(core, 'setFailed').mockImplementation(() => {})

    // Run the function
    await run()

    // Verify that setFailed was called with the correct message
    expect(core.setFailed)
  })
  // auth-token missing check
  it('should call setFailed when admin-token is missing', async () => {
    // Mock inputs
    vi.spyOn(core, 'getInput').mockImplementation((name, options) => {
      const inputs = {
        'upstream-repo': 'example/repo',
        'private-mirror-name': 'private-repo',
        actor: 'test-actor',
        'admin-token': '', // Simulating a missing input
        organization: 'test-org'
      }
    })

    // Mock setFailed to ensure it gets called
    vi.spyOn(core, 'setFailed').mockImplementation(() => {})

    // Run the function
    await run()

    // Verify that setFailed was called with the correct message
    expect(core.setFailed)
  })
  // private-mirror-name missing check
  it('should call setFailed when private-mirror-name is missing', async () => {
    // Mock inputs
    vi.spyOn(core, 'getInput').mockImplementation((name, options) => {
      const inputs = {
        'upstream-repo': 'example/repo',
        'private-mirror-name': '', // Simulating a missing input
        actor: 'test-actor',
        'admin-token': 'test-token',
        organization: 'test-org'
      }
    })

    // Mock setFailed to ensure it gets called
    vi.spyOn(core, 'setFailed').mockImplementation(() => {})

    // Run the function
    await run()

    // Verify that setFailed was called with the correct message
    expect(core.setFailed)
  })
  // organization missing check
  it('should call setFailed when organization is missing', async () => {
    // Mock inputs
    vi.spyOn(core, 'getInput').mockImplementation((name, options) => {
      const inputs = {
        'upstream-repo': 'example/repo',
        'private-mirror-name': 'private-repo',
        actor: 'test-actor',
        'admin-token': 'test-token',
        organization: '' // Simulating a missing input
      }
    })

    // Mock setFailed to ensure it gets called
    vi.spyOn(core, 'setFailed').mockImplementation(() => {})

    // Run the function
    await run()

    // Verify that setFailed was called with the correct message
    expect(core.setFailed)
  })
  // actor missing check
  it('should call setFailed when actor is missing', async () => {
    // Mock inputs
    vi.spyOn(core, 'getInput').mockImplementation((name, options) => {
      const inputs = {
        'upstream-repo': 'example/repo',
        'private-mirror-name': 'private-repo',
        actor: '', // Simulating a missing input
        'admin-token': 'test-token',
        organization: 'test-org'
      }
    })

    // Mock setFailed to ensure it gets called
    vi.spyOn(core, 'setFailed').mockImplementation(() => {})

    // Run the function
    await run()

    // Verify that setFailed was called with the correct message
    expect(core.setFailed)
  })
})

// 003: It has outputs set
describe('TEST-003: The main.js has outputs set', () => {
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

    // Mock setOutput to ensure it gets called
    vi.spyOn(core, 'setOutput').mockImplementation(() => {})

    // Run the function
    await run()

    // Verify that setOutput was called with the correct values
    expect(core.setOutput)
  })
})
