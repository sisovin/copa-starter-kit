"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

type AuditAction =
  | "payment_initiated"
  | "payment_completed"
  | "payment_failed"
  | "refund_initiated"
  | "refund_completed"
  | "account_verified"
  | "email_verified"
  | "phone_verified"
  | "user_login"
  | "user_logout"
  | "admin_action"
  | "siwe_login"
  | "profile_updated";

type AuditLogEntry = {
  userId: string;
  action: AuditAction;
  details?: Record<string, any>;
  ipAddress?: string;
  timestamp: Date;
};

interface AuthAuditContextType {
  logAction: (
    action: AuditAction,
    details?: Record<string, any>
  ) => Promise<void>;
  verificationStatus: {
    emailVerified: boolean;
    phoneVerified: boolean;
  };
  sessionExpired: boolean;
  handleSessionExpired: () => void;
  isSIWEEnabled: boolean;
  isAdmin: boolean;
}

const AuthAuditContext = createContext<AuthAuditContextType | null>(null);

export function AuthAuditLogProvider({ children }: { children: ReactNode }) {
  const { userId, sessionId, getToken } = useAuth();
  const { user, isLoaded } = useUser();
  const [sessionExpired, setSessionExpired] = useState(false);
  const [ipAddress, setIpAddress] = useState<string | null>(null);

  // Determine verification status
  const emailVerified =
    user?.emailAddresses?.some(
      (email) => email.verification?.status === "verified"
    ) || false;
  const phoneVerified =
    user?.phoneNumbers?.some(
      (phone) => phone.verification?.status === "verified"
    ) || false;

  // Check if user has admin role
  const isAdmin = user?.publicMetadata?.role === "admin";

  // Check if SIWE is enabled
  const isSIWEEnabled = !!process.env.NEXT_PUBLIC_ENABLE_SIWE;

  // Fetch client IP address (for audit logs)
  useEffect(() => {
    async function getIpAddress() {
      try {
        const res = await fetch("https://api.ipify.org?format=json");
        const data = await res.json();
        setIpAddress(data.ip);
      } catch (error) {
        console.error("Failed to fetch IP address:", error);
      }
    }

    getIpAddress();
  }, []);

  // Monitor session status
  useEffect(() => {
    if (!isLoaded) return;

    // If session is loaded but no user, consider session expired
    if (isLoaded && !user && sessionId) {
      setSessionExpired(true);
    } else {
      setSessionExpired(false);
    }

    // Log login event if user just became available
    if (user && isLoaded) {
      logAction("user_login").catch(console.error);
    }
  }, [user, isLoaded, sessionId]);

  /**
   * Log an audit action
   *
   * @param action The action being performed
   * @param details Additional details about the action
   */
  async function logAction(
    action: AuditAction,
    details?: Record<string, any>
  ): Promise<void> {
    if (!userId) return;

    try {
      const auditLog: AuditLogEntry = {
        userId,
        action,
        details,
        ipAddress: ipAddress || undefined,
        timestamp: new Date(),
      };

      // For sensitive payment actions, include additional verification requirements
      const requiresVerification = [
        "payment_initiated",
        "payment_completed",
        "refund_initiated",
      ].includes(action);

      if (requiresVerification && !emailVerified) {
        throw new Error("Email verification required for payment actions");
      }

      // In a production environment, send this to your backend
      // This could store in a database, or use a service like Axiom/Sentry
      console.log("Audit log:", auditLog);

      // Example of sending to a hypothetical API endpoint
      // const token = await getToken();
      // await fetch('/api/audit-log', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${token}`
      //   },
      //   body: JSON.stringify(auditLog)
      // });
    } catch (error) {
      console.error("Failed to log audit action:", error);
    }
  }

  /**
   * Handle session expiration during payment flow
   */
  function handleSessionExpired() {
    // Store the current URL for returning after re-authentication
    const returnUrl = encodeURIComponent(
      window.location.pathname + window.location.search
    );

    // Redirect to sign-in with return URL
    window.location.href = `/sign-in?redirect_url=${returnUrl}&session_expired=true`;
  }

  const value = {
    logAction,
    verificationStatus: {
      emailVerified,
      phoneVerified,
    },
    sessionExpired,
    handleSessionExpired,
    isSIWEEnabled,
    isAdmin,
  };

  return (
    <AuthAuditContext.Provider value={value}>
      {children}
    </AuthAuditContext.Provider>
  );
}

export function useAuthAudit() {
  const context = useContext(AuthAuditContext);
  if (!context) {
    throw new Error("useAuthAudit must be used within an AuthAuditLogProvider");
  }
  return context;
}
