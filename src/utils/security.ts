import { db } from '../config/firebase';
import { ref, push, serverTimestamp } from 'firebase/database';

// Patrones comunes de inyección (SQLi, XSS, Command Injection)
const SQLI_PATTERN = /(\b(UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE)\b|'|--|\bOR\b\s+\d+=\d+)/i;
const XSS_PATTERN = /(<script.*?>.*?<\/script>|<.*?on\w+\s*=|javascript:)/i;
const COMMAND_INJECTION = /(&&|\|\||;|`|\$\(.*?\))/i;

export const detectMaliciousPayload = (input: string): string | null => {
  if (!input) return null;
  
  if (SQLI_PATTERN.test(input)) return "SQL Injection Attempt";
  if (XSS_PATTERN.test(input)) return "Cross-Site Scripting (XSS) Attempt";
  if (COMMAND_INJECTION.test(input)) return "Command Injection Attempt";
  
  return null;
};

export const logSecurityEvent = async (userEmail: string | null, payload: string, attackType: string, location: string) => {
  try {
    const logsRef = ref(db, 'securityLogs');
    await push(logsRef, {
      userEmail: userEmail || 'Anónimo',
      payload: payload,
      attackType: attackType,
      location: location,
      timestamp: serverTimestamp(),
      resolved: false
    });
  } catch (error) {
    console.error("Failed to log security event", error); // Silencioso
  }
};
