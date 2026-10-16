const encoder = new TextEncoder();
export const hex = bytes => Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, '0')).join('');
export const digest = async value => hex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
export async function passwordHash(password, saltHex) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const salt = Uint8Array.from(saltHex.match(/../g), x => parseInt(x, 16));
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2', hash:'SHA-256', iterations:100000, salt}, key, 256));
}
export async function passwordMatches(password, encoded) {
  if (typeof password !== 'string' || password.length > 200 || !/^[a-f0-9]{32}\.[a-f0-9]{64}$/.test(encoded || '')) return false;
  const [salt, expected] = encoded.split('.');
  const actual = await passwordHash(password, salt);
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
export const newToken = () => hex(crypto.getRandomValues(new Uint8Array(32)));
