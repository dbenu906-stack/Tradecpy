
'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface TradeRegistryTableProps {
  trades?: any[];
  loading?: boolean;
}

export function TradeRegistryTable({ trades = [], loading }: TradeRegistryTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 border border-dashed rounded-xl">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card/30 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="font-headline text-xs uppercase tracking-widest">Account</TableHead>
            <TableHead className="font-headline text-xs uppercase tracking-widest">Symbol</TableHead>
            <TableHead className="font-headline text-xs uppercase tracking-widest">Type</TableHead>
            <TableHead className="font-headline text-xs uppercase tracking-widest">Trade Lot</TableHead>
            <TableHead className="font-headline text-xs uppercase tracking-widest">Master Lot</TableHead>
            <TableHead className="font-headline text-xs uppercase tracking-widest">Status</TableHead>
            <TableHead className="text-right font-headline text-xs uppercase tracking-widest">Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id} className="border-border hover:bg-secondary/20">
              <TableCell className="font-code text-xs">
                {trade.followerAccNum ? (
                  <span className="text-accent">Follower #{trade.followerAccNum}</span>
                ) : (
                  <span className="text-primary font-bold">Master #{trade.masterAccNum}</span>
                )}
              </TableCell>
              <TableCell className="font-bold">{trade.symbol}</TableCell>
              <TableCell>
                <span className={trade.type === "BUY" ? "text-emerald-500" : "text-rose-500"}>
                  {trade.type}
                </span>
              </TableCell>
              <TableCell className="font-code">{trade.lot.toFixed(2)}</TableCell>
              <TableCell className="font-code text-muted-foreground">{trade.masterLot?.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={trade.status === "Open" ? "default" : "secondary"} className="h-5 text-[10px] px-2 font-bold uppercase tracking-wider">
                  {trade.status}
                </Badge>
              </TableCell>
              <TableCell className={`text-right font-code ${trade.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {trade.profit >= 0 ? '+' : ''}${trade.profit?.toFixed(2) || "0.00"}
              </TableCell>
            </TableRow>
          ))}
          {trades.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                No trades recorded yet. Click 'Simulate Master Trade' to start.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
