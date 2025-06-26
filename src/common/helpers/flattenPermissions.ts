import { Permission } from '@modules/auth/domain/enums/permission.enum';
import { Role } from '@modules/auth/domain/entities/role.entity';

const flattenPermissions = (roles: Role[]): Permission[] => {
  const permissionsSet = new Set<Permission>();

  roles.forEach((role) => {
    role.permissions.forEach((permission) => {
      permissionsSet.add(permission);
    });
  });

  return Array.from(permissionsSet);
};

export default flattenPermissions;
