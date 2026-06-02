'use client';

import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { PerformanceChart } from "@/components/dashboard/performance-chart";
import { 
  Zap, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Server,
  Terminal,
  Loader2,
  BarChart3,
  Wifi,
  Globe,
  Database,
  Coins
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { TradeRegistryTable } from "@/components/trade-registry-table";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { openMasterTrade } from "@/lib/trade-service";
import { collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isSimulating, setIsSimulating] = useState(false);
  const [liveTrades, setLiveTrades] = useState<any[]>([]);
  const [tradesLoading, setTradesLoading] = useState(true);
  
  // Terminal State
  const [termSymbol, setTermSymbol] = useState("XAUUSD")
  const [termLot, setTermLot] = useState("0.10")

  useEffect(() => {
    const loadTrades = async () => {
      setTradesLoading(true);
      try {
        const response = await fetch('/api/git-trade');
        const data = await response.json();
        setLiveTrades(Array.isArray(data) ? data : data.trades || []);
      } catch (error) {
        setLiveTrades([]);
      } finally {
        setTradesLoading(false);
      }
    };

    loadTrades();
  }, []);

  // Stabilize the accounts query
  const accountsCol = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'accounts');
  }, [db]);
  const { data: accounts } = useCollection(accountsCol);
  
  const masterAccounts = accounts?.filter(a => a.role === 'master') || [];
  
  const handleTerminalTrade = async (type: "BUY" | "SELL") => {
    if (!db) return;
    if (masterAccounts.length === 0) {
      toast({
        variant: "destructive",
        title: "No Master Terminal",
        description: "Please link a Master account in the MT5 Signal Portal first.",
      });
      return;
    }

    setIsSimulating(true);
    try {
      await openMasterTrade(db, {
        masterAccNum: masterAccounts[0].accNum,
        symbol: termSymbol,
        type: type,
        lot: parseFloat(termLot) || 0.1
      });

      toast({
        title: "Signal Broadcasted",
        description: `Signal for ${type} ${termLot} ${termSymbol} pushed to cloud. Your MT5 script will execute this locally now.`,
      });
    } catch (e) {
      // Handled by global listener
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Live Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time signal orchestration and Vantage bridge diagnostics.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-8 gap-2 bg-emerald-500/5 text-emerald-500 border-emerald-500/20 px-3">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Vantage Cloud Sync: Active
          </Badge>
          <Badge variant="outline" className="h-8 gap-2 bg-blue-500/5 text-blue-500 border-blue-500/20 px-3">
            <Database className="size-3" />
            Firestore Bridge: Online
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Master Balance" 
          value="$12,450.22" 
          trend="+8.2%" 
          trendUp={true} 
          icon={TrendingUp} 
        />
        <StatCard 
          title="Linked Terminals" 
          value={accounts?.length.toString() || "0"} 
          icon={Server} 
        />
        <StatCard 
          title="Active Bridge Signals" 
          value={liveTrades?.length.toString() || "0"} 
          icon={Wifi} 
        />
        <StatCard 
          title="Execution Latency" 
          value="42ms" 
          icon={Zap} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 border-primary/20 bg-primary/5 glow-primary overflow-hidden relative">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Globe className="size-24" />
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <Terminal className="size-5" />
              Live Order Terminal
            </CardTitle>
            <CardDescription>Instant execution across your Vantage registry.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Vantage Asset Pair</Label>
                <Select onValueChange={setTermSymbol} value={termSymbol}>
                  <SelectTrigger className="bg-background border-primary/20">
                    <SelectValue placeholder="Select Pair" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground uppercase font-bold">
                        <Target className="size-3" /> Forex & Metals
                      </SelectLabel>
                      <SelectItem value="XAUUSD">XAUUSD (Gold Spot)</SelectItem>
                      <SelectItem value="EURUSD">EURUSD (Euro / USD)</SelectItem>
                      <SelectItem value="GBPUSD">GBPUSD (Pound / USD)</SelectItem>
                      <SelectItem value="USDJPY">USDJPY (USD / Yen)</SelectItem>
                      <SelectItem value="AUDUSD">AUDUSD (Aussie / USD)</SelectItem>
                    </SelectGroup>
                    <SelectGroup>
                      <SelectLabel className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground uppercase font-bold border-t border-border mt-2">
                        <Coins className="size-3" /> Cryptocurrencies
                      </SelectLabel>
                      <SelectItem value="BTCUSD">BTCUSD (Bitcoin)</SelectItem>
                      <SelectItem value="ETHUSD">ETHUSD (Ethereum)</SelectItem>
                      <SelectItem value="SOLUSD">SOLUSD (Solana)</SelectItem>
                      <SelectItem value="LTCUSD">LTCUSD (Litecoin)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Volume (Lots)</Label>
                <Input type="number" step="0.01" min="0.01" value={termLot} onChange={(e) => setTermLot(e.target.value)} className="bg-background border-primary/20" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <Button 
                variant="default" 
                className="bg-emerald-600 hover:bg-emerald-700 h-14 font-bold text-xl glow-primary" 
                disabled={isSimulating}
                onClick={() => handleTerminalTrade("BUY")}
              >
                {isSimulating ? <Loader2 className="animate-spin" /> : "BUY"}
              </Button>
              <Button 
                variant="destructive" 
                className="h-14 font-bold text-xl shadow-lg" 
                disabled={isSimulating}
                onClick={() => handleTerminalTrade("SELL")}
              >
                {isSimulating ? <Loader2 className="animate-spin" /> : "SELL"}
              </Button>
            </div>
            
            <div className="pt-4 border-t border-primary/10">
              <p className="text-[10px] text-muted-foreground uppercase font-bold mb-2">Bridge Router</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Source Master</span>
                <span className="font-code text-primary">#{masterAccounts[0]?.accNum || 'NONE'}</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-muted-foreground">Server Node</span>
                <span className="font-code text-muted-foreground truncate max-w-[140px] uppercase">{masterAccounts[0]?.broker || 'OFFLINE'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 border-border bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Execution Analysis</CardTitle>
              <CardDescription>Real-time performance metrics of the Cloud Bridge.</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
              Detailed Logs
              <BarChart3 className="ml-2 size-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <PerformanceChart />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold font-headline flex items-center gap-2">
          <Database className="size-5 text-primary" />
          Live Signal Registry
        </h2>
        <TradeRegistryTable trades={liveTrades} loading={tradesLoading} />
      </div>
    </div>
  )
}
