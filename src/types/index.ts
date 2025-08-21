export interface User {
    id: string;
    username: string;
    roles: Role[];
    attributes: Record<string, any>;
}

export interface Role {
    id: string;
    name: string;
    permissions: string[];
}

export interface Session {
    sessionId: string;
    userId: string;
    startTime: Date;
    endTime?: Date;
    activityLog: string[];
    createdAt: Date;
    expiresAt: Date;
    activityLogStr: Activity[];
}

export interface Activity {
    action: string;
    timestamp: Date;
}