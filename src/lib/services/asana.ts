const ASANA_BASE_URL = 'https://app.asana.com/api/1.0'

export interface AsanaProject {
  gid: string
  name: string
  notes?: string
  completed: boolean
  created_at: string
}

export interface AsanaTask {
  gid: string
  name: string
  notes?: string
  completed: boolean
  due_on?: string
  completed_at?: string
  projects: { gid: string; name: string }[]
}

export interface AsanaWorkspace {
  gid: string
  name: string
}

class AsanaClient {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${ASANA_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.errors?.[0]?.message ?? 'Asana API error')
    }

    const data = await response.json()
    return data.data
  }

  async getWorkspaces(): Promise<AsanaWorkspace[]> {
    return this.request<AsanaWorkspace[]>('/workspaces')
  }

  async getProjects(workspaceGid: string): Promise<AsanaProject[]> {
    return this.request<AsanaProject[]>(
      `/workspaces/${workspaceGid}/projects?opt_fields=name,notes,completed,created_at`
    )
  }

  async getProjectTasks(projectGid: string, completed = true): Promise<AsanaTask[]> {
    return this.request<AsanaTask[]>(
      `/projects/${projectGid}/tasks?completed=${completed}&opt_fields=name,notes,completed,due_on,completed_at,projects.name`
    )
  }

  async getAllCompletedTasks(workspaceGid: string): Promise<AsanaTask[]> {
    const tasks = await this.request<AsanaTask[]>(
      `/workspaces/${workspaceGid}/tasks?completed=true&opt_fields=name,notes,completed,due_on,completed_at,projects.name&limit=100`
    )
    return tasks
  }

  async createTask(
    workspaceGid: string,
    projectGid: string,
    task: { name: string; notes?: string; due_on?: string }
  ): Promise<AsanaTask> {
    return this.request<AsanaTask>('/tasks', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          ...task,
          projects: [projectGid],
          workspace: workspaceGid,
        },
      }),
    })
  }

  async completeTask(taskGid: string): Promise<AsanaTask> {
    return this.request<AsanaTask>(`/tasks/${taskGid}`, {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          completed: true,
        },
      }),
    })
  }
}

export function createAsanaClient(accessToken: string): AsanaClient {
  return new AsanaClient(accessToken)
}

export async function getAsanaOAuthUrl(clientId: string, redirectUri: string): Promise<string> {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'default',
  })
  return `https://app.asana.com/-/oauth_authorize?${params.toString()}`
}

export async function exchangeCodeForToken(
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const response = await fetch('https://app.asana.com/-/oauth_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to exchange code for token')
  }

  return response.json()
}

export async function refreshAsanaToken(
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
  const response = await fetch('https://app.asana.com/-/oauth_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to refresh token')
  }

  return response.json()
}
