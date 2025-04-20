import { registerAs } from '@nestjs/config';

export default registerAs('b2', () => ({
  b2KeyId: process.env.B2_ACCESS_KEY_ID,
  b2Key: process.env.B2_SECRET_ACCESS_KEY,
  bucket: process.env.B2_BUCKET_NAME,
  endpoint: process.env.B2_ENDPOINT,
  region: process.env.B2_REGION,
  publicUrl: process.env.B2_PUBLIC_URL_BASE,
}));
