export interface CircleCIV2Pipeline {
  id: string;
  errors: {
    type: 'config' | 'config-fetch' | 'timeout' | 'permission' | 'other' | 'plan';
    message: string;
  }[];
  project_slug: string;
  number: number;
  state: 'created' | 'errored' | 'setup-pending' | 'setup' | 'pending';
  created_at: string;
  updated_at?: string;
  trigger: {
    type: 'scheduled_pipeline' | 'explicit' | 'api' | 'webhook';
    received_at: string;
    actor: {
      login: string;
      avatar_url: string;
    };
  };
  trigger_parameters?: Record<string, string | number | boolean | object>;
  vcs?: {
    provider_name: string;
    target_repository_url: string;
    branch?: string;
    review_id?: string;
    review_url?: string;
    revision: string;
    tag?: string;
    commit?: {
      subject: string;
      body: string;
    };
    origin_repository_url: string;
  };
}
