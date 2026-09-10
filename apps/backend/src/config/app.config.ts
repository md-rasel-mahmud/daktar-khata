const appConfig = () => ({
  environment: process.env.NODE_ENV || "development",
  jwt_secret: process.env.JWT_SECRET,
  access_token_expiration_minute: process.env.JWT_ACCESS_EXPIRATION_MINUTES,
  access_token_expiration_days: process.env.JWT_ACCESS_EXPIRATION_DAYS,
  refresh_token_expiration_days: process.env.JWT_REFRESH_EXPIRATION_DAYS,
  master_password: process.env.MASTER_PASSWORD,
  sslcommerz: {
    store_id: process.env.SSLC_STORE_ID,
    store_passwd: process.env.SSLC_STORE_PASS,
    sandbox: process.env.SSLC_IS_SANDBOX || "true",
    whitelist_ips: process.env.SSLC_WHITELIST_IPS || "", // comma separated
    hmac_secret: process.env.SSLC_HMAC_SECRET || process.env.SSLC_STORE_PASS,
  },
  payment: {
    max_retry: parseInt(process.env.PAYMENT_MAX_RETRY || "3", 10),
  },
  frontend_url: process.env.FRONTEND_URL || "http://localhost:3000",
  backend_url: process.env.APP_URL || "http://localhost:7711",
});

export type AppConfigType = ReturnType<typeof appConfig>;

type BooleanEnum = "true" | "false";

export type SSLCommerzConfig = {
  store_id: string;
  store_passwd: string;
  sandbox: BooleanEnum;
  whitelist_ips: string;
  hmac_secret: string;
};

export { appConfig };
