import { useState, useEffect, type FormEvent } from "react"
import { Wallet, ArrowUp, ArrowDown, Trash2, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface Transaction {
  id: number
  text: string
  amount: number
}

const STORAGE_KEY = "expense-tracker-transactions"

function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function formatBGN(value: number): string {
  return new Intl.NumberFormat("bg-BG", {
    style: "currency",
    currency: "BGN",
  }).format(value)
}

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions)
  const [text, setText] = useState("")
  const [amount, setAmount] = useState("")

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  }, [transactions])

  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const expenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = income + expenses

  function handleAdd(e: FormEvent) {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (!text.trim() || isNaN(parsed) || parsed === 0) return

    setTransactions((prev) => [
      { id: Date.now(), text: text.trim(), amount: parsed },
      ...prev,
    ])
    setText("")
    setAmount("")
  }

  function handleDelete(id: number) {
    setTransactions((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="min-h-svh bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Wallet className="size-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Личен Финансов Мениджър
            </h1>
            <p className="text-sm text-muted-foreground">
              Следете приходите и разходите си
            </p>
          </div>
        </div>

        {/* Balance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Общо салдо
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p
              className={`text-3xl font-bold tabular-nums tracking-tight ${
                balance >= 0 ? "text-foreground" : "text-red-600"
              }`}
            >
              {formatBGN(balance)}
            </p>
          </CardContent>
        </Card>

        {/* Income / Expense summary */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-emerald-200 bg-emerald-50/60">
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-emerald-700">
                <ArrowUp className="size-4" />
                <span className="text-sm font-medium">Приходи</span>
              </div>
              <p className="mt-1 text-lg font-bold tabular-nums text-emerald-700">
                {formatBGN(income)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50/60">
            <CardContent className="pt-0">
              <div className="flex items-center gap-2 text-red-700">
                <ArrowDown className="size-4" />
                <span className="text-sm font-medium">Разходи</span>
              </div>
              <p className="mt-1 text-lg font-bold tabular-nums text-red-700">
                {formatBGN(Math.abs(expenses))}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add transaction form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Нова транзакция</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Input
                  id="description"
                  placeholder="напр. Заплата, Наем, Храна..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Сума (лв.)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="Положителна = приход, отрицателна = разход"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                <Plus className="size-4" />
                Добави транзакция
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Transaction history */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">История</CardTitle>
              {transactions.length > 0 && (
                <Badge variant="secondary">{transactions.length}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Няма добавени транзакции
              </p>
            ) : (
              <ul className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {transactions.map((t) => {
                  const isIncome = t.amount > 0
                  return (
                    <li
                      key={t.id}
                      className={`flex items-center justify-between rounded-lg border p-3 transition-colors ${
                        isIncome
                          ? "border-emerald-200 bg-emerald-50/40"
                          : "border-red-200 bg-red-50/40"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {t.text}
                        </p>
                        <p
                          className={`text-sm font-semibold tabular-nums ${
                            isIncome ? "text-emerald-700" : "text-red-700"
                          }`}
                        >
                          {isIncome ? "+" : ""}
                          {formatBGN(t.amount)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2 shrink-0 text-muted-foreground hover:text-red-600"
                        onClick={() => handleDelete(t.id)}
                        aria-label="Изтрий"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        <p className="pb-4 text-center text-xs text-muted-foreground">
          Данните се запазват локално в браузъра ви
        </p>
      </div>
    </div>
  )
}

export default App
