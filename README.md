# Secure Shopify Custom Payment Page (OAuth + App Proxy)

A production-ready Custom App providing a premium storefront payment page. Customers enter an amount, fill in their details, and are instantly redirected to a secure Shopify Payments checkout without manual invoices.

## 1. Setup Instructions
1. Clone the repository and run `npm install`.
2. Copy `.env.example` to `.env`.

## 2. Shopify App Configuration (Partners Dashboard)
1. Go to your **Shopify Partners Dashboard** -> **Apps** -> **Create App** -> **Create App Manually**.
2. Go to **Client Credentials**. Copy the `Client ID` and `Client Secret` into your `.env` file.
3. Under **App Setup** -> **URLs**:
   - **App URL:** `https://your-render-app-url.onrender.com/auth`
   - **Allowed redirection URL(s):** `https://your-render-app-url.onrender.com/auth/callback`

## 3. App Proxy Configuration
In the same App Setup screen, scroll down to **App Proxy**:
- **Subpath prefix:** `apps`
- **Subpath:** `custom-pay` (or your preference)
- **Proxy URL:** `https://your-render-app-url.onrender.com/proxy/` (Crucial: note the `/proxy/` path)

## 4. Render Deployment Steps
1. Create a new **Web Service** on Render connected to your Git repository.
2. Build Command: `npm install`
3. Start Command: `node server.js`
4. Add all environment variables from `.env` to the Render Environment section.
   - *Ensure `SHOPIFY_APP_URL` matches your actual Render `.onrender.com` domain.*
   - Set `NODE_ENV=production`.
5. **Important Note on Render Free Tier:** Render's free tier uses ephemeral file systems. Because this MVP utilizes a lightweight JSON file (`database.json`) to store OAuth tokens, the token will be lost if Render spins down the server. For true production environments, either upgrade to a Render plan with a Persistent Disk mounted at `/var/data` (and point `dbPath` to it), or swap `dbService.js` to use Postgres/MongoDB. 

## 5. App Installation & Testing
1. In your Partner Dashboard, click **Select Store** and install your app on a development store.
2. You will be redirected through the OAuth flow and eventually land on the Admin Apps page. At this point, `database.json` has securely saved your store's `access_token`.
3. Open your storefront URL: `https://your-dev-store.myshopify.com/apps/custom-pay`
4. You will see the premium payment form.
5. Fill it out and submit—you will be instantly redirected to the Shopify checkout pre-loaded with the exact amount. No emails required!