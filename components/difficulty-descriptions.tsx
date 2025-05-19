import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain } from "lucide-react"

export function DifficultyDescriptions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Easy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            The AI looks 2 moves ahead and occasionally makes random moves. Good for beginners or casual play.
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Medium
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            The AI looks 4 moves ahead and uses opening book strategies. Provides a balanced challenge for most players.
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Hard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            The AI looks 6 moves ahead with advanced evaluation. Uses optimal strategies and will punish mistakes.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  )
}
