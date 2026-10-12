import { createClient } from '@supabase/supabase-js';

// Environment variables with fallback to user's configured Supabase project
const rawUrl: string =
  (import.meta.env.VITE_SUPABASE_URL as string) ||
  'https://tvxzsdzowbrnpoeqyyft.supabase.co';

// Ensure root project URL format without trailing rest/v1 or slashes
export const SUPABASE_URL: string = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

export const SUPABASE_ANON_KEY: string =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2eHpzZHpvd2JybnBvZXF5eWZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE0ODA5ODksImV4cCI6MjEwNzA1Njk4OX0.K_Z48VKBUhjcpRvuSgONlJGFMvhdJfwe9_59f7AEovs';

export const SUPABASE_PROJECT_ID: string = 'tvxzsdzowbrnpoeqyyft';

// Singleton Supabase Client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export interface BackendStatus {
  isConfigured: boolean;
  isConnected: boolean;
  hasTables: boolean;
  latencyMs?: number;
  message: string;
}

/**
 * Health check helper to test connectivity to Supabase and detect if SQL migration has been applied.
 */
export async function checkBackendHealth(): Promise<BackendStatus> {
  const startTime = Date.now();
  try {
    // 1. Check Auth / REST basic reachability
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });

    if (!authRes.ok && authRes.status !== 200) {
      return {
        isConfigured: true,
        isConnected: false,
        hasTables: false,
        latencyMs: Date.now() - startTime,
        message: `HTTP error ${authRes.status}: Unable to reach Supabase project.`,
      };
    }

    // 2. Test if core tables (patients, referrals) exist in schema cache
    const { error: patientErr } = await supabase
      .from('patients')
      .select('id')
      .limit(1);

    const latency = Date.now() - startTime;

    if (patientErr) {
      // PGRST205 indicates table does not exist in public schema cache
      if (patientErr.code === 'PGRST205' || patientErr.message?.includes('not find the table')) {
        return {
          isConfigured: true,
          isConnected: true,
          hasTables: false,
          latencyMs: latency,
          message: 'Supabase connected! Tables pending migration (run supabase/schema.sql in SQL Editor).',
        };
      }
      return {
        isConfigured: true,
        isConnected: true,
        hasTables: false,
        latencyMs: latency,
        message: `Database warning: ${patientErr.message}`,
      };
    }

    return {
      isConfigured: true,
      isConnected: true,
      hasTables: true,
      latencyMs: latency,
      message: 'Supabase connected & all tables active!',
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      isConnected: false,
      hasTables: false,
      latencyMs: Date.now() - startTime,
      message: `Connection failed: ${err?.message || 'Network error'}`,
    };
  }
}
