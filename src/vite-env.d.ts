/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AUTH_PROVIDER: string;
  readonly VITE_SYNC_PROVIDER: string;
  readonly VITE_SYNC_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
