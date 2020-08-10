import * as core from "@actions/core";
import * as github from "@actions/github";
import { IncomingWebhook } from "@slack/webhook";

type Field = {
  title: string;
  value: string;
  short?: boolean;
};

type WorkflowRun = {
  conclusion:
    | "success"
    | "failure"
    | "neutral"
    | "cancelled"
    | "skipped"
    | "timed_out"
    | "action_required";
  event: string;
  head_branch: string;
  html_url: string;
};

export async function run(): Promise<void> {
  try {
    validateContext();

    const workflowRun: WorkflowRun = github.context.payload.workflow_run;
    const url = core.getInput("slack-webhook-url", { required: true });
    const webhook = new IncomingWebhook(url);
    const fallback = buildFallback(workflowRun);
    const authorName = "github-actions";
    const authorIcon = "https://avatars2.githubusercontent.com/in/15368?v=4";
    const color = buildColor(workflowRun);
    const fields = buildFields(workflowRun);

    await webhook.send({
      attachments: [
        {
          fallback,
          author_name: authorName,
          author_icon: authorIcon,
          color,
          fields,
        },
      ],
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

function validateContext(): void {
  const context = github.context;
  if (context.eventName !== "workflow_run") {
    throw new Error(
      `This action only supports workflow_run event. (eventName=${context.eventName})`
    );
  }
  if (context.payload.action !== "completed") {
    throw new Error(
      `This action only supports completed action. (action=${context.action})`
    );
  }
}

function buildFallback(workflowRun: WorkflowRun): string {
  const texts = [
    `Branch: ${workflowRun.head_branch}`,
    `Event: ${workflowRun.event}`,
    `Status: ${workflowRun.conclusion}`,
    `Workflow URL: ${workflowRun.html_url}`,
  ];
  return texts.join("\n");
}

function buildColor(workflowRun: WorkflowRun): string {
  switch (workflowRun.conclusion) {
    case "failure":
    case "timed_out":
      return "danger";
    case "success":
      return "good";
    default:
      return "warning";
  }
}

function buildFields(workflowRun: WorkflowRun): Field[] {
  return [
    {
      title: "Branch",
      value: workflowRun.head_branch,
      short: true,
    },
    {
      title: "Event",
      value: workflowRun.event,
      short: true,
    },
    {
      title: "Status",
      value: workflowRun.conclusion,
      short: true,
    },
    {
      title: "Workflow URL",
      value: workflowRun.html_url,
      short: false,
    },
  ];
}

(async () => {
  await run();
})();
