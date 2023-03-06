# `circleci-restart-workflow`

![](https://img.shields.io/npm/v/@vivianhealth/circleci-restart-workflow?v=20230303)
![](https://img.shields.io/github/package-json/v/nursefly/circleci-restart-workflow?v=20230303)
![](https://img.shields.io/node/v/@vivianhealth/circleci-restart-workflow?v=20230303)
![](https://img.shields.io/npm/types/@vivianhealth/circleci-restart-workflow?v=20230303)

This utility uses the CirlceCI V2 API to cancel a workflow running for a specific
HEAD commit on a specific branch if it's running and then restart it (regardless
of it was already running or not).

Main use is to rerun a workflow for a branch after a PR is created in GitHub
so that workflow can run with a freshly set `CIRCLE_PULL_REQUEST` environment
variable.

## Prerequisites

- Node >=18

## Usage

The following command will allow you run the CLI tool without having to explicitly
install it as long as `npm` is installed.

```bash
npx -y -p @vivianhealth/circleci-restart-workflow@latest \
    circleci-restart-workflow -- \
      -w <workflow-name> \
      -b <branch> \
      -t <circleci-api-token> \
      -o <github-organization> \
      -p <github-repository>
```

To install and lock in a specific version into your project dependencies (recommended):

```bash
npm install --save-dev @vivianhealth/circleci-restart-workflow
```

And then to run the CLI tool inside your project directory:

```bash
npx circleci-restart-workflow -- \
  -w <workflow-name> \
  -b <branch> \
  -t <circleci-api-token> \
  -o <github-organization> \
  -p <github-repository>
```

## Publishing

This package is automatically published to npm via CI. Versions are bumped automatically based on commits
since the last release using `semantic-release` and `conventional-changelog`.

Commit message format is important. See [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/).
This format is enforced via git hooks.

## License

This package is [MIT licensed](./LICENSE).
