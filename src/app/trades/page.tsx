
'use client';

import { useEffect, useState } from "react";
import { TradeRegistryTable } from "@/components/trade-registry-table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { History, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TradesPage() {
  const [trades, setTrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadTrades = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/git-trade');
        const data = await response.json();
        if (!active) return;
        setTrades(Array.isArray(data) ? data : data.trades || []);
      } catch (error) {
        if (!active) return;
        setTrades([]);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    loadTrades();
    const interval = setInterval(loadTrades, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Signal History</h1>
          <p className="text-muted-foreground mt-1">Audit log of all replicated master and slave signals.</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" size="sm" className="h-9">
            <Filter className="mr-2 size-4" />
            Filter
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 size-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="border-border bg-card/50">
        <CardHeader className="pb-0">
          <CardTitle className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            Live Execution Registry
          </CardTitle>
          <CardDescription>Real-time stream of signals across all linked Vantage terminals.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <TradeRegistryTable trades={trades} loading={loading} />
        </CardContent>
      </Card>
    </div>
  )
}
