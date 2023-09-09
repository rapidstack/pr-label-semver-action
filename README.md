# PR Label Semver Action

This action assists in generating a semantic version change for a codebase based upon the labels applied to the pull request with the end goal of versioning a code package or creating a git tag. It also aids in generating a prerelease version semver which could be used to publish a package to a package registry for beta testing.

## Getting Started

First, determine the label naming scheme you want to use to trigger a version change (the names are case insensitive). By default, the action will look for the following labels: `major`, `minor`, `patch`, and the label pattern `*prerelease*`. If these conflict with your existing labels, you can specify a prefix to instead use labels like: `semver:major`, `semver:minor`, `semver:patch`, and `semver:*prerelease*`.

Now you can add the action to your workflow. The following example workflow will run on pull request events and will use the default label names:

```yaml
name: Pull Request Action
on:
  pull_request:
    types: [assigned, labeled, unlabeled, opened, synchronize, reopened, ready_for_review, closed]

# Allow a subsequently queued workflow run to interrupt a previous run
concurrency:
  group: '${{ github.workflow }} @ ${{ github.event.pull_request.head.label || github.head_ref || github.ref }}'
  cancel-in-progress: true

jobs:
  check-code:
    if: ${{ !github.event.pull_request.draft }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3
        with:
          ref: ${{ github.ref }}

      - name: Setup Project
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: npm
          cache-dependency-path: package-lock.json

      - name: Generate Semantic Version
        id: semver
        uses: rapidstack/PR-Label-Semver-Action@v1

      - name: Create Git Tag
        uses: actions/github-script@v5
        env:
          TAG: ${{ steps.semver.outputs.string }}
        with:
          script: |
            const { TAG } = process.env
            github.rest.git.createRef({
              owner: context.repo.owner,
              repo: context.repo.repo,
              ref: `refs/tags/v${TAG}`,
              sha: context.sha
            })

      - name: Version NPM Package
        run: node ./scripts/version.js ${{ steps.semver.outputs.string }}

      - name: Publish Prerelease NPM Package
        if: ${{ steps.semver.outputs.prerelease && !github.event.pull_request.merged}}
        run: npm publish --tag next

      - name: Publish Production NPM Package
        if: ${{ github.event.pull_request.merged}}
        run: npm publish

      - name: Create Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: v${{ steps.semver.outputs.string }}
          release_name: 'v${{ steps.semver.outputs.string }}: ${{ github.event.pull_request.title }}'
          body: ${{ github.event.pull_request.body }}
          draft: false
          prerelease: ${{ steps.semver.outputs.prerelease }}
```

### Inputs

The following are the inputs that can be passed to the action:
| Name | Description | Default |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `label_prefix` | Prefix on PR labels that the action will act on to determine the semver bump. E.g.: value of `sv:` will look for labels like `SV:MAJOR`, `sv:minor`, etc. | (none) |
| `prerelease_prefix` | The string to append at the end of a semver for a prerelease version. E.g.: if you set this to 'rc.', the version will be 'x.y.z-rc.{short-hash}'. | `pr.` |
| `default_bump` | For non pull requests (i.e.: `workflow_dispatch`), the default bump to apply to the version. | `patch` |

### Outputs

The action will output the following variables that can be used in subsequent steps by setting an ID on the action:

```yaml
- name: Generate Semantic Version
  id: semver
  uses: rapidstack/pr-label-semver-action@v1

- name: Create Git Tag
  uses: something/else
    with:
      tag: ${{ steps.semver.outputs.string }}
```

| Name          | Description                                                                              |
| ------------- | ---------------------------------------------------------------------------------------- |
| `string`      | The semantic version string. Looks like: `1.2.3` or `1.2.3-rc.{commit-sha}`              |
| `major`       | The major version number.                                                                |
| `minor`       | The minor version number.                                                                |
| `patch`       | The patch version number.                                                                |
| `suffix`      | A portion after the semver for prereleases. By default it looks like: `rc.{commit-sha}`. |
| `prerelease`  | A boolean to denote if the semver is a prerelease.                                       |
| `lastMainTag` | The last tag on the main branch.                                                         |
