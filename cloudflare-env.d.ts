declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    RESERVATION_ADMIN_CODE?: string;
  }
}
