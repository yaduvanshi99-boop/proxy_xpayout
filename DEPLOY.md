# 🚀 Deploying the Next.js Proxy to Vercel

This proxy is now converted into a clean, modern, standalone **Next.js 15 application**. This ensures 100% deployment reliability on Vercel out-of-the-box.

## 📦 Simple 2-Step Deployment

### Step 1: Deploy to Vercel
Go to the `proxy/` directory in your terminal and run:

```bash
cd proxy
npx vercel
```
*Follow the on-screen prompts to link and deploy the project to your Vercel account.*

### Step 2: Configure Environment Variables
Inside your Vercel Project Dashboard, go to **Settings > Environment Variables** and add the following:

| Name | Value | Example |
| :--- | :--- | :--- |
| `CONNECT_CALLBACK_URL` | Your main Connect platform callback endpoint | `https://connect.payatme.com/api/callback/API-MP9K1VPD-3ZYQ` |
| `FORWARD_TIMEOUT_MS` | *(Optional)* Timeout for forwarding | `2500` |
| `PROXY_SECRET` | *(Optional)* Security token for authorization | `your-secret-key` |

---

## ⚡ Active API Endpoints

- **Gateway Callback Target**: `/api/callback` (Supports `POST`, `GET`, `OPTIONS`)
- **Health Check Status**: `/api/health`
- **Dashboard Interface**: `/` (Displays a real-time status page with configurations)
