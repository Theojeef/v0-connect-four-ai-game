"use client"

import { useState, useEffect, useCallback } from "react"
import { v4 as uuidv4 } from "uuid"
import type { Board, Player } from "./game-state-machine"

// Types for our simulated game state
export type GameState = {
  gameId: string
  board: Board
  currentPlayer: Player
  lastMove: { row: number; col: number } | null
  winner: Player | null
  isDraw: boolean
  players: {
    [playerId: string]: {
      name: string
      role: "host" | "guest"
      playerNumber: Player
    }
  }
}

export type PlayerInfo = {
  id: string
  name: string
  role: "host" | "guest"
  playerNumber: Player
}

// Custom hook for simulated socket connection
export function useSimulatedGame() {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; timestamp: number }>>([])

  // Initialize player ID
  useEffect(() => {
    if (!playerId) {
      setPlayerId(uuidv4())
    }
  }, [playerId])

  // Create a new game
  const createGame = useCallback(
    (playerName: string) => {
      if (!playerId) return

      const gameId = uuidv4().substring(0, 8)
      const newGameState: GameState = {
        gameId,
        board: Array(6)
          .fill(null)
          .map(() => Array(7).fill(0)),
        currentPlayer: 1,
        lastMove: null,
        winner: null,
        isDraw: false,
        players: {
          [playerId]: {
            name: playerName,
            role: "host",
            playerNumber: 1,
          },
        },
      }

      setGameState(newGameState)
      setError(null)

      // Simulate AI joining after a delay (for demo purposes)
      setTimeout(() => {
        if (playerId) {
          const aiId = "ai-" + uuidv4().substring(0, 8)
          setGameState((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              players: {
                ...prev.players,
                [aiId]: {
                  name: "AI Opponent",
                  role: "guest",
                  playerNumber: 2,
                },
              },
            }
          })

          // Add welcome message
          setChatMessages([
            {
              sender: "System",
              text: "Game created! AI opponent has joined.",
              timestamp: Date.now(),
            },
          ])
        }
      }, 1500)
    },
    [playerId],
  )

  // Join an existing game
  const joinGame = useCallback(
    (gameId: string, playerName: string) => {
      if (!playerId) return

      // For demo purposes, create a new game as if joining
      const newGameState: GameState = {
        gameId,
        board: Array(6)
          .fill(null)
          .map(() => Array(7).fill(0)),
        currentPlayer: 1,
        lastMove: null,
        winner: null,
        isDraw: false,
        players: {
          "host-id": {
            name: "Host Player",
            role: "host",
            playerNumber: 1,
          },
          [playerId]: {
            name: playerName,
            role: "guest",
            playerNumber: 2,
          },
        },
      }

      setGameState(newGameState)
      setError(null)
      setChatMessages([
        {
          sender: "System",
          text: `You've joined the game. You are playing as Red (Player 2).`,
          timestamp: Date.now(),
        },
      ])
    },
    [playerId],
  )

  // Make a move in the game
  const makeMove = useCallback(
    (column: number) => {
      if (!gameState || !playerId) return

      // Check if it's the player's turn
      const playerInfo = gameState.players[playerId]
      if (!playerInfo || gameState.currentPlayer !== playerInfo.playerNumber) {
        setError("It's not your turn")
        return
      }

      // Check if column is valid
      if (gameState.board[0][column] !== 0) {
        setError("Column is full")
        return
      }

      // Find the lowest empty row in the selected column
      let row = -1
      for (let r = 5; r >= 0; r--) {
        if (gameState.board[r][column] === 0) {
          row = r
          break
        }
      }

      if (row === -1) {
        setError("Column is full")
        return
      }

      // Create a deep copy of the board
      const newBoard = JSON.parse(JSON.stringify(gameState.board))
      newBoard[row][column] = gameState.currentPlayer

      // Check for win
      const isWin = checkWin(newBoard, row, column, gameState.currentPlayer)

      // Check for draw
      const isDraw = !isWin && isBoardFull(newBoard)

      // Update game state
      setGameState({
        ...gameState,
        board: newBoard,
        currentPlayer: gameState.currentPlayer === 1 ? 2 : 1,
        lastMove: { row, col: column },
        winner: isWin ? gameState.currentPlayer : null,
        isDraw,
      })

      // If it's now AI's turn and not game over, make AI move after a delay
      if (
        gameState.currentPlayer === 1 && // Player just moved
        !isWin &&
        !isDraw &&
        Object.values(gameState.players).some((p) => p.name === "AI Opponent")
      ) {
        setTimeout(() => {
          makeAIMove(newBoard)
        }, 1500)
      }
    },
    [gameState, playerId],
  )

  // Simulated AI move
  const makeAIMove = useCallback(
    (board: number[][]) => {
      if (!gameState) return

      // First, check if AI can win in the next move
      const winningMove = findWinningMove(board, 2)
      if (winningMove !== -1) {
        makeMove(winningMove)
        return
      }

      // Then, block player from winning
      const blockingMove = findWinningMove(board, 1)
      if (blockingMove !== -1) {
        makeMove(blockingMove)
        return
      }

      // Try to play in the center column if possible
      const centerCol = 3
      if (board[0][centerCol] === 0) {
        makeMove(centerCol)
        return
      }

      // Otherwise, make a strategic move
      // Prioritize columns that are closer to the center
      const colPriority = [3, 2, 4, 1, 5, 0, 6]

      for (const col of colPriority) {
        if (board[0][col] === 0) {
          makeMove(col)
          return
        }
      }
    },
    [gameState, makeMove],
  )

  // Helper function to find a winning move
  const findWinningMove = (board: number[][], player: number): number => {
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
      if (checkWin(testBoard, row, col, player)) {
        return col
      }
    }

    return -1
  }

  // Check if the board is full
  const isBoardFull = (board: number[][]): boolean => {
    return board[0].every((cell) => cell !== 0)
  }

  // Check for a win
  const checkWin = (board: number[][], row: number, col: number, player: number): boolean => {
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

  // Leave the current game
  const leaveGame = useCallback(() => {
    setGameState(null)
    setChatMessages([])
  }, [])

  // Send a chat message
  const sendChatMessage = useCallback(
    (message: string) => {
      if (!gameState || !playerId) return

      const playerName = gameState.players[playerId]?.name || "You"
      const newMessage = {
        sender: playerName,
        text: message,
        timestamp: Date.now(),
      }

      setChatMessages((prev) => [...prev, newMessage])

      // Simulate AI response after a delay
      if (Object.values(gameState.players).some((p) => p.name === "AI Opponent")) {
        setTimeout(
          () => {
            const aiResponses = [
              "Hmm, interesting move.",
              "I'm thinking...",
              "Nice strategy!",
              "Let me consider my options.",
              "Good game so far!",
              "I see what you're trying to do there.",
              "This is fun!",
              "I'm enjoying this game.",
            ]
            const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]
            setChatMessages((prev) => [
              ...prev,
              {
                sender: "AI Opponent",
                text: randomResponse,
                timestamp: Date.now(),
              },
            ])
          },
          1000 + Math.random() * 2000,
        )
      }
    },
    [gameState, playerId],
  )

  // Get current player info
  const getPlayerInfo = useCallback(() => {
    if (!gameState || !playerId) return null
    return gameState.players[playerId]
  }, [gameState, playerId])

  // Check if it's the current player's turn
  const isMyTurn = useCallback(() => {
    if (!gameState || !playerId || !gameState.players[playerId]) return false
    return gameState.currentPlayer === gameState.players[playerId].playerNumber
  }, [gameState, playerId])

  // Generate a shareable game link
  const getShareableLink = useCallback(() => {
    if (!gameState) return ""
    return `${window.location.origin}/play?gameId=${gameState.gameId}`
  }, [gameState])

  return {
    connected: true, // Always connected in simulation
    gameState,
    playerId,
    error,
    chatMessages,
    createGame,
    joinGame,
    makeMove,
    leaveGame,
    sendChatMessage,
    getPlayerInfo,
    isMyTurn,
    getShareableLink,
  }
}
