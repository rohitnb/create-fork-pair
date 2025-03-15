export const addRepoAdmin = jest.fn(() => Promise.resolve(true))

export const createRepo = jest.fn(() =>
  Promise.resolve('test-org/private-mirror')
)

export const createPublicFork = jest.fn(() =>
  Promise.resolve('test-org/repo-fork')
)

export const syncForkToMirror = jest.fn(() => Promise.resolve())
