# Create Fork Pair

[![Lint Codebase](https://github.com/rohitnb/create-fork-pair/actions/workflows/linter.yml/badge.svg)](https://github.com/rohitnb/create-fork-pair/actions/workflows/linter.yml)
[![Continuous Integration](https://github.com/rohitnb/create-fork-pair/actions/workflows/ci.yml/badge.svg)](https://github.com/rohitnb/create-fork-pair/actions/workflows/ci.yml)

GitHub Action to create a Public Fork and a Private Mirror of an upstream open
sourced repository.

- **Public Fork**: Is a direct fork of an upstream repository and is used to
  contribute to the upstream repository
- **Private Mirror**: A private copy of the Public Fork. It can be used to
  invite contribution from your organization and also run checks that are
  relevant to your organization.

Based on the workflow defined in
[GitHub's Private Mirror App](https://github.com/github-community-projects/private-mirrors?tab=readme-ov-file#key-features).

Using this Action with IssueOps would help you to get some of PMA's capabilities
without needing to host an app.

## Usage

```yml
- name: Create Fork Pair
  id: create-fork-pair
  uses: rohitnb/create-fork-pair@main
  with:
    upstream-repo: OWNER/REPO
    private-mirror-name: repo-name
    actor: john-doe
    admin-token: ${{ secrets.ADMIN_TOKEN }}
    organization: this-org
```

### Inputs

| **Input**             | **Description**                                                                    | **Required** | **Default/Recommended Value** |
| --------------------- | ---------------------------------------------------------------------------------- | ------------ | ----------------------------- |
| `upstream-repo`       | Name of the open source repository that you want to fork. Format: `owner/repo`     | Yes          | `null`                        |
| `private-mirror-name` | Name of the private repository. Format: `repo-name`                                | Yes          | `null`                        |
| `actor`               | The user who will be the owner of the private-mirror repository                    | No           | `${{ github.actor }}`         |
| `admin-token`         | GitHub Token with the required scopes to create a repository in the organization   | Yes          | `null`                        |
| `organization`        | The organization where the upstream-repo and the private-mirror will be created in | No           | `${{ github.organization }}`  |

### Outputs

| **Output**       | **Description**                           |
| ---------------- | ----------------------------------------- |
| `public-fork`    | Public fork name. Format: 'OWNER/REPO'    |
| `private-mirror` | Private mirror name. Format: 'OWNER/REPO' |

## Development

### Requirements

- [Node.js](https://nodejs.org) handy. If you are using a version manager like
- [`nodenv`](https://github.com/nodenv/nodenv) or
  [`nvm`](https://github.com/nvm-sh/nvm), you can run `nodenv install` in the
  root of your repository to install the version specified in
- [`package.json`](./package.json). Otherwise, 20.x or later should work!

## Getting started

1. :hammer_and_wrench: Install the dependencies

   ```bash
   npm install
   ```

2. Create a `.env` file

> ACTIONS_STEP_DEBUG=true
>
> INPUT_upstream-repo=OWNER/REPO
>
> INPUT_private-mirror-name=REPO-NAME
>
> INPUT_actor=<Your GitHub Handle>
>
> INPUT_admin-token=<Your GitHub Token>
>
> INPUT_organization=<Org Name>

3. The [`@github/local-action`](https://github.com/github/local-action) utility
   can be used to test your action locally. It is a simple command-line tool
   that "stubs" (or simulates) the GitHub Actions Toolkit. This way, you can run
   your JavaScript action locally without having to commit and push your changes
   to a repository.

The `local-action` utility can be run in the following ways:

- Visual Studio Code Debugger

  Make sure to review and, if needed, update
  [`.vscode/launch.json`](./.vscode/launch.json)

- Terminal/Command Prompt

  ```bash
  # npx @github/local action <action-yaml-path> <entrypoint> <dotenv-file>
  npx @github/local-action . src/main.js .env
  ```

4. :white_check_mark: Run the tests

   ```bash
   $ npm test

    ✓ __tests__/main.test.js (7 tests) 2ms
    ✓ __tests__/scripts.test.js (9 tests) 3ms

    Test Files  2 passed (2)
          Tests  16 passed (16)
      Start at  00:30:16
      Duration  227ms (transform 57ms, setup 0ms, collect 180ms, tests 5ms, environment 0ms, prepare 66ms)
   ```

5. :building_construction: Package the JavaScript for distribution

   ```bash
   npm run bundle
   ```

## Validate the Action

You can now validate the action by manually running the GitHub Actions workflow
`test-action.yml`

```yaml
steps:
  - name: Checkout
    id: checkout
    uses: actions/checkout@v3

  - name: Run Action
    id: run-action
    uses: ./
    with:
      upstream-repo: 'owner/repo'
      private-mirror-name: 'repo-name'
      actor: ${{ github.actor }}
      admin-token: ${{ secrets.ADMIN_TOKEN }}
      organization: 'fork-pair-owner'

  - name: Check Outputs
    id: check-outputs
    run: |
      echo "Public Fork: ${{ steps.run-action.outputs.public-fork }}"
      echo "Private Mirror: ${{ steps.run-action.outputs.private-mirror }}"
```
