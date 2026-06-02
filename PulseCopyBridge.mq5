//+------------------------------------------------------------------+
//|                                              PulseCopyBridge.mq5 |
//|                                  Copyright 2024, PulseCopy Ltd.  |
//|                                             https://pulsecopy.io |
//+------------------------------------------------------------------+
#property copyright "Copyright 2024, PulseCopy Ltd."
#property link      "https://pulsecopy.io"
#property version   "5.00"
#property strict

//--- Include Trade Library for real execution
#include <Trade\Trade.mqh>

//--- INPUT PARAMETERS
input string   InpProjectID     = "dbenu906-stack/Tradecpy";           // Your GitHub repo path (owner/repo)
input string   InpBrokerServer  = "VantageMarkets-Demo";         // Broker server label for logs
input string   InpAccountNumber = "25449835";                        // This MT5/Vantage account number
input double   InpMaxLot        = 5.0;                                 // Safety limit

//--- Global variables
CTrade trade;
string last_processed_id = "";

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   Print("PulseCopy: Initializing Multi-Account Bridge v5.0...");
   Print("PulseCopy: Project ID = ", InpProjectID);
   Print("PulseCopy: Broker Server = ", InpBrokerServer);
   Print("PulseCopy: Monitoring signals for Account #", InpAccountNumber);

   if(StringLen(InpProjectID) == 0 || InpProjectID == "REPLACE_WITH_YOUR_GIT_PROJECT_ID") {
      Alert("PulseCopy Error: You MUST set your Project ID in the input settings!");
      return(INIT_FAILED);
   }

   if(StringLen(InpAccountNumber) == 0) {
      Alert("PulseCopy Error: You MUST set your account number in the input settings!");
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

string JsonGetRawValue(const string json, const string key, int startPos=0)
{
   string search = StringFormat("\"%s\":", key);
   int pos = StringFind(json, search, startPos);
   if(pos < 0) return("");

   int valueStart = pos + StringLen(search);
   while(valueStart < StringLen(json) && (StringGetCharacter(json, valueStart) == ' ' || StringGetCharacter(json, valueStart) == '\r' || StringGetCharacter(json, valueStart) == '\n' || StringGetCharacter(json, valueStart) == '\t'))
      valueStart++;

   if(valueStart >= StringLen(json)) return("");

   if(StringGetCharacter(json, valueStart) == '"') {
      valueStart++;
      int valueEnd = StringFind(json, "\"", valueStart);
      if(valueEnd < 0) return("");
      return(StringSubstr(json, valueStart, valueEnd - valueStart));
   }

   int valueEnd = valueStart;
   while(valueEnd < StringLen(json)) {
      int ch = StringGetCharacter(json, valueEnd);
      if(ch == ',' || ch == '}' || ch == ']' || ch == ' ' || ch == '\r' || ch == '\n' || ch == '\t')
         break;
      valueEnd++;
   }

   return(StringSubstr(json, valueStart, valueEnd - valueStart));
}

string JsonGetString(const string json, const string key, int startPos=0)
{
   return(JsonGetRawValue(json, key, startPos));
}

double JsonGetDouble(const string json, const string key, int startPos=0)
{
   string text = JsonGetRawValue(json, key, startPos);
   return(StringLen(text) > 0 ? StringToDouble(text) : 0.0);
}

int FindNextOpenSignal(const string response)
{
   int currentPos = 0;

   while(true) {
      int accountPos = StringFind(response, "\"account\":", currentPos);
      if(accountPos < 0) return(-1);

      string accountValue = JsonGetRawValue(response, "account", accountPos);
      if(StringLen(accountValue) == 0) {
         currentPos = accountPos + 10;
         continue;
      }

      if(accountValue == InpAccountNumber) {
         int objectEnd = StringFind(response, "}", accountPos);
         if(objectEnd < 0) return(-1);

         int statusPos = StringFind(response, "\"status\":\"Open\"", accountPos);
         if(statusPos >= 0 && statusPos < objectEnd) {
            string current_id = JsonGetString(response, "id", accountPos);
            if(StringLen(current_id) == 0) {
               current_id = StringFormat("%s%s%s", JsonGetString(response, "symbol", accountPos), JsonGetString(response, "type", accountPos), InpAccountNumber);
            }
            if(StringLen(current_id) == 0 || current_id != last_processed_id) {
               return(accountPos);
            }
         }
      }

      currentPos = accountPos + 10;
   }
}

//+------------------------------------------------------------------+
//| Timer function to poll for trades                                |
//+------------------------------------------------------------------+
void OnTimer()
{
   string url = StringFormat("https://raw.githubusercontent.com/%s/main/trades.json", InpProjectID);
   uchar data[];
   uchar result[];
   string result_headers;

   ArrayFree(data);
   ArrayFree(result);

   int res = WebRequest("GET", url, "Content-Type: application/json\r\n", 10000, data, result, result_headers);
   if(res != 200) {
      Print("PulseCopy: WebRequest failed with code ", res, " response headers: ", result_headers);
      return;
   }

   string response = CharArrayToString(result);
   int signalPos = FindNextOpenSignal(response);
   if(signalPos < 0) return;

   string symbol = JsonGetString(response, "symbol", signalPos);
   string action = JsonGetString(response, "type", signalPos);
   if(StringLen(action) == 0) action = JsonGetString(response, "action", signalPos);

   double lot = JsonGetDouble(response, "lot", signalPos);
   if(lot <= 0.0) lot = JsonGetDouble(response, "volume", signalPos);
   if(lot <= 0.0) lot = 0.01;
   if(lot > InpMaxLot) lot = InpMaxLot;

   double stop_loss = JsonGetDouble(response, "stop_loss", signalPos);
   double take_profit = JsonGetDouble(response, "take_profit", signalPos);

   string current_id = JsonGetString(response, "id", signalPos);
   if(StringLen(current_id) == 0) {
      current_id = StringFormat("%s%s%s", symbol, action, InpAccountNumber);
   }

   if(StringLen(current_id) == 0 || current_id == last_processed_id) return;
   if(StringLen(symbol) == 0 || StringLen(action) == 0) {
      Print("PulseCopy: Invalid trade signal payload.");
      return;
   }

   double askPrice = SymbolInfoDouble(symbol, SYMBOL_ASK);
   double bidPrice = SymbolInfoDouble(symbol, SYMBOL_BID);
   if(askPrice <= 0.0 || bidPrice <= 0.0) {
      Print("PulseCopy: Price unavailable for symbol ", symbol);
      return;
   }

   Print("PulseCopy: NEW SIGNAL DETECTED FOR ACC #", InpAccountNumber);
   PrintFormat("PulseCopy: EXECUTING %s %s LOT=%G SL=%G TP=%G", action, symbol, lot, stop_loss, take_profit);

   bool orderSent = false;
   if(action == "BUY") {
      orderSent = trade.Buy(lot, symbol, 0.0, stop_loss, take_profit);
   }
   else if(action == "SELL") {
      orderSent = trade.Sell(lot, symbol, 0.0, stop_loss, take_profit);
   }
   else {
      Print("PulseCopy: Unknown action ", action);
   }

   if(orderSent) {
      Print("PulseCopy: Order sent successfully for ", symbol, " account #", InpAccountNumber);
      last_processed_id = current_id;
   } else {
      Print("PulseCopy: Order failed for ", symbol, " error=", GetLastError());
   }
}
