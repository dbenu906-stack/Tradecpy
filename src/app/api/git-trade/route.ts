import { NextRequest, NextResponse } from 'next/server';

const GIT_PROJECT_ID = process.env.NEXT_PUBLIC_GIT_PROJECT_ID || 'dbenu906-stack/Tradecpy';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const [owner, repo] = GIT_PROJECT_ID.split('/');
const CONTENT_PATH = 'trades.json';
const CONTENT_URL = `https://api.github.com/repos/${owner}/${repo}/contents/${CONTENT_PATH}`;
const RAW_URL = `https://raw.githubusercontent.com/${owner}/${repo}/main/${CONTENT_PATH}`;

async function fetchCurrentTrades() {
  const response = await fetch(RAW_URL, { cache: 'no-store' });
  if (response.status === 404) {
    return [];
  }
  if (!response.ok) {
    throw new Error(`Unable to load trades.json from GitHub: ${response.statusText}`);
  }

  return response.json();
}

export async function GET() {
  try {
    const trades = await fetchCurrentTrades();
    return NextResponse.json(trades);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to fetch trade signals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!GITHUB_TOKEN) {
    return NextResponse.json({ error: 'Missing GITHUB_TOKEN environment variable' }, { status: 500 });
  }

  const body = await request.json();
  if (!body?.signals || !Array.isArray(body.signals)) {
    return NextResponse.json({ error: 'Invalid payload: signals array is required' }, { status: 400 });
  }

  try {
    const existingResp = await fetch(CONTENT_URL, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
      },
    });

    let sha: string | undefined;
    let currentSignals: any[] = [];

    if (existingResp.ok) {
      const existingData = await existingResp.json();
      sha = existingData.sha;
      currentSignals = existingData.content
        ? JSON.parse(Buffer.from(existingData.content, 'base64').toString('utf8'))
        : [];
    }

    const nextSignals = [...currentSignals, ...body.signals];
    const updateBody = {
      message: `Add ${body.signals.length} Git trade signal(s) from app`,
      content: Buffer.from(JSON.stringify(nextSignals, null, 2)).toString('base64'),
      branch: 'main',
      sha,
    } as any;

    const putResp = await fetch(CONTENT_URL, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    });

    if (!putResp.ok) {
      const errorText = await putResp.text();
      throw new Error(`GitHub update failed: ${putResp.status} ${errorText}`);
    }

    return NextResponse.json({ success: true, count: nextSignals.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to publish trade signals' }, { status: 500 });
  }
}
