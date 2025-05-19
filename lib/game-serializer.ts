import type { GameState } from "./game-state-machine"

// Base64 encode/decode functions
function base64Encode(obj: any): string {
  try {
    const jsonString = JSON.stringify(obj)
    return btoa(encodeURIComponent(jsonString))
  } catch (error) {
    console.error("Error encoding game state:", error)
    return ""
  }
}

function base64Decode<T>(str: string): T | null {
  try {
    const jsonString = decodeURIComponent(atob(str))
    return JSON.parse(jsonString) as T
  } catch (error) {
    console.error("Error decoding game state:", error)
    return null
  }
}

// For efficient storage, we'll create a more compact representation
// of the game state when exporting
interface CompactGameState {
  b: number[][] // board
  c: number // currentPlayer
  m: string // gameMode (s=single, t=two)
  d: string // difficulty (e=easy, m=medium, h=hard)
  l: [number, number] | null // lastMove
  w: number | null // winner
  h: [number, number][] // moveHistory
  n: [string, string] // player names
}

// Convert full game state to compact form
function compactify(state: GameState): CompactGameState {
  return {
    b: state.board,
    c: state.currentPlayer,
    m: state.gameMode === "singlePlayer" ? "s" : "t",
    d: state.difficulty[0] as "e" | "m" | "h",
    l: state.lastMove ? [state.lastMove.row, state.lastMove.col] : null,
    w: state.winner,
    h: state.moveHistory.map((move) => [move.row, move.col]),
    n: [state.player1Name, state.player2Name],
  }
}

// Convert compact form back to full game state
function decompactify(compact: CompactGameState): GameState {
  return {
    board: compact.b,
    currentPlayer: compact.c as 1 | 2,
    gameMode: compact.m === "s" ? "singlePlayer" : "twoPlayer",
    difficulty: compact.d === "e" ? "easy" : compact.d === "m" ? "medium" : "hard",
    lastMove: compact.l ? { row: compact.l[0], col: compact.l[1] } : null,
    winner: compact.w as 1 | 2 | null,
    isDraw: compact.w === null && compact.b[0].every((cell) => cell !== 0),
    moveHistory: compact.h.map(([row, col]) => ({ row, col })),
    player1Name: compact.n[0],
    player2Name: compact.n[1],
    showAIThinking: false,
    isThinking: false,
  }
}

// Function to export game state as a compact string
export function exportGame(state: GameState): string {
  const compactState = compactify(state)
  return base64Encode(compactState)
}

// Function to import game state from a string
export function importGame(stateString: string): GameState | null {
  const compactState = base64Decode<CompactGameState>(stateString)
  if (!compactState) return null

  return decompactify(compactState)
}

// Generate a shareable URL with the game state embedded
export function generateShareableURL(state: GameState): string {
  const baseUrl = window.location.origin + window.location.pathname
  const stateParam = exportGame(state)
  return `${baseUrl}?game=${stateParam}`
}

// Parse a shareable URL to extract the game state
export function parseShareableURL(url: string): GameState | null {
  try {
    const urlObj = new URL(url)
    const stateParam = urlObj.searchParams.get("game")
    if (!stateParam) return null

    return importGame(stateParam)
  } catch (error) {
    console.error("Error parsing shareable URL:", error)
    return null
  }
}
