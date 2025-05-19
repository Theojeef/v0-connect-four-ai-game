"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLocalStorage } from "../hooks/use-local-storage"
import { BarChart, Activity, Award } from "lucide-react"

type GameStats = {
  totalGames: number
  wins: number
  losses: number
  draws: number
  streak: number
  bestStreak: number
  averageMovesPerGame: number
  totalMoves: number
  timeSpent: number // in seconds
  lastPlayed: string // ISO date string
}

const DEFAULT_STATS: GameStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  streak: 0,
  bestStreak: 0,
  averageMovesPerGame: 0,
  totalMoves: 0,
  timeSpent: 0,
  lastPlayed: new Date().toISOString(),
}

export function GameStats() {
  const [stats, setStats] = useLocalStorage<GameStats>("connect-four-stats", DEFAULT_STATS)
  const [isClient, setIsClient] = useState(false)

  // Ensure we only render on client since we access localStorage
  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Game Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Games Played</span>
              <span className="font-medium">{stats.totalGames}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Wins</span>
              <span className="font-medium text-green-600">{stats.wins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Losses</span>
              <span className="font-medium text-red-600">{stats.losses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Draws</span>
              <span className="font-medium text-blue-600">{stats.draws}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Win Rate</span>
              <span className="font-medium">
                {stats.totalGames > 0 ? Math.round((stats.wins / stats.totalGames) * 100) + "%" : "0%"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Award className="h-4 w-4" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Current Streak</span>
              <span className="font-medium">{stats.streak} games</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Best Streak</span>
              <span className="font-medium">{stats.bestStreak} games</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Last Played</span>
              <span className="font-medium">{new Date(stats.lastPlayed).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg. Moves Per Game</span>
              <span className="font-medium">
                {stats.totalGames > 0 ? Math.round(stats.totalMoves / stats.totalGames) : 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Time Played</span>
              <span className="font-medium">
                {Math.floor(stats.timeSpent / 3600)}h {Math.floor((stats.timeSpent % 3600) / 60)}m
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
