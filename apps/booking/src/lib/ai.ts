// AI Service Basis-URL — leer = relative URL (geht durch Vite-Proxy in dev)
export const AI_BASE = (import.meta.env.VITE_AI_SERVICE_URL as string | undefined) ?? ''
