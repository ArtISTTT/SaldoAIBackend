
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const IV_LENGTH = 16;

export function encrypt(text: string): string {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }

  const key = Buffer.from(ENCRYPTION_KEY, 'base64');
  if (key.length !== 32) {
    throw new Error(`ENCRYPTION_KEY must decode to 32 bytes, got ${key.length}`);
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(text: string): string {
  const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

  if (!text) {
    throw new Error('Text to decrypt is required');
  }

  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }

  const key = Buffer.from(ENCRYPTION_KEY, 'base64');

  const [ivHex, encryptedHex] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const encryptedText = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
