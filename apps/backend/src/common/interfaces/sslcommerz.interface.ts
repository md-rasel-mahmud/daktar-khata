// TypeScript interfaces for SSLCommerz "payment initiate" payload
// Adjust optional/required fields based on your integration and SSLCommerz docs.

export type Currency = "BDT" | "USD" | "EUR" | string; // allow custom currencies too

export interface CartItem {
  // A single cart item (optional; some integrations send cart info)
  product: string;
  amount: number;
  quantity?: number;
  sku?: string;
  category?: string;
}

export interface SSLCommerzInitPayload {
  // Merchant credentials
  store_id: string;
  store_passwd: string;

  // Transaction details
  total_amount: number; // required: total transaction amount
  currency?: Currency; // default BDT if omitted
  tran_id: string; // unique merchant transaction id

  // URLs
  success_url: string;
  fail_url: string;
  cancel_url: string;
  ipn_url?: string; // optional Instant Payment Notification (server-to-server)

  // Product / cart
  product_name?: string;
  product_category?: string;
  product_profile?: string; // e.g. "general" | "physical-goods" | "non-physical"
  cart?: CartItem[]; // optional detailed cart

  // Customer info (recommended)
  cus_name?: string;
  cus_email?: string;
  cus_add1?: string;
  cus_add2?: string;
  cus_city?: string;
  cus_state?: string;
  cus_postcode?: string;
  cus_country?: string;
  cus_phone?: string;

  // Shipping (optional)
  ship_name?: string;
  ship_add1?: string;
  ship_add2?: string;
  ship_city?: string;
  ship_state?: string;
  ship_postcode?: string;
  ship_country?: string;

  // Optional extras (common)
  value_a?: string;
  value_b?: string;
  value_c?: string;
  value_d?: string;

  // Risk / payment options
  multi_card_name?: string; // comma separated card names allowed/preferred
  allowed_bin?: string; // comma separated BIN prefixes (if using)
  emi_option?: number; // 0 or 1
  emi_max_inst_option?: number; // maximum EMI installment option
  emi_selected_inst?: number;

  // Charges breakdown (optional)
  product_amount?: number;
  vat?: number;
  discount_amount?: number;
  convenience_fee?: number;

  // Any other custom fields your merchant uses
  [key: string]: unknown;
}

// TypeScript type for SSLCommerz payment validation / IPN response
export interface SSLCommerzValidateResponse {
  amount: string;
  bank_tran_id: string;
  base_fair: string;
  card_brand: string;
  card_issuer: string;
  card_issuer_country: string;
  card_issuer_country_code: string;
  card_no: string;
  card_sub_brand: string;
  card_type: string;
  currency: string;
  currency_amount: string;
  currency_rate: string;
  currency_type: string;
  error: string;
  risk_level: string;
  risk_title: string;
  status: string; // e.g. "VALID", "FAILED", etc.
  store_amount: string;
  store_id: string;
  tran_date: string; // e.g. "2025-10-18 00:14:19"
  tran_id: string;
  val_id: string;
  value_a: string;
  value_b: string;
  value_c: string;
  value_d: string;
  verify_sign: string;
  verify_sign_sha2: string;
  verify_key: string; // comma-separated list of signed fields

  // Optional extra fields (not always present)
  risk_level_description?: string;
  card_ref_id?: string;
  verify_by?: string;
  [key: string]: unknown; // allow unknown extra fields for flexibility
}
