import { createCommand } from 'commander';
import { logInfo, logSuccess } from './log.js';
import {
  getMostRecentWorkflowRunByName,
  maybeCancelWorkflow,
  rerunWorkflow,
} from './circleci/workflows.js';

async function main({
  workflow: workflowName,
  branch: branchOrRef,
  token,
  org,
  project,
}: {
  workflow: string;
  branch: string;
  token: string;
  org: string;
  project: string;
}) {
  logInfo(
    `Restarting workflow '${workflowName}' for branch/ref '${branchOrRef}' in '${org}/${project}'...`,
  );
  const { workflow } = await getMostRecentWorkflowRunByName({
    token,
    org,
    project,
    workflowName,
    branchOrRef,
  });
  logInfo('Found workflow:\n', JSON.stringify(workflow, null, 2));
  const cancelled = await maybeCancelWorkflow({ workflow, token });
  if (cancelled) {
    logInfo("Cancelled workflow because it's status was: %s", workflow.status);
  } else {
    logInfo("Did not cancel workflow because it's status was: %s", workflow.status);
  }
  logInfo('Rerunning workflow...');
  await rerunWorkflow({ workflow, token });
  logSuccess('Done!');
}

export function createRootCommand() {
  const command = createCommand();
  command
    .name('circleci-restart-workflow')
    .description(
      "Restart the most recent run of CircleCI workflow for a branch or commit, cancelling it if it's still running or pending run.",
    )
    .requiredOption(
      '-w, --workflow <workflow>',
      'The name of the workflow to restart (the most recent run will be targeted)',
    )
    .requiredOption('-b, --branch <branch>', 'The branch or commit SHA to restart the workflow for')
    .requiredOption('-t, --token <token>', 'The CircleCI API token')
    .requiredOption('-o, --org <org>', 'The CircleCI organization')
    .requiredOption('-p, --project <project>', 'The CircleCI project')
    .action(main)
    .showHelpAfterError();
  return command;
}
