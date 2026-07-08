import { FormEvent, useEffect, useMemo, useState } from "react"
import {
  CheckCircle2,
  ClipboardList,
  Edit3,
  Loader2,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { api, Todo } from "@/lib/api"
import { cn } from "@/lib/utils"

const TOKEN_KEY = "todo_api_token"
const EMAIL_KEY = "todo_api_email"

type FilterValue = "all" | "active" | "completed"
type TodoDraft = {
  title: string
  description: string
  completed: boolean
}

const emptyDraft: TodoDraft = {
  title: "",
  description: "",
  completed: false,
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? "")
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY) ?? "")

  function handleAuthenticated(nextToken: string, nextEmail: string) {
    localStorage.setItem(TOKEN_KEY, nextToken)
    localStorage.setItem(EMAIL_KEY, nextEmail)
    setToken(nextToken)
    setEmail(nextEmail)
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(EMAIL_KEY)
    setToken("")
    setEmail("")
  }

  if (!token) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />
  }

  return <TodoDashboard email={email} token={token} onLogout={handleLogout} />
}

function AuthScreen({
  onAuthenticated,
}: {
  onAuthenticated: (token: string, email: string) => void
}) {
  const [mode, setMode] = useState("login")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      if (mode === "register") {
        await api.register({
          full_name: fullName.trim(),
          email: email.trim(),
          password,
        })
      }

      const response = await api.login(email.trim(), password)
      onAuthenticated(response.access_token, email.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_420px]">
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Todo App API</p>
              <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
                Tapşırıqlarını sadə və sürətli idarə et
              </h1>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="JWT auth"
              text="Hər istifadəçi yalnız öz todo-larını görür."
            />
            <FeatureCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              title="Tam CRUD"
              text="Yarat, yenilə, tamamla və sil."
            />
            <FeatureCard
              icon={<Search className="h-5 w-5" />}
              title="Filter"
              text="Status və axtarışla siyahını daralt."
            />
          </div>
        </section>

        <Card className="border-border/80 shadow-xl">
          <CardHeader>
            <CardTitle>Hesab</CardTitle>
            <CardDescription>
              Mövcud hesabla daxil ol və ya yeni hesab yarat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={setMode} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Daxil ol</TabsTrigger>
                <TabsTrigger value="register">Qeydiyyat</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <TabsContent value="register" className="mt-0 space-y-2">
                  <Label htmlFor="fullName">Ad soyad</Label>
                  <Input
                    id="fullName"
                    autoComplete="name"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    required={mode === "register"}
                    placeholder="Aqil Aghamirzayev"
                  />
                </TabsContent>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    placeholder="you@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Şifrə</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                    placeholder="Minimum 6 simvol"
                  />
                </div>

                {error ? <ErrorMessage message={error} /> : null}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : null}
                  {mode === "login" ? "Daxil ol" : "Qeydiyyat və daxil ol"}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function FeatureCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="rounded-lg border bg-card/70 p-4 shadow-sm backdrop-blur">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
        {icon}
      </div>
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  )
}

function TodoDashboard({
  token,
  email,
  onLogout,
}: {
  token: string
  email: string
  onLogout: () => void
}) {
  const [todos, setTodos] = useState<Todo[]>([])
  const [filter, setFilter] = useState<FilterValue>("all")
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [draft, setDraft] = useState<TodoDraft>(emptyDraft)

  async function loadTodos() {
    setError("")
    setIsLoading(true)
    try {
      setTodos(await api.listTodos(token))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load todos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadTodos()
  }, [token])

  const stats = useMemo(() => {
    const completed = todos.filter((todo) => todo.completed).length
    return {
      total: todos.length,
      completed,
      active: todos.length - completed,
    }
  }, [todos])

  const visibleTodos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return todos.filter((todo) => {
      const matchesStatus =
        filter === "all" ||
        (filter === "completed" && todo.completed) ||
        (filter === "active" && !todo.completed)

      const searchable = `${todo.title} ${todo.description ?? ""}`.toLowerCase()
      return matchesStatus && (!normalizedQuery || searchable.includes(normalizedQuery))
    })
  }, [filter, query, todos])

  function openCreateDialog() {
    setEditingTodo(null)
    setDraft(emptyDraft)
    setDialogOpen(true)
  }

  function openEditDialog(todo: Todo) {
    setEditingTodo(todo)
    setDraft({
      title: todo.title,
      description: todo.description ?? "",
      completed: todo.completed,
    })
    setDialogOpen(true)
  }

  async function handleSaveTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSaving(true)

    try {
      const payload = {
        title: draft.title.trim(),
        description: draft.description.trim() || null,
      }

      if (editingTodo) {
        await api.updateTodo(token, editingTodo.id, {
          ...payload,
          completed: draft.completed,
        })
      } else {
        await api.createTodo(token, payload)
      }

      setDialogOpen(false)
      await loadTodos()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save todo")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleToggleTodo(todo: Todo, checked: boolean) {
    setError("")
    setTodos((current) =>
      current.map((item) => (item.id === todo.id ? { ...item, completed: checked } : item)),
    )

    try {
      if (checked) {
        await api.completeTodo(token, todo.id)
      } else {
        await api.updateTodo(token, todo.id, { completed: false })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update todo")
      await loadTodos()
    }
  }

  async function handleDeleteTodo(todo: Todo) {
    setError("")
    const previous = todos
    setTodos((current) => current.filter((item) => item.id !== todo.id))

    try {
      await api.deleteTodo(token, todo.id)
    } catch (err) {
      setTodos(previous)
      setError(err instanceof Error ? err.message : "Could not delete todo")
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-lg border bg-card/80 p-4 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold">Todo Dashboard</h1>
              <p className="truncate text-sm text-muted-foreground">
                {email || "Authenticated user"}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={openCreateDialog}>
              <Plus />
              Yeni todo
            </Button>
            <Button variant="outline" onClick={onLogout}>
              <LogOut />
              Çıxış
            </Button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Ümumi" value={stats.total} />
          <StatCard label="Aktiv" value={stats.active} />
          <StatCard label="Tamamlanmış" value={stats.completed} />
        </section>

        <Card>
          <CardHeader className="gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Tapşırıqlar</CardTitle>
                <CardDescription>
                  Todo-ları yarat, redaktə et, tamamla və sil.
                </CardDescription>
              </div>
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px] lg:w-[520px]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Axtar..."
                    className="pl-9"
                  />
                </div>
                <Select value={filter} onValueChange={(value) => setFilter(value as FilterValue)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Hamısı</SelectItem>
                    <SelectItem value="active">Aktiv</SelectItem>
                    <SelectItem value="completed">Tamamlanmış</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error ? <ErrorMessage message={error} className="mb-4" /> : null}

            {isLoading ? (
              <div className="flex min-h-52 items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Yüklənir...
              </div>
            ) : visibleTodos.length ? (
              <div className="space-y-3">
                {visibleTodos.map((todo) => (
                  <TodoRow
                    key={todo.id}
                    todo={todo}
                    onToggle={handleToggleTodo}
                    onEdit={openEditDialog}
                    onDelete={handleDeleteTodo}
                  />
                ))}
              </div>
            ) : (
              <EmptyState onCreate={openCreateDialog} />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTodo ? "Todo redaktə et" : "Yeni todo"}</DialogTitle>
            <DialogDescription>
              Başlıq məcburidir, təsvir isə istəyə bağlıdır.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveTodo} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="todoTitle">Başlıq</Label>
              <Input
                id="todoTitle"
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                placeholder="Məsələn: FastAPI endpoint-lərini test et"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="todoDescription">Təsvir</Label>
              <Textarea
                id="todoDescription"
                value={draft.description}
                onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                placeholder="Əlavə qeydlər..."
              />
            </div>

            {editingTodo ? (
              <label className="flex items-center gap-3 rounded-md border p-3 text-sm">
                <Checkbox
                  checked={draft.completed}
                  onCheckedChange={(checked) =>
                    setDraft({ ...draft, completed: checked === true })
                  }
                />
                Tamamlanmış kimi saxla
              </label>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={isSaving}
              >
                Ləğv et
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin" /> : null}
                Saxla
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
          <ClipboardList className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}

function TodoRow({
  todo,
  onToggle,
  onEdit,
  onDelete,
}: {
  todo: Todo
  onToggle: (todo: Todo, checked: boolean) => void
  onEdit: (todo: Todo) => void
  onDelete: (todo: Todo) => void
}) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-background p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <Checkbox
          checked={todo.completed}
          onCheckedChange={(checked) => onToggle(todo, checked === true)}
          aria-label={todo.completed ? "Mark as active" : "Mark as completed"}
          className="mt-0.5"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={cn(
                "break-words text-base font-medium",
                todo.completed && "text-muted-foreground line-through",
              )}
            >
              {todo.title}
            </h3>
            <Badge variant={todo.completed ? "secondary" : "outline"}>
              {todo.completed ? "Tamamlandı" : "Aktiv"}
            </Badge>
          </div>
          {todo.description ? (
            <p className="mt-2 break-words text-sm leading-6 text-muted-foreground">
              {todo.description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex shrink-0 gap-2 sm:justify-end">
        <Button variant="outline" size="icon" onClick={() => onEdit(todo)} aria-label="Edit todo">
          <Edit3 />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onDelete(todo)}
          aria-label="Delete todo"
        >
          <Trash2 />
        </Button>
      </div>
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        <ClipboardList className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Todo tapılmadı</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Filteri dəyiş və ya yeni todo yarat.
      </p>
      <Button className="mt-5" onClick={onCreate}>
        <Plus />
        Yeni todo
      </Button>
    </div>
  )
}

function ErrorMessage({ message, className }: { message: string; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive",
        className,
      )}
    >
      {message}
    </div>
  )
}

export default App
