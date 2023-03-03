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
          issue: XYZ-123

      - name: Print Output
        run: echo '${{ steps.issue.outputs.json }}'

      - name: Issue status is "To Do"
        if: fromJSON(steps.issue.outputs.json).fields.status.name == 'To Do'
        run: echo "Ticket is in 'To Do'"

      - name: Issue status is "In Progress"
        if: fromJSON(steps.issue.outputs.json).fields.status.name == 'In Progress'
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

# Response Output

The response of the request is made available to other steps as an output with name `json`
(`steps.STEP-ID.outputs.json`). Below you
can find an (incomplete) excerpt of the JSON response provided by the Jira
[REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/#api-rest-api-3-issue-issueidorkey-get).

```json
{
    "id": "10001",
    "fields": {
        "assignee": {
            "accountId": "some UUID or hash here",
            "emailAddress": "foo@bar.local",
            "displayName": "Foo Bar"
        },
        "components": [
            {
                "id": "10001",
                "name": "Component 1"
            }
        ],
        "created": "2023-02-28T00:23:59.489+0000",
        "customfield_12345": "some value",
        "description": {
            "content": [
                {
                    "content": [
                        {
                            "type": "text",
                            "text": "Actual ticket description here"
                        }
                    ]
                }
            ]
        },
        "duedate": null,
        "issuetype": {
            "id": "10004",
            "name": "Task",
            "subtask": false
        },
        "labels": ["foo", "bar"],
        "priority": {
            "id": "1",
            "name": "Highest"
        },
        "project": {
            "id": "10001",
            "key": "TEST",
            "name": "Test Project"
        },
        "resolution": null,
        "status": {
            "id": "3",
            "name": "In Progress"
        },
        "summary": "Test Ticket"
    }
}
```

To access any of the fields in later steps one can use the `fromJSON` function available in Github
workflows. Following is an example how to access the name of the assignee (ID of the info step is `foo`).
```
  fromJSON(steps.foo.outputs.json).fields.assignee.displayName
```
