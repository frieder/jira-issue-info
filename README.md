# Jira Issue Info - Github Action

[![Build Status](https://img.shields.io/github/actions/workflow/status/frieder/jira-issue-info/ci-build.yml?label=Build%20Status)](https://github.com/frieder/jira-issue-info/actions/workflows/ci-build.yml)
[![Sonar Coverage](https://img.shields.io/sonar/coverage/frieder_jira-issue-info/main?server=https%3A%2F%2Fsonarcloud.io&label=Code%20Coverage)](https://sonarcloud.io/project/overview?id=frieder_jira-issue-info)
[![Open Issues](https://img.shields.io/github/issues-raw/frieder/jira-issue-info?label=Open%20Issues)](https://github.com/frieder/jira-issue-info/issues?q=is%3Aopen+is%3Aissue)
[![Sonar Issues](https://img.shields.io/sonar/violations/frieder_jira-issue-info/main?format=long&server=https%3A%2F%2Fsonarcloud.io&label=Sonar%20Violations)](https://sonarcloud.io/project/overview?id=frieder_jira-issue-info)

A GitHub action to get the properties of a Jira issue and make it available via output as JSON so it can be
used by other steps in a workflow job.

> -   Only supports Jira Cloud.
> -   Requires [Jira Login Action](https://github.com/marketplace/actions/jira-login).

## Usage

```yaml
name: Get Jira Issue Properties

on: [..]

jobs:
  jira-issue-info:
    name: Jira Issue Info
    runs-on: ubuntu-latest
    steps:
      - name: Jira Login
        uses: atlassian/gajira-login@v3
        env:
          JIRA_BASE_URL: ${{ vars.JIRA_BASE_URL }}
          JIRA_USER_EMAIL: ${{ vars.JIRA_USER_EMAIL }}
          JIRA_API_TOKEN: ${{ secrets.JIRA_API_TOKEN }}

      - name: Get Issue Properties
        id: issue
        uses: frieder/jira-issue-info@v1
        with:
          retries: 1 # optional
          retryDelay: 10 # optional
          timeout: 2000 # optional
          issue: WEB-123
          customFields: |
            previousStatus: 10858
            transitionStatus: 10859

      - name: Print Output
        run: |
          echo "Issue = ${{ steps.issue.outputs.issue }}"
          echo "Summary = ${{ steps.issue.outputs.summary }}"
          echo "Description = ${{ steps.issue.outputs.description }}"
          echo "Type = ${{ steps.issue.outputs.type }}"
          echo "Type ID = ${{ steps.issue.outputs.typeID }}"
          echo "Status = ${{ steps.issue.outputs.status }}"
          echo "Status ID = ${{ steps.issue.outputs.statusID }}"
          echo "Priority = ${{ steps.issue.outputs.priority }}"
          echo "Priority ID = ${{ steps.issue.outputs.priorityID }}"
          echo "Labels = ${{ steps.issue.outputs.labels }}"
          echo "Reporter Name = ${{ steps.issue.outputs.reporter }}"
          echo "Reporter ID = ${{ steps.issue.outputs.reporterID }}"
          echo "Assignee Name = ${{ steps.issue.outputs.assignee }}"
          echo "Assignee ID = ${{ steps.issue.outputs.assigneeID }}"
          echo "Components = ${{ steps.issue.outputs.components }}"
          echo "Previous Status = ${{ steps.issue.outputs.previousStatus }}"
          echo "Transition Status = ${{ steps.issue.outputs.transitionStatus }}"
          echo 'JSON = ${{ steps.issue.outputs.json }}'

      - name: Issue status is "To Do"
        if: steps.issue.outputs.status == 'To Do'
        run: echo "Ticket is in 'To Do'"

      - name: Issue status is "In Progress"
        if: steps.issue.outputs.status == 'In Progress'
        run: echo "Ticket is 'In Progress'"
```

## Configuration Options

### Option: retries

|          |     |
| :------- | :-- |
| Required | no  |
| Default  | 1   |

This option allows to define a number of retries when the HTTP call to the Jira REST API fails (e.g. due to
connectivity issues). By default, the action will attempt one retry and after that report the action as failed.

### Option: retryDelay

|          |     |
| :------- | :-- |
| Required | no  |
| Default  | 10  |

In case the `retries` option is > 0, this option defines the time (in seconds) that the action will wait
before it sends another request.

### Option: timeout

|          |      |
| :------- | :--- |
| Required | no   |
| Default  | 2000 |

The time (in milliseconds) the action will wait for a request to finish. If the request does not finish in
time it will be considered failed.

### Option: issue

|          |     |
| :------- | :-- |
| Required | yes |
| Default  |     |

The ID of the Jira ticket (e.g. XYZ-123).

### Option: customFields

|          |    |
| :------- |:---|
| Required | no |
| Default  |    |

A multiline string of custom fields that defines which values should be made available as output.
The format is `<output name>: <field ID>`. The field ID defines the number of the custom field 
in Jira. The output name is the name used to register the custom field's value as output.

# Response Output

The action will provide the following outputs:

- `issue`: The issue key (e.g. XYZ-123).
- `summary`: The summary of the issue.
- `description`: The description of the issue.
- `type`: The type of the issue.
- `typeID`: The ID of the type of the issue.
- `status`: The status of the issue.
- `statusID`: The ID of the status of the issue.
- `priority`: The priority of the issue.
- `priorityID`: The ID of the priority of the issue.
- `labels`: The labels of the issue.
- `reporter`: The name of the reporter of the issue.
- `reporterID`: The ID of the reporter of the issue.
- `assignee`: The name of the assignee of the issue.
- `assigneeID`: The ID of the assignee of the issue.
- `components`: The components of the issue.
- `json`: The JSON response of the Jira REST API.

## Test Action

This action can be tested during development with the use of https://github.com/nektos/act.

Please adapt the values accordingly, both in the workflow file and in the CLI command.

```
act -W .github/workflows/testing.yml \
    -j test \
    -s JIRA_URL=*** \
    -s JIRA_EMAIL=*** \
    -s JIRA_TOKEN=*** \
    --var JIRA_ISSUE=WEB-123
```
