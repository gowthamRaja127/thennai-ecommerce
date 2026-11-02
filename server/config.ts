/** Server configuration, read lazily so values loaded into process.env after import still apply. */
export const config = {
  get razorpayKeyId() {
    return process.env.RAZORPAY_KEY_ID ?? '';
  },
  get razorpayKeySecret() {
    return process.env.RAZORPAY_KEY_SECRET ?? '';
  },
  get razorpayWebhookSecret() {
    return process.env.RAZORPAY_WEBHOOK_SECRET ?? '';
  },
  get razorpayEnabled() {
    return Boolean(this.razorpayKeyId && this.razorpayKeySecret);
  },
  get codEnabled() {
    return (process.env.ENABLE_COD ?? 'true').toLowerCase() !== 'false';
  },
  get supabaseUrl() {
    return process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
  },
  /** Service-role key: server only, never expose to the browser. */
  get supabaseServiceKey() {
    return process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  },
  get supabaseEnabled() {
    return Boolean(this.supabaseUrl && this.supabaseServiceKey);
  },
  get dataDir() {
    return process.env.ORDER_DATA_DIR ?? 'server/.data';
  },
  get port() {
    return Number(process.env.PORT ?? 8787);
  },
};
