import { z } from "zod";

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),
});

export function validateEnv() {
  const result = envSchema.safeParse({
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  });

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    console.error("❌ Environment validation failed:", errors);
    throw new Error(`Missing environment variables: ${Object.keys(errors).join(", ")}`);
  }
}

// ----------------------------------------------------------------------
// Automation / n8n / WhatsApp Cloud API configuration
// ----------------------------------------------------------------------
// These are intentionally OPTIONAL at the app level: the studio site and
// admin panel must keep working perfectly even before n8n/WhatsApp is
// configured. Every automation call-site checks `isAutomationConfigured()`
// first and simply no-ops (with a console warning) when it isn't set up.
const automationEnvSchema = z.object({
  N8N_WEBHOOK_URL: z.string().url().optional().or(z.literal("")),
  AUTOMATION_API_SECRET: z.string().min(1).optional().or(z.literal("")),
  WHATSAPP_ACCESS_TOKEN: z.string().optional().or(z.literal("")),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional().or(z.literal("")),
  WHATSAPP_VERIFY_TOKEN: z.string().optional().or(z.literal("")),
  ADMIN_WHATSAPP_NUMBER: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_SITE_URL: z.string().optional().or(z.literal("")),
});

export type AutomationEnv = z.infer<typeof automationEnvSchema>;

let cachedAutomationEnv: AutomationEnv | null = null;

/**
 * Parses & caches the automation-related environment variables.
 * Never throws - invalid/missing values just fall back to "" so callers
 * can decide what to do (usually: skip the automation gracefully).
 */
export function getAutomationEnv(): AutomationEnv {
  if (cachedAutomationEnv) return cachedAutomationEnv;

  const result = automationEnvSchema.safeParse({
    N8N_WEBHOOK_URL: process.env.N8N_WEBHOOK_URL || "",
    AUTOMATION_API_SECRET: process.env.AUTOMATION_API_SECRET || "",
    WHATSAPP_ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || "",
    WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    WHATSAPP_VERIFY_TOKEN: process.env.WHATSAPP_VERIFY_TOKEN || "",
    ADMIN_WHATSAPP_NUMBER: process.env.ADMIN_WHATSAPP_NUMBER || "",
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "",
  });

  cachedAutomationEnv = result.success
    ? result.data
    : {
        N8N_WEBHOOK_URL: "",
        AUTOMATION_API_SECRET: "",
        WHATSAPP_ACCESS_TOKEN: "",
        WHATSAPP_PHONE_NUMBER_ID: "",
        WHATSAPP_VERIFY_TOKEN: "",
        ADMIN_WHATSAPP_NUMBER: "",
        NEXT_PUBLIC_SITE_URL: "",
      };

  return cachedAutomationEnv;
}

/** True once the minimum config needed to reach n8n is present. */
export function isAutomationConfigured(): boolean {
  const env = getAutomationEnv();
  return Boolean(env.N8N_WEBHOOK_URL);
}
