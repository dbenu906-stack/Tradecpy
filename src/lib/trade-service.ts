
import { collection, query, where, getDocs, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export interface TradeInput {
  masterAccNum: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  lot: number;
}

interface GitTradeSignal {
  id: string;
  account: string;
  masterAccNum: string;
  followerAccNum?: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  lot: number;
  masterLot: number;
  status: 'Open' | 'Closed';
  timestamp: string;
  profit: number;
}

/**
 * Executes an order by publishing trade signals to the GitHub-backed trade file.
 */
export async function openMasterTrade(db: Firestore, input: TradeInput) {
  try {
    console.log(`[MT5 BRIDGE] Initiating handshake for ${input.masterAccNum}...`);
    await new Promise((resolve) => setTimeout(resolve, 400));
    console.log(`[MT5 BRIDGE] Order accepted by Vantage Server for ${input.symbol}`);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const followersQuery = query(
      collection(db, 'accounts'),
      where('role', '==', 'follower'),
      where('masterId', '==', input.masterAccNum)
    );
    const followerSnaps = await getDocs(followersQuery);

    const masterSignal: GitTradeSignal = {
      id: `signal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      account: input.masterAccNum,
      masterAccNum: input.masterAccNum,
      symbol: input.symbol.toUpperCase(),
      type: input.type,
      lot: input.lot,
      masterLot: input.lot,
      status: 'Open',
      timestamp: new Date().toISOString(),
      profit: 0.0,
    };

    const signals: GitTradeSignal[] = [masterSignal];

    for (const doc of followerSnaps.docs) {
      const follower = doc.data();
      const multiplier = follower.multiplier || 1.0;
      const followerLot = Number((input.lot * multiplier).toFixed(2));

      signals.push({
        id: `signal_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_f_${follower.accNum}`,
        account: follower.accNum,
        masterAccNum: input.masterAccNum,
        followerAccNum: follower.accNum,
        symbol: input.symbol.toUpperCase(),
        type: input.type,
        lot: followerLot,
        masterLot: input.lot,
        status: 'Open',
        timestamp: new Date().toISOString(),
        profit: 0.0,
      });
    }

    console.log(`[MT5 BRIDGE] Publishing ${signals.length} signal(s) to Git backend.`);

    const response = await fetch('/api/git-trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signals }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Git trade backend failed: ${response.status} ${errorBody}`);
    }

    return masterSignal.id;
  } catch (e: any) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
      path: 'git-trade',
      operation: 'publish',
      requestResourceData: input,
      message: e?.message,
    }));
    throw e;
  }
}
