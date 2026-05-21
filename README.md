# XPayout Callback Proxy

Deploy this folder as a separate Vercel project. XPayout should send callbacks to:

```text
https://your-proxy-domain.vercel.app/api/callback
```

The proxy forwards the callback to your Connect website:

```text
https://connect.payatme.com/api/callback/API-MP9K1VPD-3ZYQ
```

## Why This Proxy Exists

Some gateway responses contain `provider_message: "success"` even when the real transaction status is still `processing`. This proxy guards that case:

- `status: "processing"` stays processing.
- `provider_message: "success"` alone does not mark the transaction successful.
- The transaction becomes success only when explicit status fields say success, completed, paid, credited, etc.

## Environment Variables

Set these in Vercel Project Settings:

```text
CONNECT_CALLBACK_URL=https://connect.payatme.com/api/callback/API-MP9K1VPD-3ZYQ
FORWARD_TIMEOUT_MS=2500
PROXY_SECRET=
```

`PROXY_SECRET` is optional. If you set it, callers must include:

```text
X-Proxy-Secret: your-secret
```

## Test

```bash
curl -X POST "https://your-proxy-domain.vercel.app/api/callback" \
  -H "Content-Type: application/json" \
  -d '{
    "service_type": "payin",
    "status": "processing",
    "provider_message": "success",
    "merchant_order_id": "PAY593573280695192580",
    "gateway_order_id": "GW202605191327323676",
    "amount": "200.00"
  }'
```

Expected proxy response:

```json
{
  "Message": "OK",
  "forwarded": true,
  "normalized_status": "processing"
}
```

## Deploy

From this `proxy` folder:

```bash
npm install
npx vercel
```

Use the production deployment URL as the callback URL in XPayout.
