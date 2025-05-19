// Check if a player has won
export function checkWinner(board: number[][], player: number): boolean {
  const rows = board.length
  const cols = board[0].length

  // Check horizontal
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col <= cols - 4; col++) {
      if (
        board[row][col] === player &&
        board[row][col + 1] === player &&
        board[row][col + 2] === player &&
        board[row][col + 3] === player
      ) {
        return true
      }
    }
  }

  // Check vertical
  for (let row = 0; row <= rows - 4; row++) {
    for (let col = 0; col < cols; col++) {
      if (
        board[row][col] === player &&
        board[row + 1][col] === player &&
        board[row + 2][col] === player &&
        board[row + 3][col] === player
      ) {
        return true
      }
    }
  }

  // Check diagonal (down-right)
  for (let row = 0; row <= rows - 4; row++) {
    for (let col = 0; col <= cols - 4; col++) {
      if (
        board[row][col] === player &&
        board[row + 1][col + 1] === player &&
        board[row + 2][col + 2] === player &&
        board[row + 3][col + 3] === player
      ) {
        return true
      }
    }
  }

  // Check diagonal (up-right)
  for (let row = 3; row < rows; row++) {
    for (let col = 0; col <= cols - 4; col++) {
      if (
        board[row][col] === player &&
        board[row - 1][col + 1] === player &&
        board[row - 2][col + 2] === player &&
        board[row - 3][col + 3] === player
      ) {
        return true
      }
    }
  }

  return false
}

// AI move logic
export function getAIMove(board: number[][]): { row: number; col: number } | null {
  const rows = board.length
  const cols = board[0].length

  // First, check if AI can win in the next move
  const winningMove = findWinningMove(board, 2)
  if (winningMove) return winningMove

  // Then, block player from winning
  const blockingMove = findWinningMove(board, 1)
  if (blockingMove) return blockingMove

  // Try to play in the center column if possible
  const centerCol = 3
  if (board[0][centerCol] === 0) {
    for (let row = rows - 1; row >= 0; row--) {
      if (board[row][centerCol] === 0) {
        return { row, col: centerCol }
      }
    }
  }

  // Otherwise, make a strategic move
  // Prioritize columns that are closer to the center
  const colPriority = [3, 2, 4, 1, 5, 0, 6]

  for (const col of colPriority) {
    if (board[0][col] === 0) {
      // Check if column is not full
      for (let row = rows - 1; row >= 0; row--) {
        if (board[row][col] === 0) {
          return { row, col }
        }
      }
    }
  }

  // If no move found (shouldn't happen unless board is full)
  return null
}

// Helper function to find a winning move for a player
function findWinningMove(board: number[][], player: number): { row: number; col: number } | null {
  const rows = board.length
  const cols = board[0].length

  // Try each column
  for (let col = 0; col < cols; col++) {
    // Skip if column is full
    if (board[0][col] !== 0) continue

    // Find the row where a piece would land
    let row = -1
    for (let r = rows - 1; r >= 0; r--) {
      if (board[r][col] === 0) {
        row = r
        break
      }
    }

    // If column is full, skip
    if (row === -1) continue

    // Try placing a piece and check if it's a win
    const newBoard = board.map((r) => [...r])
    newBoard[row][col] = player

    if (checkWinner(newBoard, player)) {
      return { row, col }
    }
  }

  return null
}
