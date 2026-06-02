"use client"

import { useState } from "react"
import { Terminal, Download, Copy, CheckCircle2, Info, BookOpen, Server, Globe, AlertCircle, Play, FileCode, CheckCircle, HelpCircle, Search, RefreshCw, Coins, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

export default function BridgePage() {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const projectId = process.env.NEXT_PUBLIC_GIT_PROJECT_ID || "REPLACE_WITH_YOUR_GIT_PROJECT_ID"

  const mqlCode = `//+------------------------------------------------------------------+
//|                                              PulseCopyBridge.mq5 |
//|                                  Copyright 2024, PulseCopy Ltd.  |
//|                                             https://pulsecopy.io |
//+------------------------------------------------------------------+
#property copyright "Copyright 2024, PulseCopy Ltd."
#property link      "https://pulsecopy.io"
#property version   "5.00"
#property strict

//--- Include Trade Library for real execution
#include <Trade\\Trade.mqh>

//--- INPUT PARAMETERS
input string   InpProjectID = "${projectId}"; // Your GitHub repo path (owner/repo)
input string   InpBrokerServer = "VantageInternational-Demo"; // Broker server label for logs
input string   InpAccountNumber = "25449835";                 // THIS MT5 Account Number
input double   InpMaxLot    = 5.0;                            // Safety Limit

//--- Global variables
CTrade trade;
string last_processed_id = "";

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("PulseCopy: Initializing Multi-Account Bridge v5.0...");
   Print("PulseCopy: Monitoring signals for Account #", InpAccountNumber);
   
   if(InpProjectID == "REPLACE_WITH_YOUR_GIT_PROJECT_ID") {
      Alert("PulseCopy Error: You MUST set your Project ID in the Input settings!");
      return(INIT_FAILED);
   }

   EventSetTimer(1);
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   EventKillTimer();
}

string JsonGetString(const string json, const string key, int startPos=0)
{
  string search = StringFormat("\\\"%s\\\":\\\"", key);
   int pos = StringFind(json, search, startPos);
   if(pos < 0) return("");

   int valueStart = pos + StringLen(search);
   int valueEnd = StringFind(json, "\\\"", valueStart);
   if(valueEnd < 0) return("");

   return(StringSubstr(json, valueStart, valueEnd - valueStart));
}

//+------------------------------------------------------------------+
//| Timer function to poll for trades                                |
//+------------------------------------------------------------------+
void OnTimer()
{
   // Fetch the latest trade signal from the Git server repo instead of Firestore.
  string url = StringFormat("https://raw.githubusercontent.com/%s/main/trades.json", InpProjectID);
   
   string headers = "Content-Type: application/json\\r\\n";
   uchar data[];
   uchar result[];
   string result_headers;
   
   ArrayFree(data);
   ArrayFree(result);
   
   int res = WebRequest("GET", url, headers, 3000, data, result, result_headers);
   
   if(res == 200) {
      string response = CharArrayToString(result);
      string accountSearch = StringFormat("\\\"account\\\":\\\"%s\\\"", InpAccountNumber);
      int signalPos = StringFind(response, accountSearch);
      if(signalPos < 0) return;

      int statusPos = StringFind(response, "\\\"status\\\":\\\"Open\\\"", signalPos);
      if(statusPos < 0) return;

      string current_id = JsonGetString(response, "id", signalPos);
      if(StringLen(current_id) == 0) {
        current_id = StringFormat("%s%s%s", JsonGetString(response, "symbol", signalPos), JsonGetString(response, "type", signalPos), InpAccountNumber);
      }
      if(StringLen(current_id) == 0 || current_id == last_processed_id) return;

      string symbol = JsonGetString(response, "symbol", signalPos);
      string action = JsonGetString(response, "type", signalPos);
      if(StringLen(action) == 0) action = JsonGetString(response, "action", signalPos);
      double lot = StringToDouble(JsonGetString(response, "lot", signalPos));
      if(lot <= 0.0) lot = StringToDouble(JsonGetString(response, "volume", signalPos));
      if(lot <= 0.0) lot = 0.01;
      if(lot > InpMaxLot) lot = InpMaxLot;
      double stop_loss = StringToDouble(JsonGetString(response, "stop_loss"));
      double take_profit = StringToDouble(JsonGetString(response, "take_profit"));
      double askPrice = SymbolInfoDouble(symbol, SYMBOL_ASK);
      double bidPrice = SymbolInfoDouble(symbol, SYMBOL_BID);
      if(askPrice <= 0.0 || bidPrice <= 0.0) {
         Print("PulseCopy: Price unavailable for symbol ", symbol);
         return;
      }

      Print("PulseCopy: NEW SIGNAL DETECTED FOR ACC #", InpAccountNumber);

      if(action == "BUY") {
         Print("PulseCopy: EXECUTING BUY | ", symbol, " | LOT: ", lot, " | SL: ", stop_loss, " | TP: ", take_profit);
         trade.Buy(lot, symbol, askPrice, stop_loss, take_profit);
      }
      else if(action == "SELL") {
         Print("PulseCopy: EXECUTING SELL | ", symbol, " | LOT: ", lot, " | SL: ", stop_loss, " | TP: ", take_profit);
         trade.Sell(lot, symbol, bidPrice, stop_loss, take_profit);
      }
      else {
         Print("PulseCopy: Unknown action ", action);
      }

      last_processed_id = current_id;
   } else {
      Print("PulseCopy: WebRequest failed with code ", res, " response headers: ", result_headers);
   }
`;


  const handleCopy = () => {
    navigator.clipboard.writeText(mqlCode)
    setCopied(true)
    toast({ title: "Code Copied", description: "The Multi-Account Bridge Engine is in your clipboard." })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight font-headline">Bridge Setup</h1>
          <p className="text-muted-foreground text-lg">Connect multiple Vantage MT5 terminals simultaneously.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="h-8 gap-2 bg-emerald-500/5 text-emerald-500 border-emerald-500/20 px-3">
             <Zap className="size-3" /> Multi-Account Ready
          </Badge>
          <Badge variant="outline" className="h-8 gap-2 bg-blue-500/5 text-blue-500 border-blue-500/20 px-3">
             <Coins className="size-3" /> Crypto Supported
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive border-2">
            <AlertCircle className="size-5" />
            <AlertTitle className="font-bold uppercase tracking-wider text-sm mb-2">Step 1: Authorize the URL in MT5</AlertTitle>
            <AlertDescription className="text-sm space-y-2">
              <p>MetaTrader blocks all web requests by default. You <strong>MUST</strong> do this on <strong>EVERY</strong> terminal you run:</p>
              <ol className="list-decimal list-inside font-bold space-y-1 ml-2">
                <li>Open MT5 and go to <strong>Tools &gt; Options &gt; Expert Advisors</strong>.</li>
                <li>Check: <strong>"Allow WebRequest for listed URL"</strong>.</li>
                <li>Add: <code className="bg-destructive/20 px-2 py-0.5 rounded ml-1">https://raw.githubusercontent.com</code></li>
              </ol>
            </AlertDescription>
          </Alert>

          <Card className="border-border bg-card/50 overflow-hidden">
            <div className="bg-secondary/80 p-3 flex items-center justify-between border-b border-border">
              <div className="flex items-center gap-2 px-2">
                <FileCode className="size-4 text-primary" />
                <span className="text-xs font-code font-bold">PulseCopyBridge.mq5 (v5.0 - Multi-Account Engine)</span>
              </div>
              <Button size="sm" variant="default" onClick={handleCopy} className="h-9 px-6 font-bold shadow-lg">
                {copied ? <CheckCircle className="size-4" /> : <Copy className="size-4" />}
                <span className="ml-2">{copied ? "COPIED!" : "COPY SOURCE CODE"}</span>
              </Button>
            </div>
            <CardContent className="p-0">
              <div className="bg-black/40 p-1">
                <pre className="p-6 text-[11px] font-code overflow-x-auto text-emerald-500/90 leading-relaxed max-h-[600px] scrollbar-thin scrollbar-thumb-primary/20">
                  {mqlCode}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-primary bg-primary/5 glow-primary border-2">
            <CardHeader>
              <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-primary">
                <HelpCircle className="size-4" />
                How to add 2+ Accounts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs font-bold">1. Multiple MT5 Instances</p>
                  <p className="text-[11px] text-muted-foreground">Install MetaTrader 5 into different folders (e.g. 'MT5_Acc1' and 'MT5_Acc2') to run them at the same time.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold">2. Unique Account IDs</p>
                  <p className="text-[11px] text-muted-foreground">When dragging the script onto a chart, go to the <strong>Inputs</strong> tab and set <strong>InpAccountNumber</strong> to the specific MT5 ID for that terminal.</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold">3. Shared Project ID</p>
                  <p className="text-[11px] text-muted-foreground">All terminals use the same <strong>InpProjectID</strong>, but they filter for their own signals automatically.</p>
                </div>
              </div>

              <div className="pt-4 border-t border-border space-y-2">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Your Project ID</p>
                <div className="p-3 rounded-lg bg-background border border-primary/20 group relative">
                  <code className="text-[11px] font-code break-all text-primary font-bold">{projectId}</code>
                  <Info className="absolute right-3 top-3 size-3 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
             <CardHeader className="pb-2">
               <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                 <Server className="size-4 text-muted-foreground" />
                 Diagnostic Stats
               </CardTitle>
             </CardHeader>
             <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px]">Cloud Sync</span>
                  <Badge className="bg-emerald-500/20 text-emerald-500 text-[9px] border-none">READY</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px]">Vantage Node</span>
                  <span className="text-[10px] font-code">AU-EAST-01</span>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
