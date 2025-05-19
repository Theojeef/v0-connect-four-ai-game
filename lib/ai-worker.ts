// Web Worker for AI calculations
// This file will be used as a Web Worker to run AI calculations in a separate thread

// Define the input and output message types
type AIWorkerInput = {
  board: number[][]
  difficulty: "easy" | "medium" | "hard"
  player: 1 | 2
  requestId: string
}

type AIWorkerOutput = {
  column: number
  thoughts: Array<{
    column: number
    score: number
    reason: string
    depth: number
    evaluations?: number
  }>
  requestId: string
  timeElapsed: number
}

// Configuration for different difficulty levels
const DIFFICULTY_CONFIG = {
  easy: { depth: 2, randomFactor: 0.4, useOpeningBook: false },
  medium: { depth: 4, randomFactor: 0.2, useOpeningBook: true },
  hard: { depth: 6, randomFactor: 0, useOpeningBook: true },
}

// Opening book for common strong first moves
const OPENING_BOOK = {
  empty: [3], // Center column is strongest first move
  firstMove: [2, 3, 4], // Good responses to center column
}

// Listen for messages from the main thread
self.addEventListener("message", (event) => {
  const startTime = performance.now()
  const { board, difficulty, player, requestId } = event.data as AIWorkerInput

  // Calculate the AI move
  const result = getAIMove(board, difficulty, player)

  // Send the result back to the main thread
  const timeElapsed = performance.now() - startTime
  self.postMessage({
    ...result,
    requestId,
    timeElapsed,
  } as AIWorkerOutput)
})

// Main function to get AI move
function getAIMove(
  board: number[][],
  difficulty: "easy" | "medium" | "hard",
  player: 1 | 2 = 2,
): { column: number; thoughts: any[] } {
  const config = DIFFICULTY_CONFIG[difficulty]
  const thoughts: any[] = []

  // Check if we can use opening book
  if (config.useOpeningBook) {
    const openingMove = getOpeningBookMove(board, player)
    if (openingMove !== -1) {
      thoughts.push({
        column: openingMove,
        score: 1000,
        reason: "Opening book move",
        depth: 0,
        evaluations: 1,
      })
      return { column: openingMove, thoughts }
    }
  }

  // For each possible move, run minimax
  for (let col = 0; col < 7; col++) {
    if (board[0][col] !== 0) continue

    // Find row where piece would land
    let row = -1
    for (let r = 5; r >= 0; r--) {
      if (board[r][col] === 0) {
        row = r
        break
      }
    }

    if (row === -1) continue

    // Create a copy of the board and make the move
    const newBoard = JSON.parse(JSON.stringify(board))
    newBoard[row][col] = player

    // Check for immediate win
    if (checkWin(newBoard, row, col, player)) {
      thoughts.push({
        column: col,
        score: 1000,
        reason: "Winning move",
        depth: 0,
        evaluations: 1,
      })
      return { column: col, thoughts }
    }

    // Run minimax algorithm
    const evaluationCounter = { count: 0 }
    const score = minimax(
      newBoard,
      config.depth,
      Number.NEGATIVE_INFINITY,
      Number.POSITIVE_INFINITY,
      false,
      player,
      player === 1 ? 2 : 1,
      evaluationCounter,
    )

    let reason = "Evaluated position"
    if (score > 900) reason = "Winning move detected"
    else if (score > 500) reason = "Very strong position"
    else if (score > 100) reason = "Good position"
    else if (score < -900) reason = "Opponent win detected"
    else if (score < -500) reason = "Dangerous position"
    else if (score === 0) reason = "Neutral position"

    thoughts.push({
      column: col,
      score,
      reason,
      depth: config.depth,
      evaluations: evaluationCounter.count,
    })
  }

  // Sort thoughts by score
  thoughts.sort((a, b) => b.score - a.score)

  // Choose the best move, or occasionally a random move based on difficulty
  if (thoughts.length === 0) return { column: -1, thoughts }

  if (Math.random() < config.randomFactor) {
    // Choose a random move for variety at easier levels
    const randomIndex = Math.floor(Math.random() * thoughts.length)
    return { column: thoughts[randomIndex].column, thoughts }
  } else {
    // Choose the best move
    return { column: thoughts[0].column, thoughts }
  }
}

// Get a move from the opening book if applicable
function getOpeningBookMove(board: number[][], player: 1 | 2): number {
  // Check if board is empty (first move)
  const isEmpty = board.every((row) => row.every((cell) => cell === 0))
  if (isEmpty) {
    return OPENING_BOOK.empty[0] // Return center column
  }

  // Check if this is the second move
  let pieceCount = 0
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 7; c++) {
      if (board[r][c] !== 0) pieceCount++
    }
  }

  if (pieceCount === 1) {
    // If opponent played center, choose a good response
    if (board[5][3] !== 0) {
      const goodResponses = OPENING_BOOK.firstMove
      return goodResponses[Math.floor(Math.random() * goodResponses.length)]
    }
  }

  return -1 // No opening book move available
}

// Minimax algorithm with alpha-beta pruning
function minimax(
  board: number[][],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  aiPlayer: 1 | 2,
  currentPlayer: 1 | 2,
  evaluationCounter: { count: number },
): number {
  // Base case: terminal state or maximum depth reached
  if (depth === 0 || isTerminal(board)) {
    evaluationCounter.count++
    return evaluateBoard(board, aiPlayer)
  }

  // Column ordering for better alpha-beta pruning
  // Check center columns first, then move outward
  const columnOrder = [3, 2, 4, 1, 5, 0, 6]

  // Maximizing player (AI)
  if (isMaximizing) {
    let maxEval = Number.NEGATIVE_INFINITY

    // Try each column in the optimized order
    for (const col of columnOrder) {
      if (board[0][col] !== 0) continue

      // Find row where piece would land
      let row = -1
      for (let r = 5; r >= 0; r--) {
        if (board[r][col] === 0) {
          row = r
          break
        }
      }

      if (row === -1) continue

      // Make move
      const newBoard = JSON.parse(JSON.stringify(board))
      newBoard[row][col] = currentPlayer

      // Check for win
      if (checkWin(newBoard, row, col, currentPlayer)) {
        return 1000 * (depth + 1) // Prefer quicker wins
      }

      // Recursive minimax call
      const evalScore = minimax(
        newBoard,
        depth - 1,
        alpha,
        beta,
        false,
        aiPlayer,
        currentPlayer === 1 ? 2 : 1,
        evaluationCounter,
      )

      maxEval = Math.max(maxEval, evalScore)
      alpha = Math.max(alpha, evalScore)

      // Alpha-beta pruning
      if (beta <= alpha) break
    }

    return maxEval
  }
  // Minimizing player (opponent)
  else {
    let minEval = Number.POSITIVE_INFINITY

    // Try each column in the optimized order
    for (const col of columnOrder) {
      if (board[0][col] !== 0) continue

      // Find row where piece would land
      let row = -1
      for (let r = 5; r >= 0; r--) {
        if (board[r][col] === 0) {
          row = r
          break
        }
      }

      if (row === -1) continue

      // Make move
      const newBoard = JSON.parse(JSON.stringify(board))
      newBoard[row][col] = currentPlayer

      // Check for win
      if (checkWin(newBoard, row, col, currentPlayer)) {
        return -1000 * (depth + 1) // Prefer blocking quicker losses
      }

      // Recursive minimax call
      const evalScore = minimax(
        newBoard,
        depth - 1,
        alpha,
        beta,
        true,
        aiPlayer,
        currentPlayer === 1 ? 2 : 1,
        evaluationCounter,
      )

      minEval = Math.min(minEval, evalScore)
      beta = Math.min(beta, evalScore)

      // Alpha-beta pruning
      if (beta <= alpha) break
    }

    return minEval
  }
}

// Enhanced board evaluation function
function evaluateBoard(board: number[][], player: 1 | 2): number {
  let score = 0
  const opponent = player === 1 ? 2 : 1

  // Center column control is valuable
  for (let r = 0; r < 6; r++) {
    if (board[r][3] === player) score += 3
    else if (board[r][3] === opponent) score -= 3
  }

  // Evaluate all possible windows of 4
  // Horizontal windows
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 4; c++) {
      score += evaluateWindow([board[r][c], board[r][c + 1], board[r][c + 2], board[r][c + 3]], player)
    }
  }

  // Vertical windows
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 7; c++) {
      score += evaluateWindow([board[r][c], board[r + 1][c], board[r + 2][c], board[r + 3][c]], player)
    }
  }

  // Diagonal windows (positive slope)
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      score += evaluateWindow([board[r][c], board[r + 1][c + 1], board[r + 2][c + 2], board[r + 3][c + 3]], player)
    }
  }

  // Diagonal windows (negative slope)
  for (let r = 3; r < 6; r++) {
    for (let c = 0; c < 4; c++) {
      score += evaluateWindow([board[r][c], board[r - 1][c + 1], board[r - 2][c + 2], board[r - 3][c + 3]], player)
    }
  }

  // Evaluate control of key positions
  score += evaluateKeyPositions(board, player)

  return score
}

// Evaluate a window of 4 cells with improved scoring
function evaluateWindow(window: number[], player: 1 | 2): number {
  const opponent = player === 1 ? 2 : 1

  const playerCount = window.filter((cell) => cell === player).length
  const opponentCount = window.filter((cell) => cell === opponent).length
  const emptyCount = window.filter((cell) => cell === 0).length

  // If both players have pieces in the window, it can't be completed by either
  if (playerCount > 0 && opponentCount > 0) return 0

  // Score based on how many pieces and how many empty spaces
  if (playerCount === 4) return 100 // Connected four - highest score
  if (playerCount === 3 && emptyCount === 1) return 5 // Three in a row with an empty space
  if (playerCount === 2 && emptyCount === 2) return 2 // Two in a row with two empty spaces
  if (playerCount === 1 && emptyCount === 3) return 1 // One piece with three empty spaces

  // Opponent threats
  if (opponentCount === 3 && emptyCount === 1) return -10 // Opponent three in a row - critical to block
  if (opponentCount === 2 && emptyCount === 2) return -2 // Opponent two in a row - potential threat

  return 0
}

// Evaluate control of strategically important positions
function evaluateKeyPositions(board: number[][], player: 1 | 2): number {
  let score = 0
  const opponent = player === 1 ? 2 : 1

  // Bottom row is valuable for building
  for (let c = 0; c < 7; c++) {
    if (board[5][c] === player) score += 2
  }

  // Control of positions that enable multiple winning directions
  // These are typically positions that allow horizontal, vertical, and diagonal wins
  const keyPositions = [
    [2, 0],
    [2, 6], // Bottom corners of middle section
    [2, 1],
    [2, 5], // Near corners in middle section
    [2, 2],
    [2, 3],
    [2, 4], // Middle section center
    [3, 1],
    [3, 2],
    [3, 3],
    [3, 4],
    [3, 5], // Upper middle section
  ]

  for (const [r, c] of keyPositions) {
    if (board[r][c] === player) score += 2
    else if (board[r][c] === opponent) score -= 2
  }

  return score
}

// Check if the board state is terminal (win or full)
function isTerminal(board: number[][]): boolean {
  // Check if board is full
  if (board[0].every((cell) => cell !== 0)) return true

  // Check for win
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 7; c++) {
      if (board[r][c] !== 0) {
        if (checkWin(board, r, c, board[r][c])) {
          return true
        }
      }
    }
  }

  return false
}

// Optimized win checking function
function checkWin(board: number[][], row: number, col: number, player: 1 | 2): boolean {
  const directions = [
    [0, 1], // horizontal
    [1, 0], // vertical
    [1, 1], // diagonal down-right
    [1, -1], // diagonal down-left
  ]

  for (const [dr, dc] of directions) {
    let count = 1 // Start with 1 for the piece just placed

    // Check in positive direction
    for (let i = 1; i <= 3; i++) {
      const r = row + dr * i
      const c = col + dc * i
      if (r < 0 || r >= 6 || c < 0 || c >= 7 || board[r][c] !== player) break
      count++
    }

    // Check in negative direction
    for (let i = 1; i <= 3; i++) {
      const r = row - dr * i
      const c = col - dc * i
      if (r < 0 || r >= 6 || c < 0 || c >= 7 || board[r][c] !== player) break
      count++
    }

    if (count >= 4) return true
  }

  return false
}
