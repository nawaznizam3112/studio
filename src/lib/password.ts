import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, plainPassword?: string, passwordHash?: string): boolean {
  if (passwordHash && passwordHash.includes(':')) {
    const [salt, hash] = passwordHash.split(':');
    const expected = Buffer.from(hash, 'hex');
    const actual = Buffer.from(scryptSync(password, salt, 64).toString('hex'), 'hex');
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }
  return plainPassword === password;
}
