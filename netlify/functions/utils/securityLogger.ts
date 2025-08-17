// Configuration des logs de sécurité
export interface SecurityLogData {
  event: 'login_attempt' | 'login_success' | 'login_failure' | 'unauthorized_access' | 
         'token_validation_failed' | 'rate_limit_exceeded' | 'suspicious_activity';
  userId?: string;
  ip: string;
  userAgent?: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

class SecurityLogger {
  private logSecurityEvent(data: SecurityLogData): void {
    const logEntry = {
      ...data,
      level: this.getLogLevel(data.event),
      timestamp: data.timestamp.toISOString()
    };

    // En production, utiliser un service de logging externe (DataDog, Sentry, etc.)
    if (this.isSuspiciousEvent(data.event)) {
      console.warn('🚨 SECURITY ALERT:', JSON.stringify(logEntry));
      // Ici, envoyer une alerte aux administrateurs
    } else {
      console.info('🔒 SECURITY LOG:', JSON.stringify(logEntry));
    }
  }

  private getLogLevel(event: SecurityLogData['event']): 'info' | 'warn' | 'error' {
    switch (event) {
      case 'login_success':
        return 'info';
      case 'login_failure':
      case 'unauthorized_access':
      case 'token_validation_failed':
        return 'warn';
      case 'rate_limit_exceeded':
      case 'suspicious_activity':
        return 'error';
      default:
        return 'info';
    }
  }

  private isSuspiciousEvent(event: SecurityLogData['event']): boolean {
    return ['rate_limit_exceeded', 'suspicious_activity', 'unauthorized_access'].includes(event);
  }

  public logLoginAttempt(ip: string, email: string, success: boolean, userAgent?: string): void {
    this.logSecurityEvent({
      event: success ? 'login_success' : 'login_failure',
      ip,
      userAgent,
      timestamp: new Date(),
      details: { email }
    });
  }

  public logUnauthorizedAccess(ip: string, path: string, userAgent?: string): void {
    this.logSecurityEvent({
      event: 'unauthorized_access',
      ip,
      userAgent,
      timestamp: new Date(),
      details: { path }
    });
  }

  public logTokenValidationFailed(ip: string, token: string, userAgent?: string): void {
    this.logSecurityEvent({
      event: 'token_validation_failed',
      ip,
      userAgent,
      timestamp: new Date(),
      details: { tokenPrefix: token.substring(0, 10) + '...' }
    });
  }

  public logRateLimitExceeded(ip: string, path: string): void {
    this.logSecurityEvent({
      event: 'rate_limit_exceeded',
      ip,
      timestamp: new Date(),
      details: { path }
    });
  }
}

export const securityLogger = new SecurityLogger();
