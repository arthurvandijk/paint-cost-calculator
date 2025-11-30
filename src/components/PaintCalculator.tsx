import { useState, useEffect } from "react"
import { Plus, Trash2, Home } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { ScrollArea } from "@/components/ui/scroll-area"

// Types
export type Paint = {
  id: string
  name: string
  code: string
  coverage?: number // m2 per liter
  price?: number // per m2
}

export type Wall = {
  id: string
  name: string
  length?: number // in meters
  height?: number // in meters
  paintId: string
}

export type Room = {
  id: string
  name: string
  walls: Wall[]
}


export function PaintCalculator() {
  // State
  const [paints, setPaints] = useState<Paint[]>(() => {
    const saved = localStorage.getItem("paints")
    return saved ? JSON.parse(saved) : []
  })

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem("rooms")
    return saved ? JSON.parse(saved) : []
  })

  // Persistence
  useEffect(() => {
    localStorage.setItem("paints", JSON.stringify(paints))
  }, [paints])

  useEffect(() => {
    localStorage.setItem("rooms", JSON.stringify(rooms))
  }, [rooms])

  // Handlers for Paints
  const addPaint = () => {
    const newPaint: Paint = {
      id: crypto.randomUUID(),
      name: "",
      code: "",
    }
    setPaints([...paints, newPaint])
  }

  const updatePaint = (id: string, field: keyof Paint, value: string | number) => {
    setPaints(paints.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  const deletePaint = (id: string) => {
    setPaints(paints.filter((p) => p.id !== id))
  }

  // Handlers for Rooms
  const addRoom = () => {
    const newRoom: Room = {
      id: crypto.randomUUID(),
      name: "New Room",
      walls: [],
    }
    setRooms([...rooms, newRoom])
  }

  const updateRoom = (id: string, field: keyof Room, value: string) => {
    setRooms(rooms.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  const deleteRoom = (id: string) => {
    setRooms(rooms.filter((r) => r.id !== id))
  }

  // Handlers for Walls
  const addWall = (roomId: string) => {
    setRooms(
      rooms.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            walls: [
              ...r.walls,
              {
                id: crypto.randomUUID(),
                name: "New Wall",
                paintId: "",
              }
            ],
          }
        }
        return r
      })
    )
  }

  const updateWall = (roomId: string, wallId: string, field: keyof Wall, value: string | number) => {
    setRooms(
      rooms.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            walls: r.walls.map((w) => (w.id === wallId ? { ...w, [field]: value } : w)),
          }
        }
        return r
      })
    )
  }

  const deleteWall = (roomId: string, wallId: string) => {
    setRooms(
      rooms.map((r) => {
        if (r.id === roomId) {
          return {
            ...r,
            walls: r.walls.filter((w) => w.id !== wallId),
          }
        }
        return r
      })
    )
  }

  // Calculations
  const calculateTotals = () => {
    const paintTotals: Record<string, { area: number; cost: number; liters: number }> = {}
    let grandTotalCost = 0

    rooms.forEach((room) => {
      room.walls.forEach((wall) => {
        const paint = paints.find((p) => p.id === wall.paintId)
        if (paint) {
          if (!paintTotals[paint.id]) {
            paintTotals[paint.id] = { area: 0, cost: 0, liters: 0 }
          }
          const area = wall.length! * wall.height!
          const cost = area * paint.price!
          const liters = area / paint.coverage!
          paintTotals[paint.id].area += area
          paintTotals[paint.id].cost += cost
          paintTotals[paint.id].liters += liters
          grandTotalCost += cost
        }
      })
    })

    return { paintTotals, grandTotalCost }
  }

  const { paintTotals, grandTotalCost } = calculateTotals()

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Paint Cost Calculator</h1>
      
      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-gray-200 p-1 rounded-lg">
          <TabsTrigger 
            value="calculator" 
            className="rounded-md px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-gray-800 data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-700 hover:bg-gray-300"
          >
            Calculator (Rooms)
          </TabsTrigger>
          <TabsTrigger 
            value="configuration" 
            className="rounded-md px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-gray-800 data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-700 hover:bg-gray-300"
          >
            Configuration (Paints)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Rooms</h2>
                <Button onClick={addRoom}>
                  <Plus className="w-4 h-4 mr-2" /> Add Room
                </Button>
              </div>

              {rooms.map((room) => (
                <Card key={room.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Home className="w-5 h-5 text-muted-foreground" />
                        <Input
                          className="font-semibold text-lg h-auto py-1 px-2 w-48"
                          value={room.name}
                          onChange={(e) => updateRoom(room.id, "name", e.target.value)}
                        />
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteRoom(room.id)}>
                        <Trash2 className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {room.walls.map((wall) => (
                        <div key={wall.id} className="grid grid-cols-14 gap-2 items-center">
                          <div className="col-span-3">
                            <Label className="text-xs text-muted-foreground">Wall Name</Label>
                            <Input
                              value={wall.name}
                              onChange={(e) => updateWall(room.id, wall.id, "name", e.target.value)}
                              className="h-8"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs text-muted-foreground">Length (m)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={ wall.length }
                              onChange={(e) => updateWall(room.id, wall.id, "length", parseFloat(e.target.value) || 0)}
                              className="h-8"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs text-muted-foreground">Height (m)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={ wall.height }
                              onChange={(e) => updateWall(room.id, wall.id, "height", parseFloat(e.target.value) || 0)}
                              className="h-8"
                            />
                          </div>
                          <div className="col-span-3">
                            <Label className="text-xs text-muted-foreground">Area</Label>
                            <div className="h-8 flex items-center px-3 bg-muted rounded-md text-sm">
                              {(wall.length! * wall.height!).toFixed(2)} m²
                            </div>
                          </div>
                          <div className="col-span-3">
                            <Label className="text-xs text-muted-foreground">Paint</Label>
                            <Select
                              value={wall.paintId}
                              onValueChange={(value) => updateWall(room.id, wall.id, "paintId", value)}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select paint" />
                              </SelectTrigger>
                              <SelectContent>
                                {paints.map((p) => (
                                  <SelectItem key={p.id} value={p.id}>
                                    {p.name} ({p.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-1 flex items-end justify-end h-full pb-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => deleteWall(room.id, wall.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => addWall(room.id)}>
                        <Plus className="w-3 h-3 mr-2" /> Add Wall
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                  <CardDescription>Total paint required and costs</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-6">
                      {Object.entries(paintTotals).map(([paintId, totals]) => {
                        const paint = paints.find((p) => p.id === paintId)
                        if (!paint) return null
                        return (
                          <div key={paintId} className="space-y-1 border-b pb-4 last:border-0">
                            <div className="font-medium flex justify-between">
                              <span>{paint.name}</span>
                              <span className="text-muted-foreground text-sm">{paint.code}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="text-muted-foreground">Area:</div>
                              <div className="text-right">{totals.area.toFixed(2)} m²</div>
                              <div className="text-muted-foreground">Amount:</div>
                              <div className="text-right">{totals.liters.toFixed(2)} L</div>
                              <div className="text-muted-foreground">Cost:</div>
                              <div className="text-right font-medium">€{totals.cost.toFixed(2)}</div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex-col items-stretch gap-4 border-t pt-6">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Cost</span>
                    <span className="text-2xl font-bold">€{grandTotalCost.toFixed(2)}</span>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="configuration">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Paint Types</span>
                <Button onClick={addPaint} size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Paint
                </Button>
              </CardTitle>
              <CardDescription>
                Configure available paint types, coverage, and pricing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paints.map((paint) => (
                  <div key={paint.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end border p-4 rounded-lg">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={paint.name}
                        onChange={(e) => updatePaint(paint.id, "name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Code</Label>
                      <Input
                        value={paint.code}
                        onChange={(e) => updatePaint(paint.id, "code", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Coverage (m²/L)</Label>
                      <Input
                        type="number"
                        value={paint.coverage}
                        onChange={(e) => updatePaint(paint.id, "coverage", parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Price (€/m²)</Label>
                      <Input
                        type="number"
                        value={paint.price}
                        onChange={(e) => updatePaint(paint.id, "price", parseFloat(e.target.value))}
                      />
                    </div>
                    <Button variant="destructive" size="icon" onClick={() => deletePaint(paint.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
