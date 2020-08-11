# action-slack-workflow_run

This action sends the status of the workflow which triggered workflow_run event to Slack.

## Inputs

### `slack-webhook-url`

**Required** The Slack Incoming Webhook URL.

## Example Usage

1. Generate your Slack incoming webhook URL from [here](https://slack.com/apps/A0F7XDUAZ--incoming-webhook-).
2. Store the URL as [secrets](https://docs.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets) (`SLACK_WEBHOOK_URL` in this example).
3. Create a workflow file (e.g. `.github/workflows/slack-workflow-run.yml) like below.

```yaml
on:
  workflow_run:
    # "CI" is the name of the workflow whose status will be sent to Slack
    workflows: ["CI"]
    types:
      - completed

jobs:
  slack:
    # `conclusion` can be one of `success`, `failure`, `neutral`, `cancelled`, `skipped`, `timed_out`, or `action_required`
    # send to slack only when the workflow fails
    if: github.event.workflow_run.conclusion == 'failure'
    runs-on: ubuntu-latest
    steps:
      - uses: miyajan/action-slack-workflow_run@v1.0.0
        with:
          slack-webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
```
