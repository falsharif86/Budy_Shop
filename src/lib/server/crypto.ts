import { randomBytes, scryptSync, createCipheriv, createDecipheriv } from 'node:crypto';
import { deflateRawSync, inflateRawSync } from 'node:zlib';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function deriveKey(secret: string, salt: Buffer): Buffer {
	return scryptSync(secret, salt, KEY_LENGTH);
}

/** JSON-serialize and encrypt data with AES-256-GCM. Returns a base64url string. */
export function seal(data: unknown, secret: string): string {
	const json = JSON.stringify(data);
	const compressed = deflateRawSync(json);
	const salt = randomBytes(SALT_LENGTH);
	const key = deriveKey(secret, salt);
	const iv = randomBytes(IV_LENGTH);

	const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
	const encrypted = Buffer.concat([cipher.update(compressed), cipher.final()]);
	const authTag = cipher.getAuthTag();

	// Format: salt (16) + iv (12) + authTag (16) + ciphertext
	const result = Buffer.concat([salt, iv, authTag, encrypted]);
	return result.toString('base64url');
}

/** Decrypt a sealed string and parse JSON. Returns null on any failure. */
export function unseal<T = unknown>(sealed: string, secret: string): T | null {
	try {
		const buf = Buffer.from(sealed, 'base64url');
		const minLength = SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH;
		if (buf.length < minLength) return null;

		const salt = buf.subarray(0, SALT_LENGTH);
		const iv = buf.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
		const authTag = buf.subarray(
			SALT_LENGTH + IV_LENGTH,
			SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
		);
		const encrypted = buf.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

		const key = deriveKey(secret, salt);
		const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
		decipher.setAuthTag(authTag);

		const compressed = Buffer.concat([decipher.update(encrypted), decipher.final()]);
		const json = inflateRawSync(compressed).toString('utf8');
		return JSON.parse(json);
	} catch {
		return null;
	}
}
