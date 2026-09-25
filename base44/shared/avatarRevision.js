import { invalid } from './apiContract.js';

export function avatarRevision(config) {
  const revision = config?.revision;
  if (revision === undefined) return 0; // Existing records are migrated on their next accepted save.
  if (!Number.isSafeInteger(revision) || revision < 0) throw invalid('Stored avatar revision is invalid');
  return revision;
}

export function assertExpectedRevision(expectedRevision, config) {
  if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
    throw invalid('expectedRevision must be a non-negative integer; reload your avatar before saving');
  }
  const currentRevision = avatarRevision(config);
  if (expectedRevision !== currentRevision) {
    throw Object.assign(new Error('Your saved avatar changed. Reload it before saving again; your draft was not saved.'), {
      status: 409, code: 'CONFLICT',
    });
  }
  if (currentRevision >= Number.MAX_SAFE_INTEGER) throw invalid('Avatar revision limit reached');
  return currentRevision + 1;
}

// Optimistic stale-state rejection, NOT an atomic compare-and-set guarantee.
// The identity argument must come from auth.me(), never a client target ID.
export async function writeRevisionedAvatar(base44, authenticatedUserId, expectedRevision, config) {
  const current = await base44.asServiceRole.entities.User.get(authenticatedUserId);
  const revision = assertExpectedRevision(expectedRevision, current.avatar_config);
  const next = { ...config, revision, updated_at: new Date().toISOString() };
  await base44.asServiceRole.entities.User.update(authenticatedUserId, { avatar_config: next });
  return next;
}