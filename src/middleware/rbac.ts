class RBACMiddleware {
    constructor(private roles: string[]) {}

    checkRole(requiredRole: string): boolean {
        return this.roles.includes(requiredRole);
    }

    static createMiddleware(roles: string[]) {
        return (req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
            const rbac = new RBACMiddleware(roles);
            (req as any).rbac = rbac;
            next();
        };
    }
}

export default RBACMiddleware;