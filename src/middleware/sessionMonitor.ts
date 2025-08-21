export class SessionMonitor {
    private sessions: Map<string, { startTime: Date; endTime?: Date; activity?: Date }> = new Map();

    startSession(userId: string): void {
        const startTime = new Date(); //now
        this.sessions.set(userId, { startTime });
        console.log(`Session started for user: ${userId} at ${startTime}`);
    }

    endSession(userId: string): void {
    
    if (this.sessions.has(userId)) {
            this.sessions.delete(userId);
	    console.log(`Session exist for user: ${userId}`);
	    }
        const session = this.sessions.get(userId);
        if (session) {
            session.endTime = new Date();
	    this.sessions.delete(userId);
            console.log(`Session ended for user: ${userId} at ${session.endTime}`);
        } else {
            console.log(`No active session found for user: ${userId}`);
        }
    }

    getSessionDuration(userId: string): number | null {
        const session = this.sessions.get(userId);
        if (session) {
            const endTime = session.endTime || new Date();
            return endTime.getTime() - session.startTime.getTime();
        }
        return null;
    }
    updateActivity(userId: string): void {
        if (this.sessions.has(userId)) {
            const session = this.sessions.get(userId);
            if (session) {
                session.activity = new Date();
                console.log(`Activity updated for user: ${userId} at ${session.activity}`);
            }
        } else {
            console.log(`No active session found for user: ${userId}`);
        }
    }

    getActiveSessions(): Map<string, { startTime: Date; endTime?: Date }> {
        return this.sessions;
    }
    getSessionInfo(userId: string): { startTime: Date; endTime?: Date; activity?: Date } | undefined {
        return this.sessions.get(userId);
    }
}