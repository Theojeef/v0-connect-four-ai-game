export type Player = 1 | 2
export type Cell = 0 | Player
export type Board = Cell[][]
export type Position = { row: number; col: number }
export type GameMode = "singlePlayer" | "twoPlayer"
export type Difficulty = "easy" | "medium" | "hard"

export type GameState = {
  board: Board
  currentPlayer: Player
  gameMode: GameMode
  difficulty: Difficulty
  lastMove: Position | null
  winner: Player | null
  isDraw: boolean
  moveHistory: Position[]
  player1Name: string
  player2Name: string
  showAIThinking: boolean
  isThinking: boolean
}

export type GameAction =
  | { type: "MAKE_MOVE"; column: number }
  | { type: "RESET_GAME" }
  | { type: "SET_GAME_MODE"; mode: GameMode }
  | { type: "SET_DIFFICULTY"; level: Difficulty }
  | { type: "SET_NAMES"; player1: string; player2: string }
  | { type: "TOGGLE_AI_THINKING" }
  | { type: "UNDO_MOVE" }
  | { type: "LOAD_GAME"; state: GameState }

export function createInitialState(): GameState {
  return {
    board: Array(6)
      .fill(null)
      .map(() => Array(7).fill(0)),
    currentPlayer: 1,
    gameMode: "singlePlayer",
    difficulty: "medium",
    lastMove: null,
    winner: null,
    isDraw: false,
    moveHistory: [],
    player1Name: "Player 1",
    player2Name: "Player 2",
    showAIThinking: false,
    isThinking: false,
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "MAKE_MOVE": {
      // Skip if game is over or column is full
      if (state.winner || state.isDraw || state.board[0][action.column] !== 0) {
        return state
      }

      // Create a deep copy of the board
      const newBoard = JSON.parse(JSON.stringify(state.board))

      // Find the lowest empty row in the selected column
      let row = -1
      for (let r = 5; r >= 0; r--) {
        if (newBoard[r][action.column] === 0) {
          row = r
          break
        }
      }

      // If column is full, do nothing
      if (row === -1) return state

      // Place the piece
      newBoard[row][action.column] = state.currentPlayer

      // Check for win
      const isWin = checkWin(newBoard, row, action.column)

      // Check for draw
      const isDraw = !isWin && isBoardFull(newBoard)

      // Update move history
      const newMoveHistory = [...state.moveHistory, { row, col: action.column }]

      return {
        ...state,
        board: newBoard,
        currentPlayer: state.currentPlayer === 1 ? 2 : 1,
        lastMove: { row, col: action.column },
        winner: isWin ? state.currentPlayer : null,
        isDraw,
        moveHistory: newMoveHistory,
      }
    }

    case "RESET_GAME":
      return {
        ...state,
        board: Array(6)
          .fill(null)
          .map(() => Array(7).fill(0)),
        currentPlayer: 1,
        lastMove: null,
        winner: null,
        isDraw: false,
        moveHistory: [],
        isThinking: false,
      }

    case "SET_GAME_MODE":
      return {
        ...state,
        gameMode: action.mode,
      }

    case "SET_DIFFICULTY":
      return {
        ...state,
        difficulty: action.level,
      }

    case "SET_NAMES":
      return {
        ...state,
        player1Name: action.player1,
        player2Name: action.player2,
      }

    case "TOGGLE_AI_THINKING":
      return {
        ...state,
        showAIThinking: !state.showAIThinking,
      }

    case "UNDO_MOVE": {
      if (state.moveHistory.length === 0) {
        return state
      }

      // Create a deep copy of the board
      const newBoard = JSON.parse(JSON.stringify(state.board))

      // Get the last move
      const lastMove = state.moveHistory[state.moveHistory.length - 1]

      // Clear the last move
      newBoard[lastMove.row][lastMove.col] = 0

      // Get the previous last move
      const previousMove = state.moveHistory.length > 1 ? state.moveHistory[state.moveHistory.length - 2] : null

      return {
        ...state,
        board: newBoard,
        currentPlayer: state.currentPlayer === 1 ? 2 : 1,
        lastMove: previousMove,
        winner: null,
        isDraw: false,
        moveHistory: state.moveHistory.slice(0, -1),
      }
    }

    case "LOAD_GAME":
      return action.state

    default:
      return state
  }
}

// Helper functions
function isBoardFull(board: Board): boolean {
  return board[0].every((cell) => cell !== 0)
}

function checkWin(board: Board, row: number, col: number): boolean {
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
