import { Request, Response, NextFunction } from 'express';
import { Role, Permission, ROLE_PERMISSIONS } from '../types';
import { ForbiddenError, UnauthorizedError } from '../errors/AppError';

/**
 * requireRole — restricts access to one or more roles.
 *
 * Usage:
 *   router.get('/admin', authenticate, requireRole(Role.SUPER_ADMIN, Role.SUB_ADMIN), handler)
 *   router.delete('/resource', authenticate, requireRole(Role.SUPER_ADMIN), handler)
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
        ),
      );
    }

    next();
  };
}

/**
 * requirePermission — fine-grained permission check derived from the role matrix.
 *
 * Usage:
 *   router.delete('/courses/:id', authenticate, requirePermission(Permission.COURSE_DELETE), handler)
 *   router.post('/courses',       authenticate, requirePermission(Permission.COURSE_CREATE), handler)
 */
export function requirePermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] ?? [];

    const hasAll = permissions.every((p) => userPermissions.includes(p));

    if (!hasAll) {
      const missing = permissions.filter((p) => !userPermissions.includes(p));
      return next(
        new ForbiddenError(`Missing permission(s): ${missing.join(', ')}`),
      );
    }

    next();
  };
}

/**
 * requireAnyPermission — passes if the user has at least ONE of the given permissions.
 */
export function requireAnyPermission(...permissions: Permission[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const userPermissions = ROLE_PERMISSIONS[req.user.role] ?? [];
    const hasAny = permissions.some((p) => userPermissions.includes(p));

    if (!hasAny) {
      return next(new ForbiddenError('Insufficient permissions for this action'));
    }

    next();
  };
}

/**
 * requireOwnerOrRole — allows access if the requester owns the resource OR has an elevated role.
 *
 * Usage:
 *   router.put('/users/:id', authenticate, requireOwnerOrRole('id', Role.ADMIN), handler)
 */
export function requireOwnerOrRole(paramKey: string, ...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const resourceOwnerId = req.params[paramKey];
    const isOwner = req.user.id === resourceOwnerId;
    const hasRole = roles.includes(req.user.role);

    if (!isOwner && !hasRole) {
      return next(new ForbiddenError('You can only access your own resources'));
    }

    next();
  };
}
