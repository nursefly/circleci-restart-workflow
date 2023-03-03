/* eslint-disable no-await-in-loop */
import { CircleCIV2Pipeline } from './pipelines.js';
import { logWarn } from '../log.js';
import { CircleCIV2PagedResponse, makeCircleCIV2APICall } from './api.js';

export type CircleCIV2WorkflowStatus =
  | 'success'
  | 'running'
  | 'not_run'
  | 'failed'
  | 'error'
  | 'failing'
  | 'on_hold'
  | 'canceled'
  | 'unauthorized';

export const CIRCLECI_CANCELABLE_WORKFLOW_STATUSES: CircleCIV2WorkflowStatus[] = [
  'running',
  'on_hold',
  'failing',
];

export interface CircleCIV2Workflow {
  pipeline_id: string;
  canceled_by?: string;
  id: string;
  name: string;
  project_slug: string;
  errored_by?: string;
  tag?: string;
  status: CircleCIV2WorkflowStatus;
  started_by: string;
  pipeline_number: number;
  created_at: string;
  stopped_at: string;
}

export async function getMostRecentWorkflowRunByName({
  org,
  project,
  token,
  workflowName,
  branchOrRef,
}: {
  org: string;
  project: string;
  token: string;
  workflowName: string;
  branchOrRef: string;
}): Promise<{
  workflow: CircleCIV2Workflow;
  pipeline: CircleCIV2Pipeline;
}> {
  let pipeline: CircleCIV2Pipeline | null = null;
  let workflow: CircleCIV2Workflow | null = null;
  let pipelinesPageToken: string | null = null;
  do {
    const {
      items: pipelines,
      next_page_token: nextPageToken,
    }: CircleCIV2PagedResponse<CircleCIV2Pipeline> = await makeCircleCIV2APICall<
      CircleCIV2PagedResponse<CircleCIV2Pipeline>
    >({
      token,
      endpoint: `/project/gh/${org}/${project}/pipeline`,
      query: {
        branch: branchOrRef,
        page_token: pipelinesPageToken || undefined,
      },
    });
    pipelinesPageToken = nextPageToken || null;
    for (const possiblePipeline of pipelines) {
      const { items: workflows, next_page_token: workflowsNextPageToken } =
        await makeCircleCIV2APICall<CircleCIV2PagedResponse<CircleCIV2Workflow>>({
          token,
          endpoint: `/pipeline/${possiblePipeline.id}/workflow`,
        });
      for (const possibleWorkflow of workflows) {
        if (possibleWorkflow.name === workflowName) {
          pipeline = possiblePipeline;
          workflow = possibleWorkflow;
          break;
        }
      }
      if (pipeline && workflow) {
        break;
      }
      if (workflowsNextPageToken) {
        logWarn(
          `Did not find ${workflowName} in first page of workflows for pipeline ${possiblePipeline.id}\n` +
            'but there was another page of workflows available. Skipping this pipeline since paginating\n' +
            'workflows within a pipeline is not supported yet.',
        );
      }
    }
  } while ((!pipeline || !workflow) && pipelinesPageToken);

  if (!pipeline || !workflow) {
    // TODO Custom more detailed error.
    throw new Error('Failed to find pipeline or workflow.');
  }

  return {
    pipeline,
    workflow,
  };
}

export async function maybeCancelWorkflow({
  workflow,
  token,
}: {
  workflow: CircleCIV2Workflow;
  token: string;
}): Promise<boolean> {
  const { status } = workflow;
  if (CIRCLECI_CANCELABLE_WORKFLOW_STATUSES.includes(status)) {
    await makeCircleCIV2APICall({
      token,
      endpoint: `/workflow/${workflow.id}/cancel`,
      method: 'POST',
    });
    return true;
  }
  return false;
}

export async function rerunWorkflow({
  workflow,
  token,
}: {
  workflow: CircleCIV2Workflow;
  token: string;
}) {
  await makeCircleCIV2APICall({
    token,
    endpoint: `/workflow/${workflow.id}/rerun`,
    method: 'POST',
  });
}
