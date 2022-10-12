import { CtxUser } from '../services/apollo/index';

export const hasRole = (user: CtxUser, roleName: string): boolean => {
    return !!user.userRoles.find(el => el.roleName === roleName)
};