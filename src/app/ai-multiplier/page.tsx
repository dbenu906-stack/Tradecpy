
"use client"

import { useState } from "react"
import { Cpu, Calculator, Info, Zap, AlertTriangle, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { suggestOptimalLotMultiplier } from "@/ai/flows/suggest-optimal-lot-multiplier"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function AiMultiplierPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ multiplier: number; reasoning: string } | null>(null)
  const [riskLevel, setRiskLevel] = useState("conservative")

  const handleSuggest = async () => {
    setLoading(true)
    try {
      // Data tailored to the risk level for the simulation
      const baseBalance = 5000;
      const history = riskLevel === "conservative" 
        ? [5000, 5020, 5015, 5050, 5080] 
        : riskLevel === "moderate" 
          ? [5000, 5150, 5050, 5200, 5300]
          : [5000, 5500, 4800, 5300, 5800];

      const input = {
        followerHistoricalBalance: history,
        masterVolatilityMetrics: {
          dailyPercentageChange: riskLevel === "aggressive" ? [2.5, -3.1, 4.0] : [0.5, -0.2, 0.8],
          maxDrawdown: riskLevel === "aggressive" ? 12.5 : 3.2,
          averageDailyRange: riskLevel === "aggressive" ? 250 : 90,
        }
      }
      
      const response = await suggestOptimalLotMultiplier(input)
      setResult({
        multiplier: response.optimalLotMultiplier,
        reasoning: response.reasoning
      })
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="space-y-2 text-center">
        <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 glow-primary">
          <Cpu className="size-6 text-primary" />
        </div>
        <h1 className="text-4xl font-bold tracking-tighter font-headline">Smart Multiplier Tool</h1>
        <p className="text-muted-foreground text-lg">AI-powered lot size optimization using Gemini 2.5 Intelligence.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <Card className="border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="size-5 text-primary" />
              Risk Analysis Input
            </CardTitle>
            <CardDescription>Configure parameters for the AI model to process.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Target Account Balance ($)</Label>
              <Input type="number" defaultValue="5000" className="bg-background" />
            </div>
            
            <div className="space-y-3">
              <Label>Strategy Risk Profile</Label>
              <RadioGroup defaultValue="conservative" onValueChange={setRiskLevel} className="grid grid-cols-3 gap-4">
                <div>
                  <RadioGroupItem value="conservative" id="r1" className="peer sr-only" />
                  <Label htmlFor="r1" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    <span className="text-xs uppercase font-bold">Low</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="moderate" id="r2" className="peer sr-only" />
                  <Label htmlFor="r2" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    <span className="text-xs uppercase font-bold">Mid</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="aggressive" id="r3" className="peer sr-only" />
                  <Label htmlFor="r3" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                    <span className="text-xs uppercase font-bold">High</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button 
              onClick={handleSuggest} 
              className="w-full glow-primary h-12 text-lg font-bold transition-all"
              disabled={loading}
            >
              {loading ? (
                <>Analyzing Financial Data...</>
              ) : (
                <>Generate Suggestion <Zap className="ml-2 size-5" /></>
              )}
            </Button>
            {loading && <Progress value={70} className="h-1 animate-pulse" />}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {result ? (
            <Card className="border-accent bg-accent/5 glow-accent animate-in slide-in-from-right-4 duration-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent uppercase tracking-widest text-sm">
                  <TrendingUp className="size-4" />
                  AI Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-7xl font-black font-code text-center py-4 bg-background/40 rounded-3xl border border-accent/10">
                  {result.multiplier.toFixed(2)}x
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">Analyst Reasoning</Label>
                  <div className="p-4 rounded-xl bg-background border border-accent/20">
                    <p className="text-sm leading-relaxed text-muted-foreground italic">
                      "{result.reasoning}"
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                   <Button variant="outline" className="flex-1 border-accent text-accent hover:bg-accent/10">
                    Save Report
                  </Button>
                  <Button className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90">
                    Apply to Bridge
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center border border-dashed rounded-3xl border-border bg-secondary/10">
              <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-6">
                <Info className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Awaiting Parameters</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Select your risk profile and let the AI analyze market volatility vs your specific balance history.
              </p>
            </div>
          )}

          <Alert className="bg-amber-500/5 border-amber-500/20">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-500 font-bold">Risk Disclaimer</AlertTitle>
            <AlertDescription className="text-[10px] text-amber-500/80 leading-normal">
              Suggestions generated by the Smart Multiplier model are based on historical simulations. 
              PulseCopy does not guarantee future results. Leverage trading involves high risk of total loss.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}
