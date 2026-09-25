// Canonical record contract shared by lookup and grant paths.
// Legacy email/status rows remain untouched; reconciliation must establish user_id
// and is_active explicitly before they can authorize access. No flag-only server grant.
export function activeGenesisQuery(userId) {
  if (typeof userId !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(userId)) {
    throw Object.assign(new Error('Genesis lookup requires a stable user ID'), { status: 400 });
  }
  return { user_id: userId, is_active: true };
}