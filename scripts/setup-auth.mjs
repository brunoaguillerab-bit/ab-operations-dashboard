/**
 * setup-auth.mjs — Generate a hashed password entry for .env.local
 *
 * Usage:
 *   node scripts/setup-auth.mjs <username> <password> [role]
 *
 * Examples:
 *   node scripts/setup-auth.mjs bruno minhasenha123 admin
 *   node scripts/setup-auth.mjs ana anasenha editor
 *   node scripts/setup-auth.mjs viewer123 senha viewer
 *
 * Roles: admin | editor | viewer
 *   admin  — acesso total, pode disparar n8n
 *   editor — pode disparar n8n, somente leitura em configs
 *   viewer — somente leitura
 */

import { scryptSync, randomBytes } from 'crypto';
import { randomUUID } from 'crypto';

const [,, username, password, role = 'editor'] = process.argv;

if (!username || !password) {
  console.error('\n❌  Uso: node scripts/setup-auth.mjs <username> <password> [role]\n');
  process.exit(1);
}

if (!['admin', 'editor', 'viewer'].includes(role)) {
  console.error(`\n❌  Role inválida: "${role}". Use: admin | editor | viewer\n`);
  process.exit(1);
}

const salt = randomBytes(16).toString('hex');
const hash = scryptSync(password, salt, 64).toString('hex');
const passwordHash = `${salt}:${hash}`;
const id = randomUUID();

const user = { id, username, passwordHash, role };

console.log('\n✅  Hash gerado com sucesso!\n');
console.log('Adicione ao AUTH_USERS_JSON no .env.local:');
console.log('─'.repeat(60));
console.log(JSON.stringify(user, null, 2));
console.log('─'.repeat(60));
console.log('\nFormato para múltiplos usuários no .env.local:');
console.log('─'.repeat(60));
console.log(`AUTH_USERS_JSON=[${JSON.stringify(user)}]`);
console.log('─'.repeat(60));
console.log('\n⚠️   NUNCA compartilhe o .env.local ou commite no git.\n');
