"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { useSimulatedGame } from "@/lib/mock-socket-service"
import { Disc, Copy, MessageSquare, Send, ArrowLeft, Share2 } from "lucide-react"
import { OnlineGameBoard } from "@/components/online-game-board"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function MultiplayerGame() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [playerName, setPlayerName] = useState("")
  const [gameIdInput, setGameIdInput] = useState("")
  const [chatInput, setChatInput] = useState("")
  const [showChat, setShowChat] = useState(false)

  const {
    connected,
    gameState,
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
  } = useSimulatedGame()

  // Check for gameId in URL
  useEffect(() => {
    const gameId = searchParams.get("gameId")
    if (gameId) {
      setGameIdInput(gameId)
    }
  }, [searchParams])

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      })
    }
  }, [error, toast])

  // Handle game creation
  const handleCreateGame = () => {
    if (!playerName.trim()) {
      toast({
        title: "Enter your name",
        description: "Please enter your name to create a game",
        variant: "destructive",
      })
      return
    }
    createGame(playerName)
  }

  // Handle joining a game
  const handleJoinGame = () => {
    if (!playerName.trim()) {
      toast({
        title: "Enter your name",
        description: "Please enter your name to join a game",
        variant: "destructive",
      })
      return
    }
    if (!gameIdInput.trim()) {
      toast({
        title: "Enter game ID",
        description: "Please enter a game ID to join",
        variant: "destructive",
      })
      return
    }
    joinGame(gameIdInput, playerName)
  }

  // Handle column click
  const handleColumnClick = (column: number) => {
    if (!isMyTurn()) {
      toast({
        title: "Not your turn",
        description: "Please wait for your turn",
      })
      return
    }
    makeMove(column)
  }

  // Copy game link to clipboard
  const copyGameLink = () => {
    const link = getShareableLink()
    navigator.clipboard.writeText(link)
    toast({
      title: "Link copied",
      description: "Game link copied to clipboard",
    })
  }

  // Send chat message
  const handleSendMessage = () => {
    if (!chatInput.trim()) return
    sendChatMessage(chatInput)
    setChatInput("")
  }

  // Get opponent name
  const getOpponentName = () => {
    if (!gameState || !getPlayerInfo()) return "Waiting for opponent..."

    const myInfo = getPlayerInfo()
    const opponent = Object.values(gameState.players).find((player) => player.playerNumber !== myInfo?.playerNumber)

    return opponent ? opponent.name : "Waiting for opponent..."
  }

  // Return to home
  const handleBackToHome = () => {
    if (gameState) {
      leaveGame()
    }
    router.push("/")
  }

  // Render game lobby if not in a game
  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
        <Button variant="outline" className="absolute top-4 left-4" onClick={handleBackToHome}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <h1 className="text-4xl font-bold mb-8 text-slate-800 dark:text-slate-100">Connect Four Online</h1>

        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Play Online</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="playerName">Your Name</Label>
                <Input
                  id="playerName"
                  placeholder="Enter your name"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </div>

              <Tabs defaultValue={gameIdInput ? "join" : "create"}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="create">Create Game</TabsTrigger>
                  <TabsTrigger value="join">Join Game</TabsTrigger>
                </TabsList>

                <TabsContent value="create" className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Create a new game and play against a simulated opponent.
                  </p>
                  <Button className="w-full" onClick={handleCreateGame} disabled={!connected}>
                    Create Game
                  </Button>
                </TabsContent>

                <TabsContent value="join" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gameId">Game ID</Label>
                    <Input
                      id="gameId"
                      placeholder="Enter game ID"
                      value={gameIdInput}
                      onChange={(e) => setGameIdInput(e.target.value)}
                    />
                  </div>
                  <Button className="w-full" onClick={handleJoinGame} disabled={!connected}>
                    Join Game
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="text-center text-sm">
                <span className="text-green-500">Ready to play</span>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md dark:bg-yellow-900/20 dark:border-yellow-800">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Note:</strong> This is a simulated online experience. In a real implementation, you would
                  connect to a WebSocket server.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render game board when in a game
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={handleBackToHome}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Leave Game
          </Button>

          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Connect Four Online</h1>

          <Button variant="outline" onClick={copyGameLink}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Game
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white shadow-xl rounded-xl border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
              <CardContent className="p-6">
                <div className="mb-6 flex justify-between items-center">
                  <div
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      gameState.currentPlayer === 1
                        ? "bg-yellow-100 dark:bg-yellow-900"
                        : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    <div className="relative">
                      <Disc
                        className={`h-6 w-6 ${gameState.currentPlayer === 1 ? "text-yellow-500" : "text-slate-300"}`}
                      />
                    </div>
                    <span
                      className={`font-medium text-lg ${
                        gameState.currentPlayer === 1
                          ? "text-slate-800 dark:text-yellow-200"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {getPlayerInfo()?.playerNumber === 1 ? "You" : getOpponentName()}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <div className="px-4 py-2 bg-slate-100 rounded-md dark:bg-slate-800">
                      <span className="text-sm font-medium">Game ID: </span>
                      <span className="font-mono">{gameState.gameId}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-1"
                        onClick={() => {
                          navigator.clipboard.writeText(gameState.gameId)
                          toast({ title: "Copied", description: "Game ID copied to clipboard" })
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      gameState.currentPlayer === 2 ? "bg-red-100 dark:bg-red-900" : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    <span
                      className={`font-medium text-lg ${
                        gameState.currentPlayer === 2
                          ? "text-slate-800 dark:text-red-200"
                          : "text-slate-400 dark:text-slate-500"
                      }`}
                    >
                      {getPlayerInfo()?.playerNumber === 2 ? "You" : getOpponentName()}
                    </span>
                    <div className="relative">
                      <Disc
                        className={`h-6 w-6 ${gameState.currentPlayer === 2 ? "text-red-500" : "text-slate-300"}`}
                      />
                    </div>
                  </div>
                </div>

                <OnlineGameBoard
                  board={gameState.board}
                  onColumnClick={handleColumnClick}
                  isMyTurn={isMyTurn()}
                  lastMove={gameState.lastMove}
                  winner={gameState.winner}
                  isDraw={gameState.isDraw}
                  myPlayerNumber={getPlayerInfo()?.playerNumber || 1}
                />

                {(gameState.winner || gameState.isDraw) && (
                  <div className="mt-4 p-3 bg-slate-100 rounded-md text-center dark:bg-slate-800">
                    {gameState.winner ? (
                      <span className="font-medium dark:text-white">
                        {gameState.winner === getPlayerInfo()?.playerNumber ? "You won!" : `${getOpponentName()} won!`}
                      </span>
                    ) : (
                      <span className="font-medium dark:text-white">It's a draw!</span>
                    )}
                  </div>
                )}

                {!gameState.winner && !gameState.isDraw && (
                  <div className="mt-4 p-3 bg-slate-100 rounded-md text-center dark:bg-slate-800">
                    <span className="dark:text-white">
                      {isMyTurn() ? "Your turn" : `Waiting for ${getOpponentName()}`}
                    </span>
                  </div>
                )}

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md dark:bg-yellow-900/20 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    <strong>Simulation:</strong> This is a simulated online game against an AI opponent. In a real
                    implementation, you would be playing against another person.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-white shadow-xl rounded-xl border border-slate-200 h-full dark:bg-slate-900 dark:border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>Chat</span>
                  <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setShowChat(!showChat)}>
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </CardTitle>
              </CardHeader>

              <CardContent className={`p-4 ${showChat ? "block" : "hidden lg:block"}`}>
                <div className="flex flex-col h-[400px]">
                  <ScrollArea className="flex-1 mb-4 p-2 border rounded-md">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-muted-foreground py-4">No messages yet. Say hello!</div>
                    ) : (
                      <div className="space-y-4">
                        {chatMessages.map((msg, i) => (
                          <div key={i} className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{msg.sender}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm">{msg.text}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage()
                      }}
                    />
                    <Button size="icon" onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
