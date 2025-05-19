"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Disc,
  RotateCcw,
  Trophy,
  Brain,
  Users,
  Bot,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Lightbulb,
  HelpCircle,
  Globe,
  BookOpen,
} from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTheme } from "next-themes"
import { VisuallyHidden } from "@/components/visually-hidden"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useAIWorker } from "@/hooks/use-ai-worker"
import { DifficultyDescriptions } from "@/components/difficulty-descriptions"
import { useRouter } from "next/navigation"
import { StrategyTips } from "@/components/strategy-tips"
import { StrategyGuideModal } from "@/components/strategy-guide-modal"

type Difficulty = "easy" | "medium" | "hard"
type GameMode = "singlePlayer" | "twoPlayer"
type AIThought = { column: number; reason: string; score: number }
type MoveHint = { column: number; strength: "best" | "good" | "ok" | "poor"; explanation: string }

export default function ConnectFourGame() {
  const router = useRouter()
  // Board is 6 rows x 7 columns (0 = empty, 1 = player1/yellow, 2 = player2/AI
  const [board, setBoard] = useState(() =>
    Array(6)
      .fill(null)
      .map(() => Array(7).fill(0)),
  )

  const [currentPlayer, setCurrentPlayer] = useState(1) // 1 = player1, 2 = player2/AI
  const [winner, setWinner] = useState<number | null>(null)
  const [isDraw, setIsDraw] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null)
  const [hoverColumn, setHoverColumn] = useState<number | null>(null)
  const [focusedColumn, setFocusedColumn] = useState<number | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>("medium")
  const [showAIThinking, setShowAIThinking] = useState(false)
  const [aiThoughts, setAIThoughts] = useState<AIThought[]>([])
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null)
  const [gameMode, setGameMode] = useState<GameMode>("singlePlayer")
  const [player1Name, setPlayer1Name] = useState("Player 1")
  const [player2Name, setPlayer2Name] = useState("Player 2")
  const [reducedMotion, setReducedMotion] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [highContrast, setHighContrast] = useState(false)
  const [gameAnnouncement, setGameAnnouncement] = useState("")
  const [showHelper, setShowHelper] = useState(false)
  const [helperHints, setHelperHints] = useState<MoveHint[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedHint, setSelectedHint] = useState<number | null>(null)
  const [strategyTipCategory, setStrategyTipCategory] = useState<"offense" | "defense" | "general" | "advanced">(
    "general",
  )
  const announcementRef = useRef<HTMLDivElement>(null)
  const { setTheme, theme } = useTheme()
  const boardRef = useRef<HTMLDivElement>(null)
  const { calculateMove, isCalculating: isAICalculating } = useAIWorker()
  const [strategyGuideOpen, setStrategyGuideOpen] = useState(false)

  // Handle column click for either player
  const handleColumnClick = (col: number) => {
    // Ignore if game is over or column is full
    if (winner || isDraw || board[0][col] !== 0) {
      if (board[0][col] !== 0) {
        announce("This column is full. Please choose another column.")
      }
      return
    }

    // In single player mode, only allow clicks when it's player 1's turn
    if (gameMode === "singlePlayer" && currentPlayer !== 1) {
      return
    }

    // Clear any hints when a move is made
    setHelperHints([])
    setSelectedHint(null)

    dropPiece(col, currentPlayer)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, col: number) => {
    // Move focus with arrow keys
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      const newCol = Math.max(0, col - 1)
      focusColumn(newCol)
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      const newCol = Math.min(6, col + 1)
      focusColumn(newCol)
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleColumnClick(col)
    }
  }

  // Focus a specific column
  const focusColumn = (col: number) => {
    setFocusedColumn(col)
    const columnButtons = boardRef.current?.querySelectorAll("[data-column-button]")
    if (columnButtons && columnButtons[col]) {
      ;(columnButtons[col] as HTMLElement).focus()
    }
  }

  // Announce messages for screen readers
  const announce = (message: string) => {
    setGameAnnouncement(message)
    // Force screen readers to read the new announcement
    if (announcementRef.current) {
      announcementRef.current.setAttribute("aria-live", "assertive")
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.setAttribute("aria-live", "polite")
        }
      }, 1000)
    }
  }

  // Drop a piece in the specified column
  const dropPiece = (col: number, player: number) => {
    // Create a deep copy of the board
    const newBoard = JSON.parse(JSON.stringify(board))

    // Find the lowest empty row in the selected column
    let row = -1
    for (let r = 5; r >= 0; r--) {
      if (newBoard[r][col] === 0) {
        row = r
        break
      }
    }

    // If column is full, do nothing
    if (row === -1) return

    // Place the piece
    newBoard[row][col] = player
    setBoard(newBoard)
    setLastMove({ row, col })
    setSelectedColumn(null)

    // Announce the move
    const playerName = player === 1 ? player1Name : gameMode === "singlePlayer" ? "AI" : player2Name
    const color = player === 1 ? "yellow" : "red"
    announce(`${playerName} placed a ${color} piece in column ${col + 1}, row ${6 - row}.`)

    // Check for win
    if (checkWin(newBoard, row, col)) {
      setWinner(player)
      announce(`${playerName} has won the game by connecting four ${color} pieces!`)
      return
    }

    // Check for draw
    if (isBoardFull(newBoard)) {
      setIsDraw(true)
      announce("The game is a draw. The board is full.")
      return
    }

    // Switch player
    setCurrentPlayer(player === 1 ? 2 : 1)
    const nextPlayer = player === 1 ? 2 : 1
    const nextPlayerName = nextPlayer === 1 ? player1Name : gameMode === "singlePlayer" ? "AI" : player2Name
    const nextColor = nextPlayer === 1 ? "yellow" : "red"
    announce(`It's ${nextPlayerName}'s turn with ${nextColor} pieces.`)

    // Update strategy tip category based on game state
    updateStrategyTipCategory(newBoard)
  }

  // Update the strategy tip category based on game state
  const updateStrategyTipCategory = (currentBoard: number[][]) => {
    // Count pieces to determine game phase
    let pieceCount = 0
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 7; c++) {
        if (currentBoard[r][c] !== 0) pieceCount++
      }
    }

    // Early game
    if (pieceCount < 10) {
      // Randomly choose between general and offense
      setStrategyTipCategory(Math.random() > 0.5 ? "general" : "offense")
    }
    // Mid game
    else if (pieceCount < 25) {
      // Check if there are threats on the board
      const player1Threat = findWinningMove(1) !== -1
      const player2Threat = findWinningMove(2) !== -1

      if (player1Threat || player2Threat) {
        setStrategyTipCategory("defense")
      } else {
        // Randomly choose between offense and advanced
        setStrategyTipCategory(Math.random() > 0.5 ? "offense" : "advanced")
      }
    }
    // Late game
    else {
      setStrategyTipCategory("advanced")
    }
  }

  // AI's turn
  useEffect(() => {
    if (gameMode === "singlePlayer" && currentPlayer === 2 && !winner && !isDraw) {
      setIsThinking(true)
      setAIThoughts([])
      announce("AI is thinking about its move.")

      // Add a delay to make it seem like the AI is thinking
      const timeoutId = setTimeout(
        () => {
          makeAIMove()
        },
        showAIThinking ? 2000 : 1000,
      )

      return () => clearTimeout(timeoutId)
    }
  }, [currentPlayer, winner, isDraw, difficulty, showAIThinking, gameMode])

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  // Make AI move based on difficulty
  const makeAIMove = async () => {
    setIsThinking(true)
    setAIThoughts([])
    announce("AI is thinking about its move.")

    try {
      // Use the Web Worker to calculate the move
      const { column: selectedCol, thoughts, timeElapsed } = await calculateMove(board, difficulty, 2)

      // Sort thoughts by score for display
      thoughts.sort((a, b) => b.score - a.score)
      setAIThoughts(thoughts)

      console.log(`AI calculated move in ${timeElapsed.toFixed(2)}ms`)

      if (showAIThinking) {
        // Show the selected column before making the move
        setSelectedColumn(selectedCol)
        announce(`AI is considering column ${selectedCol + 1}.`)

        setTimeout(() => {
          if (selectedCol !== -1) {
            dropPiece(selectedCol, 2)
          }
          setIsThinking(false)
        }, 1500)
      } else {
        if (selectedCol !== -1) {
          dropPiece(selectedCol, 2)
        }
        setIsThinking(false)
      }
    } catch (error) {
      console.error("Error calculating AI move:", error)

      // Fallback to simple AI if the worker fails
      const winningMove = findWinningMove(2)
      const blockingMove = findWinningMove(1)
      let selectedCol = -1

      if (winningMove !== -1) {
        selectedCol = winningMove
      } else if (blockingMove !== -1) {
        selectedCol = blockingMove
      } else {
        // Pick center or a random valid column
        selectedCol =
          board[0][3] === 0
            ? 3
            : Array(7)
                .fill(0)
                .map((_, i) => i)
                .filter((i) => board[0][i] === 0)[0] || -1
      }

      if (selectedCol !== -1) {
        dropPiece(selectedCol, 2)
      }
      setIsThinking(false)
    }
  }

  // Get move suggestions from the AI helper
  const getMoveHints = () => {
    if (winner || isDraw || (gameMode === "singlePlayer" && currentPlayer !== 1)) {
      return
    }

    setIsAnalyzing(true)
    announce("Analyzing the board for move suggestions.")

    // Add a small delay to simulate thinking
    setTimeout(() => {
      const hints: MoveHint[] = []
      const player = currentPlayer

      // Check for immediate winning moves
      const winningMove = findWinningMove(player)
      if (winningMove !== -1) {
        hints.push({
          column: winningMove,
          strength: "best",
          explanation: "Winning move! This will connect four pieces and win the game.",
        })
      }

      // Check for blocking opponent's winning moves
      const opponentWinningMove = findWinningMove(player === 1 ? 2 : 1)
      if (opponentWinningMove !== -1) {
        hints.push({
          column: opponentWinningMove,
          strength: "best",
          explanation: "Critical defensive move! Your opponent will win next turn if you don't block here.",
        })
      }

      // Look for moves that create multiple threats
      for (let col = 0; col < 7; col++) {
        if (board[0][col] !== 0 || hints.some((h) => h.column === col)) continue

        // Find row where piece would land
        let row = -1
        for (let r = 5; r >= 0; r--) {
          if (board[r][col] === 0) {
            row = r
            break
          }
        }

        if (row === -1) continue

        // Check if this creates potential threats
        const testBoard = JSON.parse(JSON.stringify(board))
        testBoard[row][col] = player

        // Count potential winning lines after this move
        let threatCount = 0
        let potentialThreats = 0

        // Check horizontal threats
        for (let c = Math.max(0, col - 3); c <= Math.min(3, col); c++) {
          let count = 0
          let empty = 0
          for (let i = 0; i < 4; i++) {
            if (c + i >= 0 && c + i < 7 && row >= 0 && row < 6) {
              if (testBoard[row][c + i] === player) count++
              else if (testBoard[row][c + i] === 0) empty++
            }
          }
          if (count === 3 && empty === 1) threatCount++
          if (count === 2 && empty === 2) potentialThreats++
        }

        // Check vertical threats
        if (row <= 2) {
          let count = 0
          for (let r = row; r < row + 4 && r < 6; r++) {
            if (testBoard[r][col] === player) count++
          }
          if (count === 3) threatCount++
          if (count === 2) potentialThreats++
        }

        // Check diagonal threats (both directions)
        // Diagonal: top-left to bottom-right
        for (let r = row - 3, c = col - 3; r <= row && c <= col; r++, c++) {
          let count = 0
          let empty = 0
          for (let i = 0; i < 4; i++) {
            if (r + i >= 0 && r + i < 6 && c + i >= 0 && c + i < 7) {
              if (testBoard[r + i][c + i] === player) count++
              else if (testBoard[r + i][c + i] === 0) empty++
            }
          }
          if (count === 3 && empty === 1) threatCount++
          if (count === 2 && empty === 2) potentialThreats++
        }

        // Diagonal: top-right to bottom-left
        for (let r = row - 3, c = col + 3; r <= row && c >= col; r++, c--) {
          let count = 0
          let empty = 0
          for (let i = 0; i < 4; i++) {
            if (r + i >= 0 && r + i < 6 && c - i >= 0 && c - i < 7) {
              if (testBoard[r + i][c - i] === player) count++
              else if (testBoard[r + i][c - i] === 0) empty++
            }
          }
          if (count === 3 && empty === 1) threatCount++
          if (count === 2 && empty === 2) potentialThreats++
        }

        // Determine move strength based on threats
        if (threatCount >= 2) {
          hints.push({
            column: col,
            strength: "best",
            explanation: "Strong attacking move! This creates multiple winning threats.",
          })
        } else if (threatCount === 1) {
          hints.push({
            column: col,
            strength: "good",
            explanation: "Good attacking move that creates a threat.",
          })
        } else if (potentialThreats >= 2) {
          hints.push({
            column: col,
            strength: "good",
            explanation: "Good developing move that builds toward multiple threats.",
          })
        }
      }

      // Evaluate center control and other strategic positions
      if (!hints.some((h) => h.column === 3) && board[0][3] === 0) {
        hints.push({
          column: 3,
          strength: "good",
          explanation: "The center column is strategically valuable as it allows more winning combinations.",
        })
      }

      // Add evaluations for remaining valid moves
      for (let col = 0; col < 7; col++) {
        if (board[0][col] !== 0 || hints.some((h) => h.column === col)) continue

        // Find row where piece would land
        let row = -1
        for (let r = 5; r >= 0; r--) {
          if (board[r][col] === 0) {
            row = r
            break
          }
        }

        if (row === -1) continue

        // Check if this move would set up opponent's win
        const testBoard = JSON.parse(JSON.stringify(board))
        testBoard[row][col] = player

        // Check if opponent could win after this move
        let dangerousMove = false
        for (let c = 0; c < 7; c++) {
          if (testBoard[0][c] !== 0) continue

          let r = -1
          for (let testRow = 5; testRow >= 0; testRow--) {
            if (testBoard[testRow][c] === 0) {
              r = testRow
              break
            }
          }

          if (r === -1) continue

          const futureBoard = JSON.parse(JSON.stringify(testBoard))
          futureBoard[r][c] = player === 1 ? 2 : 1

          if (checkWin(futureBoard, r, c)) {
            dangerousMove = true
            break
          }
        }

        if (dangerousMove) {
          hints.push({
            column: col,
            strength: "poor",
            explanation: "Caution: This move could set up your opponent for a win.",
          })
        } else {
          // Rate based on position
          const distanceFromCenter = Math.abs(col - 3)
          if (distanceFromCenter <= 1) {
            hints.push({
              column: col,
              strength: "ok",
              explanation: "Decent move that maintains control near the center.",
            })
          } else {
            hints.push({
              column: col,
              strength: "ok",
              explanation: "This move is playable but not particularly strong.",
            })
          }
        }
      }

      // Sort hints by strength
      const strengthOrder = { best: 0, good: 1, ok: 2, poor: 3 }
      hints.sort((a, b) => strengthOrder[a.strength] - strengthOrder[b.strength])

      setHelperHints(hints)
      setIsAnalyzing(false)

      if (hints.length > 0) {
        announce(`Analysis complete. Found ${hints.length} possible moves. Best move is column ${hints[0].column + 1}.`)
      } else {
        announce("Analysis complete. No valid moves found.")
      }
    }, 1000)
  }

  // Get probability based on difficulty
  const getDifficultyProbability = (moveType: "winning" | "blocking" | "strategy") => {
    switch (difficulty) {
      case "easy":
        return moveType === "winning" ? 0.7 : moveType === "blocking" ? 0.5 : 0.3
      case "medium":
        return moveType === "winning" ? 0.95 : moveType === "blocking" ? 0.8 : 0.6
      case "hard":
        return 1.0 // Always make the best move
    }
  }

  // Find a winning move for the specified player
  const findWinningMove = (player: number): number => {
    for (let col = 0; col < 7; col++) {
      // Skip if column is full
      if (board[0][col] !== 0) continue

      // Find the row where the piece would land
      let row = -1
      for (let r = 5; r >= 0; r--) {
        if (board[r][col] === 0) {
          row = r
          break
        }
      }

      if (row === -1) continue

      // Create a copy of the board and place the piece
      const testBoard = JSON.parse(JSON.stringify(board))
      testBoard[row][col] = player

      // Check if this move would win
      if (checkWin(testBoard, row, col)) {
        return col
      }
    }

    return -1
  }

  // Check if the board is full
  const isBoardFull = (board: number[][]): boolean => {
    return board[0].every((cell) => cell !== 0)
  }

  // Check for a win starting from the last placed piece
  const checkWin = (board: number[][], row: number, col: number): boolean => {
    const player = board[row][col]
    if (player === 0) return false

    // Check horizontal
    let count = 0
    for (let c = 0; c < 7; c++) {
      if (board[row][c] === player) {
        count++
        if (count >= 4) return true
      } else {
        count = 0
      }
    }

    // Check vertical
    count = 0
    for (let r = 0; r < 6; r++) {
      if (board[r][col] === player) {
        count++
        if (count >= 4) return true
      } else {
        count = 0
      }
    }

    // Check diagonal (top-left to bottom-right)
    const startRow1 = row - Math.min(row, col)
    const startCol1 = col - Math.min(row, col)
    count = 0
    for (let i = 0; i < 6 && startRow1 + i < 6 && startCol1 + i < 7; i++) {
      if (board[startRow1 + i][startCol1 + i] === player) {
        count++
        if (count >= 4) return true
      } else {
        count = 0
      }
    }

    // Check diagonal (top-right to bottom-left)
    const startRow2 = row - Math.min(row, 6 - col - 1)
    const startCol2 = col + Math.min(row, 6 - col - 1)
    count = 0
    for (let i = 0; i < 6 && startRow2 + i < 6 && startCol2 - i >= 0; i++) {
      if (board[startRow2 + i][startCol2 - i] === player) {
        count++
        if (count >= 4) return true
      } else {
        count = 0
      }
    }

    return false
  }

  // Reset the game
  const resetGame = () => {
    setBoard(
      Array(6)
        .fill(null)
        .map(() => Array(7).fill(0)),
    )
    setCurrentPlayer(1)
    setWinner(null)
    setIsDraw(false)
    setLastMove(null)
    setHoverColumn(null)
    setFocusedColumn(null)
    setAIThoughts([])
    setSelectedColumn(null)
    setHelperHints([])
    setSelectedHint(null)
    announce("Game reset. " + player1Name + " goes first with yellow pieces.")
  }

  // Get current player name
  const getCurrentPlayerName = () => {
    if (gameMode === "singlePlayer") {
      return currentPlayer === 1 ? player1Name : "AI"
    } else {
      return currentPlayer === 1 ? player1Name : player2Name
    }
  }

  // Get winner name
  const getWinnerName = () => {
    if (gameMode === "singlePlayer") {
      return winner === 1 ? player1Name : "AI"
    } else {
      return winner === 1 ? player1Name : player2Name
    }
  }

  // Get piece description for accessibility
  const getPieceDescription = (cell: number, rowIndex: number, colIndex: number) => {
    if (cell === 0) return "Empty"

    const color = cell === 1 ? "Yellow" : "Red"
    const player = cell === 1 ? player1Name : gameMode === "singlePlayer" ? "AI" : player2Name
    const isLastMove = lastMove?.row === rowIndex && lastMove?.col === colIndex

    return `${color} piece (${player})${isLastMove ? " - Last move" : ""}`
  }

  // Get board position description
  const getBoardPosition = (rowIndex: number, colIndex: number) => {
    return `Row ${6 - rowIndex}, Column ${colIndex + 1}`
  }

  // Get color for hint strength
  const getHintColor = (strength: string) => {
    switch (strength) {
      case "best":
        return "bg-green-500 dark:bg-green-600"
      case "good":
        return "bg-blue-500 dark:bg-blue-600"
      case "ok":
        return "bg-yellow-500 dark:bg-yellow-600"
      case "poor":
        return "bg-red-500 dark:bg-red-600"
      default:
        return "bg-slate-500 dark:bg-slate-600"
    }
  }

  // Get text color for hint strength
  const getHintTextColor = (strength: string) => {
    switch (strength) {
      case "best":
        return "text-green-600 dark:text-green-400"
      case "good":
        return "text-blue-600 dark:text-blue-400"
      case "ok":
        return "text-yellow-600 dark:text-yellow-400"
      case "poor":
        return "text-red-600 dark:text-red-400"
      default:
        return "text-slate-600 dark:text-slate-400"
    }
  }

  // Add a function to navigate to the online multiplayer page
  const goToOnlineMultiplayer = () => {
    router.push("/play")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <h1 className="text-4xl font-bold mb-8 text-slate-800 dark:text-slate-100">Connect Four</h1>

      {/* Add buttons for online multiplayer and strategy guide at the top */}
      <div className="mb-6 flex gap-4 flex-wrap justify-center">
        <Button onClick={goToOnlineMultiplayer} className="flex items-center gap-2" variant="outline" size="lg">
          <Globe className="h-5 w-5" />
          Play Online Multiplayer
        </Button>

        <Button
          onClick={() => setStrategyGuideOpen(true)}
          className="flex items-center gap-2"
          variant="outline"
          size="lg"
        >
          <BookOpen className="h-5 w-5" />
          Strategy Guide
        </Button>
      </div>

      {/* Accessibility announcement region */}
      <div ref={announcementRef} aria-live="polite" className="sr-only" role="status">
        {gameAnnouncement}
      </div>

      <Card className="p-8 bg-white shadow-xl rounded-xl border border-slate-200 max-w-3xl w-full dark:bg-slate-900 dark:border-slate-700">
        <div className="flex justify-end mb-4 gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  aria-label={soundEnabled ? "Disable sound" : "Enable sound"}
                >
                  {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{soundEnabled ? "Disable sound" : "Enable sound"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setHighContrast(!highContrast)}
                  aria-label={highContrast ? "Disable high contrast" : "Enable high contrast"}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2a10 10 0 0 1 0 20z" />
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{highContrast ? "Disable high contrast" : "Enable high contrast"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Tabs defaultValue="game" className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="game">Game</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-6 p-4 bg-slate-50 rounded-md dark:bg-slate-800">
            <div>
              <h3 className="text-lg font-medium mb-3 dark:text-white">Game Mode</h3>
              <RadioGroup
                value={gameMode}
                onValueChange={(value) => {
                  setGameMode(value as GameMode)
                  resetGame()
                }}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="singlePlayer" id="singlePlayer" />
                  <Label htmlFor="singlePlayer" className="flex items-center gap-2 dark:text-slate-200">
                    <Bot className="h-4 w-4" />
                    Single Player vs AI
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="twoPlayer" id="twoPlayer" />
                  <Label htmlFor="twoPlayer" className="flex items-center gap-2 dark:text-slate-200">
                    <Users className="h-4 w-4" />
                    Two Players
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="player1Name" className="flex items-center gap-2 mb-2 dark:text-slate-200">
                  <Disc className="h-4 w-4 text-yellow-500" />
                  Player 1 Name
                </Label>
                <Input
                  id="player1Name"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  className="w-full"
                  maxLength={15}
                  aria-label="Player 1 Name"
                />
              </div>

              {gameMode === "twoPlayer" && (
                <div>
                  <Label htmlFor="player2Name" className="flex items-center gap-2 mb-2 dark:text-slate-200">
                    <Disc className="h-4 w-4 text-red-500" />
                    Player 2 Name
                  </Label>
                  <Input
                    id="player2Name"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    className="w-full"
                    maxLength={15}
                    aria-label="Player 2 Name"
                  />
                </div>
              )}
            </div>

            {gameMode === "singlePlayer" && (
              <>
                <div>
                  <h3 className="text-lg font-medium mb-2 dark:text-white">AI Difficulty</h3>
                  <RadioGroup
                    value={difficulty}
                    onValueChange={(value) => setDifficulty(value as Difficulty)}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="easy" id="easy" />
                      <Label htmlFor="easy" className="dark:text-slate-200">
                        Easy
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium" className="dark:text-slate-200">
                        Medium
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hard" id="hard" />
                      <Label htmlFor="hard" className="dark:text-slate-200">
                        Hard
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="mt-4">
                    <DifficultyDescriptions />
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <Switch id="show-thinking" checked={showAIThinking} onCheckedChange={setShowAIThinking} />
                    <Label htmlFor="show-thinking" className="flex items-center gap-2 dark:text-slate-200">
                      <Brain className="h-4 w-4" />
                      Show AI Thinking
                    </Label>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    See how the AI evaluates each possible move
                  </p>
                </div>
              </>
            )}

            <div>
              <div className="flex items-center space-x-2">
                <Switch id="show-helper" checked={showHelper} onCheckedChange={setShowHelper} />
                <Label htmlFor="show-helper" className="flex items-center gap-2 dark:text-slate-200">
                  <Lightbulb className="h-4 w-4" />
                  Enable Move Helper
                </Label>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Get suggestions for your best moves</p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2 dark:text-white">Accessibility</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Switch id="reduced-motion" checked={reducedMotion} onCheckedChange={setReducedMotion} />
                  <Label htmlFor="reduced-motion" className="dark:text-slate-200">
                    Reduce animations
                  </Label>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Keyboard controls: Use arrow keys to navigate columns, Enter or Space to drop a piece
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="game">
            <div className="mb-6 flex justify-between items-center">
              <div
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  currentPlayer === 1 && !winner && !isDraw
                    ? "bg-yellow-100 dark:bg-yellow-900"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
                aria-current={currentPlayer === 1 && !winner && !isDraw ? "true" : "false"}
              >
                <div className="relative">
                  <Disc
                    className={`h-6 w-6 ${
                      currentPlayer === 1 && !winner && !isDraw ? "text-yellow-500" : "text-slate-300"
                    }`}
                  />
                  {highContrast && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold">1</span>
                    </div>
                  )}
                </div>
                <span
                  className={`font-medium text-lg ${
                    currentPlayer === 1 && !winner && !isDraw
                      ? "text-slate-800 dark:text-yellow-200"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {player1Name}
                </span>
              </div>

              <div className="flex gap-2">
                {showHelper && (currentPlayer === 1 || gameMode === "twoPlayer") && !winner && !isDraw && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={getMoveHints}
                          disabled={isAnalyzing}
                          className="flex items-center gap-1"
                          aria-label="Get move suggestions"
                        >
                          <Lightbulb className="h-4 w-4" />
                          {isAnalyzing ? "Analyzing..." : "Hint"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Get suggestions for your best moves</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetGame}
                  className="flex items-center gap-1"
                  aria-label="Reset game"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              </div>

              <div
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  currentPlayer === 2 && !winner && !isDraw
                    ? "bg-red-100 dark:bg-red-900"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
                aria-current={currentPlayer === 2 && !winner && !isDraw ? "true" : "false"}
              >
                <span
                  className={`font-medium text-lg ${
                    currentPlayer === 2 && !winner && !isDraw
                      ? "text-slate-800 dark:text-red-200"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {gameMode === "singlePlayer" ? "AI" : player2Name}
                </span>
                <div className="relative">
                  <Disc
                    className={`h-6 w-6 ${
                      currentPlayer === 2 && !winner && !isDraw ? "text-red-500" : "text-slate-300"
                    }`}
                  />
                  {highContrast && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-bold">2</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                {/* Game board */}
                <div
                  ref={boardRef}
                  className="bg-blue-600 p-4 rounded-lg shadow-inner relative dark:bg-blue-900"
                  role="grid"
                  aria-label="Connect Four game board"
                  aria-rowcount={6}
                  aria-colcount={7}
                >
                  {/* Hover indicator */}
                  {!winner &&
                    !isDraw &&
                    hoverColumn !== null &&
                    (gameMode === "twoPlayer" || currentPlayer === 1) &&
                    !reducedMotion && (
                      <div className="flex justify-center mb-2">
                        <div
                          className={`w-8 h-8 rounded-full opacity-70 ${
                            currentPlayer === 1
                              ? highContrast
                                ? "bg-yellow-400 border-2 border-black"
                                : "bg-yellow-400"
                              : highContrast
                                ? "bg-red-500 border-2 border-black"
                                : "bg-red-500"
                          }`}
                          style={{ transform: `translateX(${hoverColumn * 44}px)` }}
                          aria-hidden="true"
                        />
                      </div>
                    )}

                  {/* Board */}
                  <div className="grid grid-cols-7 gap-2" role="presentation">
                    {board.map((row, rowIndex) =>
                      row.map((cell, colIndex) => {
                        // Check if this column has a hint
                        const hint = helperHints.find((h) => h.column === colIndex)
                        const isHintColumn = hint !== undefined
                        const isSelectedHint = selectedHint === colIndex

                        return (
                          <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-10 h-10 rounded-full flex items-center justify-center relative ${
                              selectedColumn === colIndex && isThinking ? "ring-2 ring-white" : ""
                            } ${focusedColumn === colIndex ? "ring-2 ring-yellow-300 dark:ring-yellow-400" : ""} ${
                              isHintColumn && rowIndex === 0
                                ? `bg-blue-700 dark:bg-blue-950 ${isSelectedHint ? "ring-2 ring-white" : ""}`
                                : "bg-blue-700 dark:bg-blue-950"
                            }`}
                            role="gridcell"
                            aria-rowindex={rowIndex + 1}
                            aria-colindex={colIndex + 1}
                            aria-label={`${getBoardPosition(rowIndex, colIndex)}: ${getPieceDescription(
                              cell,
                              rowIndex,
                              colIndex,
                            )}`}
                          >
                            {/* Hint indicator at top of column */}
                            {isHintColumn && rowIndex === 0 && (
                              <div
                                className={`absolute -top-6 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full ${getHintColor(
                                  hint.strength,
                                )} flex items-center justify-center text-white text-xs font-bold z-10 cursor-pointer ${
                                  isSelectedHint ? "ring-2 ring-white" : ""
                                }`}
                                onClick={() => setSelectedHint(isSelectedHint ? null : colIndex)}
                                aria-label={`${hint.strength} move in column ${colIndex + 1}: ${hint.explanation}`}
                              >
                                {hint.strength === "best" ? "★" : hint.strength === "good" ? "✓" : "•"}
                              </div>
                            )}

                            <button
                              className="absolute inset-0 w-full h-full cursor-pointer focus:outline-none"
                              onMouseEnter={() => setHoverColumn(colIndex)}
                              onMouseLeave={() => setHoverColumn(null)}
                              onClick={() => handleColumnClick(colIndex)}
                              onKeyDown={(e) => handleKeyDown(e, colIndex)}
                              disabled={
                                winner !== null ||
                                isDraw ||
                                (gameMode === "singlePlayer" && currentPlayer !== 1) ||
                                board[0][colIndex] !== 0
                              }
                              aria-label={`Drop piece in column ${colIndex + 1}`}
                              data-column-button
                              tabIndex={0}
                            >
                              <VisuallyHidden>
                                {board[0][colIndex] !== 0
                                  ? "Column full"
                                  : `Drop ${currentPlayer === 1 ? "yellow" : "red"} piece in column ${colIndex + 1}`}
                              </VisuallyHidden>
                            </button>
                            <div
                              className={`w-8 h-8 rounded-full ${
                                cell === 1
                                  ? highContrast
                                    ? "bg-yellow-400 border-2 border-black"
                                    : "bg-yellow-400"
                                  : cell === 2
                                    ? highContrast
                                      ? "bg-red-500 border-2 border-black"
                                      : "bg-red-500"
                                    : "bg-blue-200 bg-opacity-20 dark:bg-blue-800"
                              } ${
                                lastMove && lastMove.row === rowIndex && lastMove.col === colIndex
                                  ? "ring-2 ring-white ring-opacity-70"
                                  : ""
                              }`}
                            >
                              {highContrast && cell > 0 && (
                                <div className="flex items-center justify-center h-full">
                                  <span className="text-xs font-bold">{cell}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      }),
                    )}
                  </div>

                  {/* AI thinking indicator */}
                  {isThinking && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-600 bg-opacity-40 rounded-lg dark:bg-blue-900 dark:bg-opacity-40">
                      <div className="animate-pulse text-white font-bold">AI is thinking...</div>
                    </div>
                  )}

                  {/* Move analysis indicator */}
                  {isAnalyzing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-600 bg-opacity-40 rounded-lg dark:bg-blue-900 dark:bg-opacity-40">
                      <div className="animate-pulse text-white font-bold flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Analyzing possible moves...
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected hint explanation */}
                {selectedHint !== null && (
                  <div className="mt-2 p-3 bg-slate-100 rounded-md dark:bg-slate-800">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-4 h-4 rounded-full ${getHintColor(
                          helperHints.find((h) => h.column === selectedHint)?.strength || "ok",
                        )}`}
                      ></div>
                      <span className="font-medium dark:text-white">
                        Column {selectedHint + 1}:{" "}
                        <span
                          className={getHintTextColor(
                            helperHints.find((h) => h.column === selectedHint)?.strength || "ok",
                          )}
                        >
                          {helperHints.find((h) => h.column === selectedHint)?.strength.toUpperCase()}
                        </span>
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      {helperHints.find((h) => h.column === selectedHint)?.explanation}
                    </p>
                  </div>
                )}

                {/* Game status */}
                {(winner || isDraw) && (
                  <div className="mt-4 p-3 bg-slate-100 rounded-md text-center dark:bg-slate-800">
                    {winner ? (
                      <div className="flex items-center justify-center gap-2">
                        <Trophy className={`h-5 w-5 ${winner === 1 ? "text-yellow-500" : "text-red-500"}`} />
                        <span className="font-medium dark:text-white">{getWinnerName()} won!</span>
                      </div>
                    ) : (
                      <span className="font-medium dark:text-white">It's a draw!</span>
                    )}
                  </div>
                )}

                {!winner && !isDraw && (
                  <div className="mt-4 p-3 bg-slate-100 rounded-md text-center dark:bg-slate-800">
                    <span className="dark:text-white">
                      {getCurrentPlayerName()}'s turn -
                      <span className={`font-medium ${currentPlayer === 1 ? "text-yellow-500" : "text-red-500"}`}>
                        {" "}
                        {currentPlayer === 1 ? "Yellow" : "Red"}
                      </span>
                    </span>
                  </div>
                )}
              </div>

              <div className="md:col-span-1">
                {/* Strategy tips */}
                <StrategyTips category={strategyTipCategory} />

                {/* Helper legend */}
                {showHelper && helperHints.length > 0 && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-md dark:bg-slate-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                      <h3 className="font-medium text-slate-700 dark:text-slate-300">Move Suggestions</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700">
                        ★ Best
                      </Badge>
                      <Badge className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
                        ✓ Good
                      </Badge>
                      <Badge className="bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700">
                        • OK
                      </Badge>
                      <Badge className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700">
                        • Poor
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                      Click on a suggestion marker to see details, or click the column to make that move.
                    </p>
                  </div>
                )}

                {/* Game instructions */}
                <div className="mt-4 p-3 bg-slate-50 rounded-md text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-slate-700 dark:text-slate-300">How to play:</h3>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <HelpCircle className="h-4 w-4" />
                          <span className="sr-only">Help</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <h4 className="font-medium">Connect Four Rules</h4>
                          <p className="text-sm">
                            Players take turns dropping colored discs into a seven-column, six-row grid. The pieces fall
                            straight down, occupying the lowest available space within the column.
                          </p>
                          <p className="text-sm">
                            The objective is to be the first to form a horizontal, vertical, or diagonal line of four of
                            one's own discs.
                          </p>
                          <h4 className="font-medium mt-2">Helper Feature</h4>
                          <p className="text-sm">
                            The AI helper analyzes the board and suggests moves. Colored markers indicate the quality of
                            each move. Click a marker to see why it's recommended.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Click on a column to drop your piece</li>
                    <li>Connect four pieces horizontally, vertically, or diagonally to win</li>
                    <li>Use keyboard arrow keys to navigate and Enter/Space to drop a piece</li>
                    {showHelper && <li>Click the Hint button for move suggestions</li>}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* AI Thinking Panel */}
        {gameMode === "singlePlayer" && showAIThinking && currentPlayer === 2 && aiThoughts.length > 0 && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <h3 className="font-medium dark:text-white">AI Thinking Process</h3>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {aiThoughts.map((thought, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    selectedColumn === thought.column
                      ? "bg-blue-100 border border-blue-300 dark:bg-blue-900 dark:border-blue-700"
                      : "bg-slate-100 dark:bg-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium dark:text-white">Column {thought.column + 1}</span>
                    <span
                      className={`text-sm ${
                        thought.score > 80
                          ? "text-green-600 dark:text-green-400"
                          : thought.score > 50
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      Score: {thought.score}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{thought.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
      <StrategyGuideModal open={strategyGuideOpen} onOpenChange={setStrategyGuideOpen} />
    </div>
  )
}
