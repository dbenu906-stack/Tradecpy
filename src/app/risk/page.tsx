
"use client"

import { useState } from "react"
import { ShieldAlert, Lock, AlertOctagon, ShieldCheck, Zap, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

export default function RiskPage() {
  const { toast } = useToast()
  const [maxDrawdown, setMaxDrawdown] = useState([5])
  const [emergencyStop, setEmergencyStop] = useState(false)

  const handleSave = () => {
    toast({
      title: "Safeguards Updated",
      description: "Risk parameters have been synchronized with the Vantage bridge node.",
    })
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Safeguards</h1>
          <p className="text-muted-foreground mt-1">Configure global kill-switches and equity protection layers.</p>
        </div>
        <Badge variant={emergencyStop ? "destructive" : "outline"} className="px-4 py-1 h-fit">
          {emergencyStop ? "TRADING HALTED" : "SYSTEM ARMED"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-2 border-border bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="size-5 text-primary" />
              Equity Protection
            </CardTitle>
            <CardDescription>Automatically close all positions if risk thresholds are breached.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-bold">Max Account Drawdown (%)</Label>
                <span className="text-primary font-code font-bold">{maxDrawdown}%</span>
              </div>
              <Slider 
                value={maxDrawdown} 
                onValueChange={setMaxDrawdown} 
                max={20} 
                step={0.5} 
                className="py-4"
              />
              <p className="text-xs text-muted-foreground italic">
                If the follower account equity drops by {maxDrawdown}% from the daily high, the Pulse Bridge will liquidate all trades.
              </p>
            </div>

            <div className="pt-6 border-t border-border space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold">News Filter</Label>
                  <p className="text-xs text-muted-foreground">Pause copying 5 mins before/after High Impact news.</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/20 border border-border">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold">Slippage Guard</Label>
                  <p className="text-xs text-muted-foreground">Reject signals if slippage exceeds 3 pips.</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-destructive/50 bg-destructive/5 glow-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertOctagon className="size-5" />
                Emergency Kill-Switch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Instantly disconnect all Vantage bridge nodes and flatten all active positions across the master and slave terminals.
              </p>
              <Button 
                variant={emergencyStop ? "secondary" : "destructive"} 
                className="w-full font-bold h-12 uppercase tracking-widest"
                onClick={() => setEmergencyStop(!emergencyStop)}
              >
                {emergencyStop ? "Resume Trading" : "HALT ALL SYSTEMS"}
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="size-4" />
                Audit Logs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-[10px] text-muted-foreground space-y-2">
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span>09:42:11</span>
                  <span className="text-foreground">Slippage check passed (0.8 pips)</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-1">
                  <span>08:15:00</span>
                  <span className="text-foreground">News Filter: FOMC Window Closed</span>
                </div>
                <div className="flex justify-between">
                  <span>07:30:04</span>
                  <span className="text-emerald-500 font-bold">Safeguards Armed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} className="px-12 h-12 font-bold glow-primary">
          Save Global Risk Settings
        </Button>
      </div>
    </div>
  )
}
