import { Card, CardDescription, CardTitle } from "@/components/ui/card"
import { Lightbulb, Target, Shield, Zap } from "lucide-react"

type StrategyTipProps = {
  category: "offense" | "defense" | "general" | "advanced"
}

const OFFENSE_TIPS = [
  "Try to control the center column - it allows for the most winning combinations.",
  "Look for opportunities to create multiple threats at once.",
  "When you have three in a row with both ends open, you have a guaranteed win.",
  "Building pieces in a diagonal pattern is harder for opponents to notice and block.",
  "If you can force your opponent to play in a specific column, you can set up winning moves.",
]

const DEFENSE_TIPS = [
  "Always check if your opponent is one move away from connecting four.",
  "Be careful not to play directly below a spot where your opponent could win.",
  "Watch for diagonal threats - they're easier to miss but just as dangerous.",
  "If your opponent has two pieces with a gap between them, they may be setting up a trap.",
  "When your opponent controls the center, try to limit their options by playing adjacent.",
]

const GENERAL_TIPS = [
  "Think at least two moves ahead - your move, their response, and your follow-up.",
  "The player who goes first has a slight advantage in Connect Four.",
  "Sometimes it's better to build your position than to block your opponent.",
  "Pay attention to the pattern of alternating turns - some columns will always be your turn.",
  "If a column is getting full, consider how the top pieces will affect the game.",
]

const ADVANCED_TIPS = [
  "Create 'forcing moves' that limit your opponent's options and make their moves predictable.",
  "Look for the 'seven-four' trap - creating threats in columns that are three apart.",
  "In the endgame, count the number of moves until the board is full to plan your strategy.",
  "Sometimes allowing your opponent to make a three-in-a-row can be a trap if it forces them to play where you want.",
  "The 'even-odd' strategy involves controlling columns where you'll get the last move.",
]

export function StrategyTips({ category = "general" }: StrategyTipProps) {
  let tips: string[] = []
  let icon = <Lightbulb className="h-5 w-5 text-yellow-500" />
  let title = "Strategy Tips"
  let description = "Improve your game with these helpful tips"

  switch (category) {
    case "offense":
      tips = OFFENSE_TIPS
      icon = <Zap className="h-5 w-5 text-red-500" />
      title = "Offensive Strategies"
      description = "Create threats and win the game"
      break
    case "defense":
      tips = DEFENSE_TIPS
      icon = <Shield className="h-5 w-5 text-blue-500" />
      title = "Defensive Strategies"
      description = "Block your opponent and protect your position"
      break
    case "advanced":
      tips = ADVANCED_TIPS
      icon = <Target className="h-5 w-5 text-purple-500" />
      title = "Advanced Tactics"
      description = "Master these concepts for expert play"
      break
    default:
      tips = GENERAL_TIPS
  }

  // Get a random tip
  const randomTip = tips[Math.floor(Math.random() * tips.length)]

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <CardDescription className="text-xs">{description}</CardDescription>
        </div>
      </div>
      <p className="text-sm">{randomTip}</p>
    </Card>
  )
}
