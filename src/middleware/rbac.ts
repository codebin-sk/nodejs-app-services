class RBACMiddleware {
    constructor(private roles: string[]) {}

    checkRole(requiredRole: string): boolean {
        return this.roles.includes(requiredRole);
    }

    static createMiddleware(roles: string[]) {
        return (req, res, next) => {
            const rbac = new RBACMiddleware(roles);
            req.rbac = rbac;
            next();
        };
    }
}

export default RBACMiddleware;