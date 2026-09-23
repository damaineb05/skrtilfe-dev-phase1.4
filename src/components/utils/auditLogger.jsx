/**
 * Audit Logger - Centralized compliance logging
 */

import { base44 } from '@/api/base44Client';

class AuditLogger {
  async log({ actor, action, entityType, entityId, beforeState = null, afterState = null, status = 'success', errorMessage = null, metadata = {} }) {
    try {
      const logEntry = {
        actor_email: actor?.email || 'anonymous',
        actor_role: actor?.role || 'unknown',
        action, entity_type: entityType, entity_id: entityId,
        before_state: beforeState, after_state: afterState,
        ip_address: metadata.ip || 'unknown',
        user_agent: navigator?.userAgent || 'unknown',
        status, error_message: errorMessage,
        metadata: { ...metadata, timestamp: new Date().toISOString(), page: window?.location?.pathname }
      };
      await base44.entities.AuditLog.create(logEntry);
      if (import.meta.env.DEV) console.log('🔍 AUDIT:', logEntry);
    } catch (error) {
      console.error('Audit log failed:', error);
    }
  }

  async success({ actor, action, entityType, entityId, afterState, metadata = {} }) {
    return this.log({ actor, action, entityType, entityId, afterState, status: 'success', metadata });
  }

  async failure({ actor, action, entityType, entityId, error, metadata = {} }) {
    return this.log({ actor, action, entityType, entityId, status: 'failed', errorMessage: error?.message || String(error), metadata });
  }

  async unauthorized({ actor, action, entityType, entityId, metadata = {} }) {
    return this.log({ actor, action, entityType, entityId, status: 'unauthorized', errorMessage: 'User lacks required permissions', metadata });
  }

  async queryLogs({ entityType, entityId, actor, action, limit = 50 }) {
    const filters = {};
    if (entityType) filters.entity_type = entityType;
    if (entityId) filters.entity_id = entityId;
    if (actor) filters.actor_email = actor;
    if (action) filters.action = action;
    return base44.entities.AuditLog.filter(filters, '-created_date', limit);
  }
}

export const auditLogger = new AuditLogger();

export const withAudit = (actionName, entityType) => (fn) => async (...args) => {
  const [actor, entityId, data] = args;
  try {
    const result = await fn(...args);
    await auditLogger.success({ actor, action: actionName, entityType, entityId, afterState: data });
    return result;
  } catch (error) {
    await auditLogger.failure({ actor, action: actionName, entityType, entityId, error });
    throw error;
  }
};