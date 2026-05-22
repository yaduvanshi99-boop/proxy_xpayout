import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_TARGET_URL = 'https://connect.payatme.com/api/callback/API-MP9K1VPD-3ZYQ';
const DEFAULT_PAYOUT_TARGET_URL = 'https://connect.payatme.com/api/callback/API-MPCNUX3V-MJUS';

function firstPresent(...values: any[]): string | null {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }
  return null;
}

function parseJsonSafely(value: string): any {
  if (!value || typeof value !== 'string') return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function parseBody(req: NextRequest): Promise<any> {
  const contentType = req.headers.get('content-type') || '';
  let rawBody = '';
  try {
    rawBody = await req.text();
  } catch {
    return {};
  }

  if (!rawBody || !rawBody.trim()) return {};

  if (contentType.includes('application/json')) {
    return parseJsonSafely(rawBody) || {};
  }

  if (contentType.includes('x-www-form-urlencoded') || rawBody.includes('=')) {
    const parsed: any = {};
    new URLSearchParams(rawBody).forEach((value, key) => {
      parsed[key] = value;
    });
    return parsed;
  }

  return parseJsonSafely(rawBody) || {};
}

function mergeQuery(body: any, searchParams: URLSearchParams): any {
  const merged = { ...body };
  searchParams.forEach((value, key) => {
    if (merged[key] === undefined || merged[key] === null || merged[key] === '') {
      merged[key] = value;
    }
  });
  return merged;
}

function normalizeXPayoutStatus(payload: any): 'processing' | 'failed' | 'success' {
  const result = payload?.response?.result || payload?.data?.result || payload?.result || payload?.data || {};

  const explicitStatusText = [
    payload?.normalized_status,
    payload?.status,
    payload?.data?.status,
    payload?.data?.normalized_status,
    payload?.data?.txn_status,
    payload?.data?.transaction_status,
    payload?.data?.payment_status,
    payload?.data?.order_status,
    payload?.response?.status,
    result?.status,
    result?.normalized_status,
    result?.txn_status,
    result?.transaction_status,
    result?.payment_status,
    result?.order_status
  ]
    .filter((value) => value !== undefined && value !== null && value !== true && value !== false)
    .map((value) => String(value).toLowerCase().trim())
    .filter((val) => val !== 'true' && val !== 'false')
    .join(' ');

  const providerText = [
    payload?.provider_status_code,
    payload?.provider_message,
    payload?.message,
    payload?.msg,
    payload?.success,
    payload?.data?.message,
    payload?.response?.message,
    result?.provider_status_code,
    result?.provider_message,
    result?.message,
    result?.success
  ]
    .filter((value) => value !== undefined && value !== null && value !== true && value !== false)
    .map((value) => String(value).toLowerCase().trim())
    .filter((val) => val !== 'true' && val !== 'false')
    .join(' ');

  if (/\b(processing|pending|initiated|created|queued|open)\b/.test(explicitStatusText)) {
    return 'processing';
  }

  if (/\b(failed|failure|reversed|reverse|timeout|timed\s*out|expired|expire|cancelled|canceled|declined|rejected|error|aborted)\b/.test(explicitStatusText) || explicitStatusText === '0') {
    return 'failed';
  }

  if (/\b(success|successful|completed|complete|paid|captured|credit|credited|approved)\b/.test(explicitStatusText) || explicitStatusText === '1') {
    return 'success';
  }

  if (/\b(failed|failure|reversed|reverse|timeout|timed\s*out|expired|expire|cancelled|canceled|declined|rejected|error|aborted)\b/.test(providerText)) {
    return 'failed';
  }

  if (/\b(successful|completed|complete|paid|captured|credit|credited|approved)\b/.test(providerText)) {
    return 'success';
  }

  return 'processing';
}

function buildForwardPayload(payload: any): any {
  const result = payload?.response?.result || payload?.data?.result || payload?.result || payload?.data || {};
  const normalizedStatus = normalizeXPayoutStatus(payload);

  return {
    ...payload,
    service_type: firstPresent(payload?.service_type, payload?.serviceType, result?.service_type, result?.serviceType, 'payin'),
    status: normalizedStatus,
    normalized_status: normalizedStatus,
    orderId: firstPresent(payload?.orderId, payload?.order_id, result?.orderId, result?.order_id),
    order_id: firstPresent(payload?.order_id, payload?.orderId, result?.order_id, result?.orderId),
    gateway_order_id: firstPresent(payload?.gateway_order_id, payload?.gatewayOrderId, result?.gateway_order_id, result?.gatewayOrderId, result?.order_id, result?.orderId),
    merchant_order_id: firstPresent(payload?.merchant_order_id, payload?.merchantOrderId, result?.merchant_order_id, result?.merchantOrderId),
    reference_id: firstPresent(payload?.reference_id, payload?.referenceId, result?.reference_id, result?.referenceId),
    provider_request_id: firstPresent(payload?.provider_request_id, payload?.providerRequestId, result?.provider_request_id, result?.providerRequestId),
    provider_order_id: firstPresent(payload?.provider_order_id, payload?.providerOrderId, result?.provider_order_id, result?.providerOrderId),
    provider_reference: firstPresent(payload?.provider_reference, payload?.providerReference, result?.provider_reference, result?.providerReference),
    amount: firstPresent(payload?.amount, result?.amount),
    currency: firstPresent(payload?.currency, result?.currency, 'INR'),
    utr: firstPresent(payload?.utr, payload?.UTR, payload?.rrn, payload?.RRN, result?.utr, result?.UTR, result?.rrn, result?.RRN),
    proxy: {
      name: 'xpayout-callback-proxy-nextjs-standalone',
      forwardedAt: new Date().toISOString(),
      statusGuard: 'explicit transaction status wins over provider_message'
    }
  };
}

async function forwardToConnect(payload: any, req: NextRequest): Promise<any> {
  const isPayout = payload?.service_type === 'payout';
  const defaultTarget = isPayout ? DEFAULT_PAYOUT_TARGET_URL : DEFAULT_TARGET_URL;
  const envTarget = isPayout ? process.env.CONNECT_PAYOUT_CALLBACK_URL : process.env.CONNECT_CALLBACK_URL;
  const targetUrl = envTarget || defaultTarget;
  const timeoutMs = Number(process.env.FORWARD_TIMEOUT_MS || 2500);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const headers: any = {
    'Content-Type': 'application/json',
    'X-Proxy-Name': 'xpayout-callback-proxy-nextjs-standalone'
  };

  for (const headerName of ['x-gateway-signature', 'x-timestamp', 'x-callback-id', 'x-callback-token', 'authorization']) {
    const value = req.headers.get(headerName);
    if (value) headers[headerName] = value;
  }

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    const responseText = await response.text().catch(() => '');
    return {
      ok: response.ok,
      status: response.status,
      body: responseText.slice(0, 500),
      targetUrl
    };
  } catch (error: any) {
    return {
      ok: false,
      status: 0,
      error: error?.name === 'AbortError' ? `Forward timed out after ${timeoutMs}ms` : error?.message,
      targetUrl
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function handleRequest(req: NextRequest) {
  // Authentication check
  const configuredSecret = process.env.PROXY_SECRET;
  if (configuredSecret) {
    const providedSecret = req.headers.get('x-proxy-secret') || req.nextUrl.searchParams.get('proxySecret');
    if (providedSecret !== configuredSecret) {
      return NextResponse.json({ success: false, error: 'Invalid proxy secret' }, { status: 401 });
    }
  }

  const parsedBody = req.method === 'POST' ? await parseBody(req) : {};
  const incomingPayload = mergeQuery(parsedBody, req.nextUrl.searchParams);
  const forwardPayload = buildForwardPayload(incomingPayload);

  const forwardResult = await forwardToConnect(forwardPayload, req);

  return NextResponse.json({
    Message: 'OK',
    forwarded: forwardResult.ok,
    targetStatus: forwardResult.status,
    normalized_status: forwardPayload.normalized_status,
    target: forwardResult.targetUrl,
    error: forwardResult.error || undefined
  });
}

export async function POST(req: NextRequest) {
  return handleRequest(req);
}

export async function GET(req: NextRequest) {
  return handleRequest(req);
}

export async function OPTIONS() {
  return NextResponse.json({ Message: 'OK' });
}
