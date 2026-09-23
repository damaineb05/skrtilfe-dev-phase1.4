/**
 * RBAC Service - Role-Based Access Control
 */

export const PERMISSIONS = {
  USER_READ_OWN: 'user:read:own', USER_UPDATE_OWN: 'user:update:own', USER_DELETE_OWN: 'user:delete:own',
  PRODUCT_READ: 'product:read', PRODUCT_CREATE: 'product:create', PRODUCT_UPDATE: 'product:update', PRODUCT_DELETE: 'product:delete',
  ORDER_READ_OWN: 'order:read:own', ORDER_READ_ALL: 'order:read:all', ORDER_UPDATE: 'order:update', ORDER_REFUND: 'order:refund',
  NFT_READ: 'nft:read', NFT_MINT: 'nft:mint', NFT_TRANSFER: 'nft:transfer', NFT_BURN: 'nft:burn',
  ADMIN_PANEL: 'admin:panel', ADMIN_USERS: 'admin:users', ADMIN_CONTENT: 'admin:content', ADMIN_ANALYTICS: 'admin:analytics', ADMIN_AUDIT: 'admin:audit',
  SYSTEM_CONFIG: 'system:config', SYSTEM_SECRETS: 'system:secrets',
};

export const ROLES = {
  user: { name: 'User', permissions: [PERMISSIONS.USER_READ_OWN, PERMISSIONS.USER_UPDATE_OWN, PERMISSIONS.PRODUCT_READ, PERMISSIONS.ORDER_READ_OWN, PERMISSIONS.NFT_READ, PERMISSIONS.NFT_MINT, PERMISSIONS.NFT_TRANSFER] },
  creator: { name: 'Creator', inherits: ['user'], permissions: [PERMISSIONS.PRODUCT_CREATE, PERMISSIONS.PRODUCT_UPDATE, PERMISSIONS.NFT_MINT, PERMISSIONS.NFT_BURN] },
  admin: { name: 'Admin', inherits: ['creator'], permissions: [PERMISSIONS.PRODUCT_DELETE, PERMISSIONS.ORDER_READ_ALL, PERMISSIONS.ORDER_UPDATE, PERMISSIONS.ORDER_REFUND, PERMISSIONS.ADMIN_PANEL, PERMISSIONS.ADMIN_USERS, PERMISSIONS.ADMIN_CONTENT, PERMISSIONS.ADMIN_ANALYTICS, PERMISSIONS.ADMIN_AUDIT, PERMISSIONS.SYSTEM_CONFIG] },
  superadmin: { name: 'Super Admin', inherits: ['admin'], permissions: [PERMISSIONS.USER_DELETE_OWN, PERMISSIONS.SYSTEM_SECRETS] }
};

class RBACService {
  getPermissionsForRole(roleName) {
    const role = ROLES[roleName];
    if (!role) return [];
    const permissions = new Set(role.permissions);
    if (role.inherits) role.inherits.forEach(r => this.getPermissionsForRole(r).forEach(p => permissions.add(p)));
    return Array.from(permissions);
  }

  hasPermission(user, permission) {
    if (!user?.role) return false;
    return this.getPermissionsForRole(user.role).includes(permission);
  }

  hasAnyPermission(user, permissions) {
    return permissions.some(p => this.hasPermission(user, p));
  }

  hasAllPermissions(user, permissions) {
    return permissions.every(p => this.hasPermission(user, p));
  }

  requirePermission(user, permission) {
    if (!this.hasPermission(user, permission)) throw new Error(`Unauthorized: Missing permission ${permission}`);
    return true;
  }

  filterOwned(items, user, ownerField = 'created_by') {
    if (this.hasPermission(user, PERMISSIONS.ORDER_READ_ALL)) return items;
    return items.filter(item => item[ownerField] === user.email || item[ownerField] === user.id);
  }
}

export const rbacService = new RBACService();

export const usePermissions = (user) => ({
  hasPermission: (permission) => rbacService.hasPermission(user, permission),
  hasAnyPermission: (permissions) => rbacService.hasAnyPermission(user, permissions),
  hasAllPermissions: (permissions) => rbacService.hasAllPermissions(user, permissions),
  isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
  isCreator: user?.role === 'creator' || user?.role === 'admin' || user?.role === 'superadmin',
});