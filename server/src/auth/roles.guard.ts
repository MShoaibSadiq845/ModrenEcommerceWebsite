import {
  Injectable,
  CanActivate,
  ExecutionContext,
  mixin,
  Type,
} from '@nestjs/common';
import { UserRole } from '../users/schemas/user.schema';

/**
 * RoleGuard(role1, role2, ...) — creates a self-contained guard that does NOT
 * depend on Reflector or APP_GUARD DI. Each call creates a separate class so
 * the allowed roles are baked in at decoration time.
 *
 * Usage:
 *   @UseGuards(AuthGuard('jwt'), RoleGuard(UserRole.ADMIN, UserRole.SUPER_ADMIN))
 */
export const RoleGuard = (...roles: UserRole[]): Type<CanActivate> => {
  @Injectable()
  class MixinRoleGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
      if (!roles || roles.length === 0) return true;
      const { user } = context.switchToHttp().getRequest();
      if (!user || !user.role) return false;
      const userRole = String(user.role).trim().toLowerCase();
      return roles.some((r) => String(r).trim().toLowerCase() === userRole);
    }
  }
  return mixin(MixinRoleGuard);
};

// Keep RolesGuard as alias for backward compat (not used anymore)
export { RoleGuard as RolesGuard };
