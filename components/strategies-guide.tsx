import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Info, AlertTriangle, Lightbulb, Target, Shield, Zap, BookOpen, Award } from "lucide-react"

export function StrategiesGuide() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="basics">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="openings">Openings</TabsTrigger>
          <TabsTrigger value="tactics">Tactics</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Connect Four Fundamentals
              </CardTitle>
              <CardDescription>Master these basic principles to improve your Connect Four strategy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">The Objective</h3>
                <p className="text-sm text-muted-foreground">
                  Connect Four is a two-player connection game where players take turns dropping colored discs into a
                  vertical grid. The objective is to be the first to form a horizontal, vertical, or diagonal line of
                  four of your own discs.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-red-500" />
                  Control the Center
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  The center column is the most valuable position on the board. Pieces in the center can be part of more
                  possible winning combinations than pieces on the edges.
                </p>
                <div className="grid grid-cols-7 gap-1 max-w-xs mx-auto my-4 bg-blue-100 p-2 rounded-md dark:bg-blue-950">
                  {Array(7)
                    .fill(0)
                    .map((_, col) => (
                      <div
                        key={col}
                        className={`h-8 flex items-center justify-center rounded ${
                          col === 3
                            ? "bg-green-200 border border-green-400 dark:bg-green-900 dark:border-green-700"
                            : col === 2 || col === 4
                              ? "bg-green-100 border border-green-300 dark:bg-green-950 dark:border-green-800"
                              : "bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700"
                        }`}
                      >
                        <span className="text-xs font-medium">
                          {col === 3 ? "Best" : col === 2 || col === 4 ? "Good" : ""}
                        </span>
                      </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Column value: center is most valuable, followed by adjacent columns
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Create Threats
                </h3>
                <p className="text-sm text-muted-foreground">
                  A threat is a situation where you can potentially create a line of four on your next move. Creating
                  multiple threats simultaneously forces your opponent to block one threat while you can win with the
                  other.
                </p>
                <Alert className="mt-2 bg-yellow-50 dark:bg-yellow-950/30">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertTitle>Key Insight</AlertTitle>
                  <AlertDescription className="text-sm">
                    When you have two threats in different columns, your opponent can only block one at a time, giving
                    you a guaranteed win.
                  </AlertDescription>
                </Alert>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  Defensive Play
                </h3>
                <p className="text-sm text-muted-foreground">
                  Always check if your opponent is one move away from connecting four. Blocking their potential wins
                  should be your priority unless you have a winning move yourself.
                </p>
                <div className="flex flex-col gap-2 mt-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">
                      Priority 1
                    </Badge>
                    <span className="text-sm">Look for your own winning move</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300"
                    >
                      Priority 2
                    </Badge>
                    <span className="text-sm">Block opponent's winning move</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                    >
                      Priority 3
                    </Badge>
                    <span className="text-sm">Create your own threats</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                    >
                      Priority 4
                    </Badge>
                    <span className="text-sm">Control the center</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Think Ahead
                </h3>
                <p className="text-sm text-muted-foreground">
                  Always think several moves ahead. Consider not just your next move, but how your opponent might
                  respond, and what options that will leave you with.
                </p>
                <Alert className="mt-2">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Tip</AlertTitle>
                  <AlertDescription className="text-sm">
                    Before making a move, ask yourself: "If I place my piece here, where will my opponent play next, and
                    what will my options be after that?"
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="openings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Opening Strategies
              </CardTitle>
              <CardDescription>The first few moves set the tone for the entire game</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">First Move</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  The player who goes first has a slight advantage. The strongest first move is to play in the center
                  column (column 4).
                </p>
                <div className="grid grid-cols-7 gap-1 max-w-xs mx-auto my-4 bg-blue-100 p-2 rounded-md dark:bg-blue-950">
                  {Array(7)
                    .fill(0)
                    .map((_, col) => (
                      <div
                        key={col}
                        className={`h-8 flex items-center justify-center rounded ${
                          col === 3
                            ? "bg-yellow-400 border border-yellow-500"
                            : "bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700"
                        }`}
                      >
                        {col === 3 && <span className="text-xs font-medium">1</span>}
                      </div>
                    ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Responding to Center</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  If your opponent plays in the center column first, your best responses are columns 3 or 5 (adjacent to
                  center).
                </p>
                <div className="grid grid-cols-7 gap-1 max-w-xs mx-auto my-4 bg-blue-100 p-2 rounded-md dark:bg-blue-950">
                  {Array(7)
                    .fill(0)
                    .map((_, col) => (
                      <div
                        key={col}
                        className={`h-8 flex items-center justify-center rounded ${
                          col === 3
                            ? "bg-red-400 border border-red-500"
                            : col === 2 || col === 4
                              ? "bg-yellow-400 border border-yellow-500"
                              : "bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700"
                        }`}
                      >
                        {col === 3 ? (
                          <span className="text-xs font-medium">1</span>
                        ) : col === 2 || col === 4 ? (
                          <span className="text-xs font-medium">2?</span>
                        ) : (
                          ""
                        )}
                      </div>
                    ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Common Opening Sequences</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-1">Center Drop Opening</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Player 1 plays center, Player 2 plays adjacent, Player 1 plays another adjacent column
                    </p>
                    <div className="grid grid-cols-7 gap-1 max-w-xs mx-auto bg-blue-100 p-2 rounded-md dark:bg-blue-950">
                      {Array(7)
                        .fill(0)
                        .map((_, col) => (
                          <div
                            key={col}
                            className={`h-8 flex items-center justify-center rounded ${
                              col === 3
                                ? "bg-yellow-400 border border-yellow-500"
                                : col === 2
                                  ? "bg-red-400 border border-red-500"
                                  : col === 4
                                    ? "bg-yellow-400 border border-yellow-500"
                                    : "bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700"
                            }`}
                          >
                            {col === 3 ? (
                              <span className="text-xs font-medium">1</span>
                            ) : col === 2 ? (
                              <span className="text-xs font-medium">2</span>
                            ) : col === 4 ? (
                              <span className="text-xs font-medium">3</span>
                            ) : (
                              ""
                            )}
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-sm mb-1">Edge Opening</h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      Player 1 plays on edge, Player 2 plays center, Player 1 plays adjacent to first move
                    </p>
                    <div className="grid grid-cols-7 gap-1 max-w-xs mx-auto bg-blue-100 p-2 rounded-md dark:bg-blue-950">
                      {Array(7)
                        .fill(0)
                        .map((_, col) => (
                          <div
                            key={col}
                            className={`h-8 flex items-center justify-center rounded ${
                              col === 0
                                ? "bg-yellow-400 border border-yellow-500"
                                : col === 3
                                  ? "bg-red-400 border border-red-500"
                                  : col === 1
                                    ? "bg-yellow-400 border border-yellow-500"
                                    : "bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700"
                            }`}
                          >
                            {col === 0 ? (
                              <span className="text-xs font-medium">1</span>
                            ) : col === 3 ? (
                              <span className="text-xs font-medium">2</span>
                            ) : col === 1 ? (
                              <span className="text-xs font-medium">3</span>
                            ) : (
                              ""
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Opening Principles</h3>
                <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                  <li>Avoid playing in columns 1 and 7 (edges) in the early game unless you have a specific plan</li>
                  <li>Try to control the center and columns adjacent to center</li>
                  <li>Be careful not to create opportunities for your opponent to stack pieces advantageously</li>
                  <li>
                    Watch out for the "trap setup" where your opponent can force you to play in a column that gives them
                    a win
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tactics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-500" />
                Tactical Patterns
              </CardTitle>
              <CardDescription>Recognize and use these common patterns to gain an advantage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <Badge className="bg-red-500">Critical</Badge>
                  The "Seven-Four" Trap
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  This is one of the most powerful tactics in Connect Four. By creating a situation where you have two
                  threats in columns that are three apart (like columns 1 and 4, or 4 and 7), you force a win.
                </p>
                <div className="grid grid-cols-7 gap-1 max-w-xs mx-auto bg-blue-100 p-2 rounded-md dark:bg-blue-950">
                  <div className="col-span-7 h-8 flex items-center justify-center text-xs font-medium mb-1">
                    Before the trap
                  </div>
                  {Array(7)
                    .fill(0)
                    .map((_, col) => (
                      <div
                        key={`before-${col}`}
                        className={`h-8 flex items-center justify-center rounded ${
                          col === 0 || col === 3
                            ? "bg-yellow-200 border border-yellow-300 dark:bg-yellow-900 dark:border-yellow-800"
                            : "bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700"
                        }`}
                      >
                        {col === 0 || col === 3 ? "?" : ""}
                      </div>
                    ))}
                  <div className="col-span-7 h-8 flex items-center justify-center text-xs font-medium mt-2 mb-1">
                    After your move
                  </div>
                  {Array(7)
                    .fill(0)
                    .map((_, col) => (
                      <div
                        key={`after-${col}`}
                        className={`h-8 flex items-center justify-center rounded ${
                          col === 0
                            ? "bg-yellow-400 border border-yellow-500"
                            : col === 3
                              ? "bg-yellow-200 border border-yellow-300 dark:bg-yellow-900 dark:border-yellow-800"
                              : "bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700"
                        }`}
                      >
                        {col === 0 ? "1" : col === 3 ? "?" : ""}
                      </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  No matter where your opponent plays, you can win on your next move
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <Badge className="bg-orange-500">Important</Badge>
                  The "Connect Three" Setup
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Creating a horizontal line of three of your pieces with open spaces on both ends creates a guaranteed
                  win (if both ends are playable).
                </p>
                <div className="grid grid-cols-7 gap-1 max-w-xs mx-auto bg-blue-100 p-2 rounded-md dark:bg-blue-950">
                  {Array(7)
                    .fill(0)
                    .map((_, col) => (
                      <div
                        key={col}
                        className={`h-8 flex items-center justify-center rounded ${
                          col >= 2 && col <= 4
                            ? "bg-yellow-400 border border-yellow-500"
                            : col === 1 || col === 5
                              ? "bg-green-200 border border-green-300 dark:bg-green-900 dark:border-green-700"
                              : "bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700"
                        }`}
                      >
                        {col >= 2 && col <= 4 ? "Y" : col === 1 || col === 5 ? "Win" : ""}
                      </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Three in a row with both ends open is a guaranteed win
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center gap-2">
                  <Badge className="bg-yellow-500">Useful</Badge>
                  The "Diagonal Threat"
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Diagonal threats are harder to spot and therefore more dangerous. Look for opportunities to create
                  diagonal connections, and be vigilant about blocking your opponent's diagonal threats.
                </p>
                <div className="grid grid-cols-7 gap-1 max-w-xs mx-auto bg-blue-100 p-2 rounded-md dark:bg-blue-950">
                  <div className="col-span-7 grid grid-cols-7 gap-1">
                    {Array(7)
                      .fill(0)
                      .map((_, col) => (
                        <div
                          key={`row1-${col}`}
                          className="h-8 flex items-center justify-center rounded bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700"
                        ></div>
                      ))}
                  </div>
                  <div className="col-span-7 grid grid-cols-7 gap-1">
                    {Array(7)
                      .fill(0)
                      .map((_, col) => (
                        <div
                          key={`row2-${col}`}
                          className={`h-8 flex items-center justify-center rounded ${
                            col === 3
                              ? "bg-yellow-400 border border-yellow-500"
                              : "bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700"
                          }`}
                        >
                          {col === 3 ? "Y" : ""}
                        </div>
                      ))}
                  </div>
                  <div className="col-span-7 grid grid-cols-7 gap-1">
                    {Array(7)
                      .fill(0)
                      .map((_, col) => (
                        <div
                          key={`row3-${col}`}
                          className={`h-8 flex items-center justify-center rounded ${
                            col === 2
                              ? "bg-yellow-400 border border-yellow-500"
                              : "bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700"
                          }`}
                        >
                          {col === 2 ? "Y" : ""}
                        </div>
                      ))}
                  </div>
                  <div className="col-span-7 grid grid-cols-7 gap-1">
                    {Array(7)
                      .fill(0)
                      .map((_, col) => (
                        <div
                          key={`row4-${col}`}
                          className={`h-8 flex items-center justify-center rounded ${
                            col === 1
                              ? "bg-yellow-400 border border-yellow-500"
                              : col === 4
                                ? "bg-green-200 border border-green-300 dark:bg-green-900 dark:border-green-700"
                                : "bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700"
                          }`}
                        >
                          {col === 1 ? "Y" : col === 4 ? "Win" : ""}
                        </div>
                      ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Diagonal threats can be harder to spot but are just as powerful
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Forcing Moves</h3>
                <p className="text-sm text-muted-foreground">
                  A forcing move is one that your opponent must respond to in a specific way, usually to block a threat.
                  By making forcing moves, you can predict your opponent's responses and plan several moves ahead.
                </p>
                <Alert className="mt-3 bg-blue-50 dark:bg-blue-950/30">
                  <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertTitle>Strategy Tip</AlertTitle>
                  <AlertDescription className="text-sm">
                    If you can create a sequence of forcing moves that leads to a winning position, your opponent cannot
                    prevent your victory no matter what they do.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-500" />
                Advanced Strategies
              </CardTitle>
              <CardDescription>Master these concepts to play at a high level</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Threat Sequences</h3>
                <p className="text-sm text-muted-foreground">
                  A threat sequence is a series of moves where each move creates a new threat that must be blocked,
                  eventually leading to a position with multiple simultaneous threats.
                </p>
                <div className="p-3 bg-purple-50 rounded-md mt-3 dark:bg-purple-950/30">
                  <h4 className="font-medium text-sm mb-1 text-purple-800 dark:text-purple-300">Example Sequence</h4>
                  <ol className="list-decimal list-inside text-sm text-purple-700 dark:text-purple-300 space-y-1">
                    <li>Play a piece that threatens to complete a line</li>
                    <li>Opponent is forced to block</li>
                    <li>Play another threat in a different area</li>
                    <li>Opponent blocks again</li>
                    <li>Create a position with two threats simultaneously</li>
                    <li>Win on the next move</li>
                  </ol>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">The Even/Odd Strategy</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  In Connect Four, columns have an even or odd number of spaces. If both players play perfectly, the
                  first player can always win by controlling the odd-numbered columns.
                </p>
                <div className="grid grid-cols-7 gap-1 max-w-xs mx-auto bg-blue-100 p-2 rounded-md dark:bg-blue-950">
                  {Array(7)
                    .fill(0)
                    .map((_, col) => (
                      <div
                        key={col}
                        className={`h-8 flex items-center justify-center rounded ${
                          col % 2 === 0
                            ? "bg-yellow-200 border border-yellow-300 dark:bg-yellow-900 dark:border-yellow-800"
                            : "bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700"
                        }`}
                      >
                        {col + 1}
                      </div>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Highlighted columns (1, 3, 5, 7) are odd-numbered and can be strategically controlled
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Zugzwang</h3>
                <p className="text-sm text-muted-foreground">
                  Zugzwang is a situation where any move a player makes will worsen their position. Creating a zugzwang
                  for your opponent is a powerful advanced strategy.
                </p>
                <Alert className="mt-3 bg-amber-50 dark:bg-amber-950/30">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle>Advanced Concept</AlertTitle>
                  <AlertDescription className="text-sm">
                    Sometimes the best move is to force your opponent to play in a specific column that will set up your
                    winning move. This often involves creating a threat that must be blocked in a way that helps you.
                  </AlertDescription>
                </Alert>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Pattern Recognition</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Experienced players recognize common board patterns and know the optimal responses. Here are some key
                  patterns to learn:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-2 border rounded-md">
                    <h4 className="text-sm font-medium mb-1">The "Staircase"</h4>
                    <div className="grid grid-cols-4 gap-1 bg-blue-100 p-1 rounded-md dark:bg-blue-950">
                      <div className="h-6 bg-yellow-400 rounded border border-yellow-500"></div>
                      <div className="h-6 bg-white rounded border border-gray-200 dark:bg-slate-800 dark:border-slate-700"></div>
                      <div className="h-6 bg-white rounded border border-gray-200 dark:bg-slate-800 dark:border-slate-700"></div>
                      <div className="h-6 bg-white rounded border border-gray-200 dark:bg-slate-800 dark:border-slate-700"></div>

                      <div className="h-6 bg-yellow-400 rounded border border-yellow-500"></div>
                      <div className="h-6 bg-yellow-400 rounded border border-yellow-500"></div>
                      <div className="h-6 bg-white rounded border border-gray-200 dark:bg-slate-800 dark:border-slate-700"></div>
                      <div className="h-6 bg-white rounded border border-gray-200 dark:bg-slate-800 dark:border-slate-700"></div>

                      <div className="h-6 bg-red-500 rounded border border-red-600"></div>
                      <div className="h-6 bg-red-500 rounded border border-red-600"></div>
                      <div className="h-6 bg-red-500 rounded border border-red-600"></div>
                      <div className="h-6 bg-white rounded border border-gray-200 dark:bg-slate-800 dark:border-slate-700"></div>
                    </div>
                  </div>

                  <div className="p-2 border rounded-md">
                    <h4 className="text-sm font-medium mb-1">The "Triangle"</h4>
                    <div className="grid grid-cols-4 gap-1 bg-blue-100 p-1 rounded-md dark:bg-blue-950">
                      <div className="h-6 bg-white rounded border border-gray-200 dark:bg-slate-800 dark:border-slate-700"></div>
                      <div className="h-6 bg-white rounded border border-gray-200 dark:bg-slate-800 dark:border-slate-700"></div>
                      <div className="h-6 bg-white rounded border border-gray-200 dark:bg-slate-800 dark:border-slate-700"></div>
                      <div className="h-6 bg-yellow-400 rounded border border-yellow-500"></div>

                      <div className="h-6 bg-white rounded border border-gray-200 dark:bg-slate-800 dark:border-slate-700"></div>
                      <div className="h-6 bg-white rounded border border-gray-200 dark:bg-slate-800 dark:border-slate-700"></div>
                      <div className="h-6 bg-yellow-400 rounded border border-yellow-500"></div>
                      <div className="h-6 bg-red-500 rounded border border-red-600"></div>

                      <div className="h-6 bg-white rounded border border-gray-200 dark:bg-slate-800 dark:border-slate-700"></div>
                      <div className="h-6 bg-yellow-400 rounded border border-yellow-500"></div>
                      <div className="h-6 bg-red-500 rounded border border-red-600"></div>
                      <div className="h-6 bg-red-500 rounded border border-red-600"></div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Perfect Play</h3>
                <p className="text-sm text-muted-foreground">
                  Connect Four has been mathematically solved. With perfect play, the first player can always force a
                  win by starting in the middle column. However, the required strategy is extremely complex and beyond
                  human calculation in most cases.
                </p>
                <Alert className="mt-3">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Did You Know?</AlertTitle>
                  <AlertDescription className="text-sm">
                    Connect Four was first solved by James D. Allen in 1988, and independently verified by Victor Allis
                    in 1989. The solution requires the first player to start in the middle column to force a win.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
