const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000").replace(
  /\/$/,
  "",
)

export type User = {
  id: number
  full_name: string
  email: string
  is_active: boolean
}

export type TokenResponse = {
  access_token: string
  token_type: string
}

export type Todo = {
  id: number
  title: string
  description: string | null
  completed: boolean
  user_id: number
}

export type TodoCreate = {
  title: string
  description?: string | null
}

export type TodoUpdate = Partial<TodoCreate & { completed: boolean }>

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers)

  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get("content-type") ?? ""
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text()

  if (!response.ok) {
    const detail = typeof payload === "object" && payload !== null ? payload.detail : payload
    throw new Error(formatApiError(detail) || "Request failed")
  }

  return payload as T
}

function formatApiError(detail: unknown) {
  if (typeof detail === "string") return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) => {
        if (typeof item === "object" && item !== null && "msg" in item) {
          return String(item.msg)
        }
        return String(item)
      })
      .join(", ")
  }
  return ""
}

export const api = {
  register(data: { full_name: string; email: string; password: string }) {
    return request<User>("/api/v1/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
  },

  login(email: string, password: string) {
    const body = new URLSearchParams()
    body.set("username", email)
    body.set("password", password)

    return request<TokenResponse>("/api/v1/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    })
  },

  listTodos(token: string) {
    return request<Todo[]>("/api/v1/todos", {}, token)
  },

  createTodo(token: string, data: TodoCreate) {
    return request<Todo>(
      "/api/v1/todos",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
      token,
    )
  },

  updateTodo(token: string, todoId: number, data: TodoUpdate) {
    return request<Todo>(
      `/api/v1/todos/${todoId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
      token,
    )
  },

  completeTodo(token: string, todoId: number) {
    return request<Todo>(
      `/api/v1/todos/${todoId}/complete`,
      {
        method: "PATCH",
      },
      token,
    )
  },

  deleteTodo(token: string, todoId: number) {
    return request<void>(
      `/api/v1/todos/${todoId}`,
      {
        method: "DELETE",
      },
      token,
    )
  },
}
