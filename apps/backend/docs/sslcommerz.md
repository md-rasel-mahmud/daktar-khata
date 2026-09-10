SSLCommerz integration (sandbox/demo)

Required environment variables (add to your .env):

- SSLC_STORE_ID: your sandbox store id (example from SSLCommerz)
- SSLC_STORE_PASS: your sandbox store password
- SSLC_IS_SANDBOX: 'true' or 'false' (default true)
- APP_URL: base URL where your app runs (e.g. http://localhost:3000) - used to build success/fail/cancel/ipn URLs

Notes:

- Initiate payment: POST /payment/initiate (authenticated merchant)
  - Body: { amount, subscriptionId }
  - Response includes `gatewayUrl` to redirect the user to.
- SSLCommerz will call your configured success/fail endpoints. The demo uses /payment/success and /payment/fail.
- After receiving `val_id` from the gateway, the service calls SSLCommerz validation API to verify the payment and then activates the related subscription.

Testing locally:

- If you don't have public webhooks, use a tunnel (ngrok) and set APP_URL to the tunneled address.
- Use sandbox credentials from SSLCommerz to do end-to-end testing.
