export class SessionManager {
  private static instance: SessionManager;
  private sessionId: string | null = null;
  private heartbeatInterval: number | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000;
  private readonly SESSION_KEY = "user-session-id";

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  public async startSession(userId: string): Promise<boolean> {
    try {
      const existingSession = await this.checkExistingSession(userId);

      if (existingSession && existingSession !== this.sessionId) {
        throw new Error("User is already logged in on another device");
      }

      await this.registerSession(userId, this.sessionId!);

      this.startHeartbeat(userId);

      localStorage.setItem(this.SESSION_KEY, this.sessionId!);

      return true;
    } catch (error) {
      console.error("Failed to start session:", error);
      throw error;
    }
  }

  public async endSession(userId: string): Promise<void> {
    try {
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      if (this.sessionId) {
        await this.unregisterSession(userId, this.sessionId);
        localStorage.removeItem(this.SESSION_KEY);
        this.sessionId = null;
      }
    } catch (error) {
      console.error("Failed to end session:", error);
    }
  }

  public async terminateSession(
    userId: string,
    sessionId: string
  ): Promise<void> {
    try {
      await this.unregisterSession(userId, sessionId);
    } catch (error) {
      console.error("Failed to terminate session:", error);
      throw error;
    }
  }

  private startHeartbeat(userId: string): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = window.setInterval(async () => {
      try {
        await this.sendHeartbeat(userId, this.sessionId!);
      } catch (error) {
        console.error("Heartbeat failed:", error);
        this.handleSessionConflict();
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  private handleSessionConflict(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    localStorage.removeItem(this.SESSION_KEY);

    localStorage.setItem("session-terminated", "true");
    window.location.href = "/login";
  }

  private async checkExistingSession(userId: string): Promise<string | null> {
    const mockSessions = JSON.parse(
      localStorage.getItem("mock-sessions") || "{}"
    );
    return mockSessions[userId] || null;
  }

  private async registerSession(
    userId: string,
    sessionId: string
  ): Promise<void> {
    const mockSessions = JSON.parse(
      localStorage.getItem("mock-sessions") || "{}"
    );
    mockSessions[userId] = sessionId;
    localStorage.setItem("mock-sessions", JSON.stringify(mockSessions));
  }

  private async unregisterSession(
    userId: string,
    sessionId: string
  ): Promise<void> {
    const mockSessions = JSON.parse(
      localStorage.getItem("mock-sessions") || "{}"
    );
    if (mockSessions[userId] === sessionId) {
      delete mockSessions[userId];
    }
    localStorage.setItem("mock-sessions", JSON.stringify(mockSessions));
  }

  private async sendHeartbeat(
    userId: string,
    sessionId: string
  ): Promise<void> {
    const currentSession = await this.checkExistingSession(userId);
    if (currentSession !== sessionId) {
      throw new Error("Session no longer valid");
    }
  }

  public getSessionId(): string | null {
    return this.sessionId;
  }

  public isSessionActive(): boolean {
    return this.sessionId !== null && this.heartbeatInterval !== null;
  }
}
