
"use client"

import { useState } from "react"
import { Plus, Server, Key, Trash2, Copy, CheckCircle2, Loader2, Link2, Wifi, ShieldCheck, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, deleteDoc, doc, setDoc } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

type AccountRole = 'master' | 'follower';

export default function AccountsPage() {
  const { toast } = useToast()
  const db = useFirestore()
  const [isAdding, setIsAdding] = useState(false)
  const [initStep, setInitStep] = useState<string | null>(null)
  
  // Form State
  const [formAccNum, setFormAccNum] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [formBroker, setFormBroker] = useState("VantageInternational-Demo")
  const [formRole, setFormRole] = useState<AccountRole | "">("")
  const [formMultiplier, setFormMultiplier] = useState("1.0")
  const [formMasterLink, setFormMasterLink] = useState("")

  // Stabilize the collection reference
  const accountsCol = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'accounts');
  }, [db]);

  const { data: accounts = [], loading } = useCollection(accountsCol)

  const handleInitialize = async () => {
    if (!db) {
      toast({ variant: "destructive", title: "Error", description: "Database not connected." });
      return;
    }
    if (!formAccNum || !formBroker || !formRole || !formPassword) {
      toast({ variant: "destructive", title: "Missing Info", description: "Please fill in all MT5 credentials." })
      return
    }

    setInitStep("Connecting to Vantage Server...")
    await new Promise(r => setTimeout(r, 1200))
    setInitStep("Authenticating MT5 Credentials...")
    await new Promise(r => setTimeout(r, 1000))
    setInitStep("Installing Pulse Bridge DLL...")
    await new Promise(r => setTimeout(r, 800))
    setInitStep("Synchronizing Signal Socket...")
    await new Promise(r => setTimeout(r, 600))

    const accId = `${formAccNum}`
    
    const newAccount = {
      accNum: formAccNum,
      broker: formBroker,
      role: formRole,
      status: 'active',
      connectedAt: new Date().toISOString(),
      token: `pulse_live_tkn_${formAccNum}_${Math.random().toString(36).substr(2, 4)}`,
      multiplier: parseFloat(formMultiplier) || 1.0,
      masterId: formRole === 'follower' ? formMasterLink : null
    }

    setDoc(doc(db, 'accounts', accId), newAccount)
      .then(() => {
        setInitStep(null)
        setIsAdding(false)
        setFormAccNum("")
        setFormPassword("")
        toast({ title: "Terminal Synchronized", description: `Pulse Bridge connected to ${formBroker} for account #${formAccNum}.` })
      })
      .catch(async (e) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: 'accounts',
          operation: 'create',
          requestResourceData: newAccount
        }))
        setInitStep(null)
      })
  }

  const handleDelete = (id: string) => {
    if (!db) return;
    deleteDoc(doc(db, 'accounts', id)).catch(async (e) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `accounts/${id}`,
        operation: 'delete'
      }))
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied", description: "Connection token copied to clipboard." })
  }

  const filteredAccounts = (role: string) => {
    if (role === 'all') return accounts
    return accounts.filter(a => a.role === role)
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">MT5 Signal Portal</h1>
          <p className="text-muted-foreground mt-1">Manage your terminal connections and broker bridge status.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} variant={isAdding ? "ghost" : "default"} className={!isAdding ? "glow-primary" : ""}>
          <Plus className="mr-2 size-4" />
          {isAdding ? "Cancel Registration" : "Link New Terminal"}
        </Button>
      </div>

      {isAdding && (
        <Card className="border-primary/50 bg-primary/5 glow-primary animate-in fade-in slide-in-from-top-4 duration-500">
          <CardHeader>
            <CardTitle>Broker Terminal Link</CardTitle>
            <CardDescription>Enter your Vantage MT5 credentials to install the Pulse Bridge.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>MT5 Account Number</Label>
              <Input placeholder="e.g. 25449835" value={formAccNum} onChange={(e) => setFormAccNum(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>MT5 Password</Label>
              <div className="relative">
                <Input type="password" placeholder="••••••••" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} />
                <Lock className="absolute right-3 top-2.5 size-4 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Broker Server</Label>
              <Input placeholder="VantageInternational-Demo" value={formBroker} onChange={(e) => setFormBroker(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Terminal Role</Label>
              <Select onValueChange={(v: AccountRole) => setFormRole(v)} value={formRole}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="master">Master (Signal Source)</SelectItem>
                  <SelectItem value="follower">Follower (Signal Sink)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formRole === 'follower' && (
              <>
                <div className="space-y-2">
                  <Label>Lot Multiplier</Label>
                  <Input type="number" step="0.1" value={formMultiplier} onChange={(e) => setFormMultiplier(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Target Master Account #</Label>
                  <Input placeholder="Enter Master Acc #" value={formMasterLink} onChange={(e) => setFormMasterLink(e.target.value)} />
                </div>
              </>
            )}
            <div className="flex items-end">
              <Button className="w-full h-10 font-bold" onClick={handleInitialize} disabled={!!initStep}>
                {initStep ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    {initStep}
                  </>
                ) : (
                  "Install Signal Bridge"
                )}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="border-t border-primary/10 py-3 text-[10px] text-muted-foreground flex gap-4">
            <span className="flex items-center gap-1"><ShieldCheck className="size-3" /> SSL Encryption Enabled</span>
            <span className="flex items-center gap-1"><Server className="size-3" /> Dedicated Vantage Node</span>
          </CardFooter>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Fetching terminal registry...</p>
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="all">All Terminals</TabsTrigger>
            <TabsTrigger value="master">Masters</TabsTrigger>
            <TabsTrigger value="follower">Followers</TabsTrigger>
          </TabsList>
          
          {['all', 'master', 'follower'].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredAccounts(tab).map((account) => (
                  <Card key={account.id} className="border-border bg-card/50 overflow-hidden relative group hover:border-primary/50 transition-colors">
                    <div className={`absolute top-0 left-0 w-1.5 h-full ${account.role === 'master' ? 'bg-primary' : 'bg-accent'}`} />
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${account.role === 'master' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent'} border-none uppercase text-[10px]`}>
                            {account.role}
                          </Badge>
                          <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase">
                            <Wifi className="size-3" /> Live Sync
                          </div>
                        </div>
                        <CardTitle className="text-xl">Acc #{account.accNum}</CardTitle>
                        <CardDescription className="font-code text-xs uppercase">{account.broker}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => copyToClipboard(account.token)}><Copy className="size-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDelete(account.id)}><Trash2 className="size-3" /></Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">Status</p>
                            <p className="text-sm font-bold text-emerald-500 uppercase">Authenticated</p>
                          </div>
                          <div className="space-y-1 text-right">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground">{account.role === 'master' ? 'Signals Active' : 'Lot Scale'}</p>
                            <p className="text-sm font-bold">{account.role === 'master' ? 'BROADCASTING' : `${account.multiplier}x`}</p>
                          </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-secondary/30 py-3 text-xs flex justify-between">
                      <span className="flex items-center gap-1 text-muted-foreground"><Server className="size-3" /> Node: {account.broker.split('-')[0]}</span>
                      {account.role === 'follower' && (
                        <span className="flex items-center gap-1 text-accent font-bold"><Link2 className="size-3" /> Linked to #{account.masterId || 'NONE'}</span>
                      )}
                      {account.role === 'master' && (
                        <span className="flex items-center gap-1 text-primary font-bold"><Wifi className="size-3" /> MT5 Handshake OK</span>
                      )}
                    </CardFooter>
                  </Card>
                ))}
                {filteredAccounts(tab).length === 0 && (
                  <div className="col-span-full py-20 text-center border border-dashed rounded-3xl border-border">
                    <p className="text-muted-foreground">No terminals registered in this category.</p>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
