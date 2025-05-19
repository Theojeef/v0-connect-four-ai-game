"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { io, type Socket } from "socket.io-client"
import type { Board, Player } from "./game-state-machine"

// Types for our socket events
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

// Socket events
export type ServerToClientEvents = {
  gameState: (state: GameState) => void
  playerJoined: (player: PlayerInfo) => void
  playerLeft: (playerId: string) => void
  gameError: (error: string) => void
  chatMessage: (message: { sender: string; text: string; timestamp: number }) => void
}

export type ClientToServerEvents = {
  joinGame: (gameId: string, playerName: string) => void
  createGame: (playerName: string) => void
  makeMove: (column: number) => void
  leaveGame: () => void
  sendChatMessage: (message: string) => void
}

// Custom hook for socket connection
export function useSocketGame() {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const [connected, setConnected] = useState(false)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; timestamp: number }>>([])
  const socketRef = useRef<Socket | null>(null)

  // Initialize socket connection
  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return

    // Create socket connection
    const socketIo = io(process.env.NEXT_PUBLIC_SOCKET_URL || "https://connect-four-socket-server.vercel.app", {
      transports: ["websocket"],
      autoConnect: true,
    })

    // Set up event listeners
    socketIo.on("connect", () => {
      console.log("Connected to socket server")
      setConnected(true)
      setPlayerId(socketIo.id)
    })

    socketIo.on("disconnect", () => {
      console.log("Disconnected from socket server")
      setConnected(false)
    })

    socketIo.on("gameState", (state) => {
      console.log("Received game state:", state)
      setGameState(state)
      setError(null)
    })

    socketIo.on("gameError", (errorMessage) => {
      console.error("Game error:", errorMessage)
      setError(errorMessage)
    })

    socketIo.on("chatMessage", (message) => {
      setChatMessages((prev) => [...prev, message])
    })

    // Store socket in ref and state
    socketRef.current = socketIo
    setSocket(socketIo as Socket<ServerToClientEvents, ClientToServerEvents>)

    // Clean up on unmount
    return () => {
      socketIo.disconnect()
    }
  }, [])

  // Create a new game
  const createGame = useCallback(
    (playerName: string) => {
      if (!socket) return
      socket.emit("createGame", playerName)
    },
    [socket],
  )

  // Join an existing game
  const joinGame = useCallback(
    (gameId: string, playerName: string) => {
      if (!socket) return
      socket.emit("joinGame", gameId, playerName)
    },
    [socket],
  )

  // Make a move in the game
  const makeMove = useCallback(
    (column: number) => {
      if (!socket || !gameState) return
      socket.emit("makeMove", column)
    },
    [socket, gameState],
  )

  // Leave the current game
  const leaveGame = useCallback(() => {
    if (!socket) return
    socket.emit("leaveGame")
    setGameState(null)
  }, [socket])

  // Send a chat message
  const sendChatMessage = useCallback(
    (message: string) => {
      if (!socket || !gameState) return
      socket.emit("sendChatMessage", message)
    },
    [socket, gameState],
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
    socket,
    connected,
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
