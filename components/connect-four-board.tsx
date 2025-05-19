"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

interface ConnectFourBoardProps {
  board: number[][]
  onColumnClick: (col: number) => void
  isPlayerTurn: boolean
  isThinking: boolean
  lastMove: { row: number; col: number } | null
}

export default function ConnectFourBoard({
  board,
  onColumnClick,
  isPlayerTurn,
  isThinking,
  lastMove,
}: ConnectFourBoardProps) {
  const [hoverColumn, setHoverColumn] = useState<number | null>(null)

  return (
    <div
      className="bg-blue-600 p-6 rounded-xl shadow-inner border-4 border-blue-700"
      onMouseLeave={() => setHoverColumn(null)}
    >
      {/* Hover indicator */}
      {isPlayerTurn && hoverColumn !== null && (
        <div className="flex justify-center mb-4 relative h-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            className="w-12 h-12 rounded-full bg-yellow-400 absolute drop-shadow-md"
            style={{ left: `calc(${hoverColumn * 4}rem + 1rem)` }}
          />
        </div>
      )}

      {/* Board */}
      <div className="grid grid-cols-7 gap-3 relative">
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center relative overflow-hidden border-2 border-blue-800"
              onMouseEnter={() => setHoverColumn(colIndex)}
            >
              {cell > 0 && (
                <motion.div
                  initial={{ y: -rowIndex * 70 - 100 }}
                  animate={{ y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    delay: 0.05,
                  }}
                  className={`w-12 h-12 rounded-full ${
                    cell === 1 ? "bg-yellow-400 border-2 border-yellow-500" : "bg-red-500 border-2 border-red-600"
                  } ${
                    lastMove && lastMove.row === rowIndex && lastMove.col === colIndex
                      ? "ring-2 ring-white ring-opacity-70"
                      : ""
                  } shadow-inner`}
                />
              )}
              {cell === 0 && (
                <div className="w-12 h-12 rounded-full bg-blue-200 bg-opacity-20 border border-blue-600" />
              )}
            </div>
          )),
        )}

        {/* Column click areas */}
        {isPlayerTurn &&
          Array(7)
            .fill(0)
            .map((_, colIndex) => (
              <button
                key={`col-${colIndex}`}
                className="absolute top-0 w-16 h-full cursor-pointer hover:bg-blue-500 hover:bg-opacity-10 transition-colors"
                style={{ left: `${colIndex * 4.75}rem` }}
                onClick={() => onColumnClick(colIndex)}
                disabled={board[0][colIndex] !== 0 || !isPlayerTurn}
              />
            ))}

        {/* AI thinking indicator */}
        {isThinking && (
          <div className="absolute inset-0 flex items-center justify-center bg-blue-600 bg-opacity-40 rounded-xl">
            <Loader2 className="h-10 w-10 text-white animate-spin" />
          </div>
        )}
      </div>
    </div>
  )
}
