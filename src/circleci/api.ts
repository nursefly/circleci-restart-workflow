import fetch, { Response } from 'node-fetch';
import { logError } from '../log.js';

class CircleCIError extends Error {
  constructor(
    public readonly response: Response,
    public readonly text: null | string,
    public readonly json: null | unknown,
  ) {
    super('CircleCI API call failed.');
  }
}

export async function makeCircleCIV2APICall<ExpectedBodyShape>({
  token,
  endpoint,
  query = {},
  method = 'GET',
}: {
  token: string;
  endpoint: string;
  query?: Record<string, string | undefined>;
  method?: 'GET' | 'POST';
}): Promise<ExpectedBodyShape> {
  const baseUrl = `https://circleci.com/api/v2/${endpoint.replace(/^\//, '')}`;
  const url = new URL(baseUrl);
  for (const [key, value] of Object.entries(query)) {
    if (typeof value !== 'undefined') {
      url.searchParams.set(key, value);
    }
  }
  const response = await fetch(url.toString(), {
    method,
    headers: {
      authorization: `Basic ${Buffer.from(`${token}:`).toString('base64')}`,
    },
  });
  let text: string | null = null;
  try {
    text = await response.text();
  } catch (error) {
    logError('Failed to parse text response: %s', error);
  }
  let json: unknown | null = null;
  try {
    json = JSON.parse(text as string);
  } catch (error) {
    logError('Failed to parse JSON response: %s', error);
  }
  if (!response.ok || text === null || json === null) {
    throw new CircleCIError(response, text, json);
  }
  return json as ExpectedBodyShape;
}

export interface CircleCIV2PagedResponse<T> {
  items: T[];
  next_page_token?: string;
}
