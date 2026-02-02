import { TimeSpanConfig, ThemeConfig, AppSettings } from '../types';

// Sync service interface for future cloud sync
// This allows syncing timer configurations across devices

export interface SyncData {
  timeSpans: TimeSpanConfig[];
  themes: ThemeConfig[];
  settings: AppSettings;
  lastSyncedAt: number;
}

export interface SyncProvider {
  sync: (data: SyncData) => Promise<SyncData>;
  fetch: () => Promise<SyncData | null>;
  push: (data: SyncData) => Promise<void>;
  onRemoteChange: (callback: (data: SyncData) => void) => () => void;
}

// Local sync provider (just stores locally, no cloud sync)
class LocalSyncProvider implements SyncProvider {
  private SYNC_KEY = 'timely-sync-data';

  async sync(data: SyncData): Promise<SyncData> {
    // In local mode, just return the data as-is
    await this.push(data);
    return data;
  }

  async fetch(): Promise<SyncData | null> {
    const stored = localStorage.getItem(this.SYNC_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  async push(data: SyncData): Promise<void> {
    const syncData: SyncData = {
      ...data,
      lastSyncedAt: Date.now(),
    };
    localStorage.setItem(this.SYNC_KEY, JSON.stringify(syncData));
  }

  onRemoteChange(callback: (data: SyncData) => void): () => void {
    // Listen for storage changes from other tabs
    const handler = (event: StorageEvent) => {
      if (event.key === this.SYNC_KEY && event.newValue) {
        callback(JSON.parse(event.newValue));
      }
    };

    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }
}

// Placeholder for future cloud sync providers
class CloudSyncProvider implements SyncProvider {
  constructor(private apiUrl: string) {}

  async sync(data: SyncData): Promise<SyncData> {
    // Fetch remote data
    const remote = await this.fetch();

    if (!remote) {
      // No remote data, push local
      await this.push(data);
      return data;
    }

    // Simple last-write-wins merge
    if (data.lastSyncedAt > remote.lastSyncedAt) {
      await this.push(data);
      return data;
    }

    return remote;
  }

  async fetch(): Promise<SyncData | null> {
    // Placeholder for API call
    console.log(`Cloud sync fetch not implemented for ${this.apiUrl}`);
    return null;
  }

  async push(_data: SyncData): Promise<void> {
    // Placeholder for API call
    console.log(`Cloud sync push not implemented for ${this.apiUrl}`);
  }

  onRemoteChange(_callback: (data: SyncData) => void): () => void {
    // Placeholder for WebSocket/SSE connection
    console.log(`Cloud sync real-time updates not implemented for ${this.apiUrl}`);
    return () => {};
  }
}

// Get the appropriate sync provider based on environment
function getSyncProvider(): SyncProvider {
  const provider = import.meta.env.VITE_SYNC_PROVIDER ?? 'local';
  const apiUrl = import.meta.env.VITE_SYNC_API_URL ?? '';

  switch (provider) {
    case 'cloud':
      return new CloudSyncProvider(apiUrl);
    case 'local':
    default:
      return new LocalSyncProvider();
  }
}

// Export singleton sync service
export const syncService = getSyncProvider();

// Merge strategies for conflict resolution
export function mergeTimeSpans(
  local: TimeSpanConfig[],
  remote: TimeSpanConfig[]
): TimeSpanConfig[] {
  const merged = new Map<string, TimeSpanConfig>();

  // Add all local spans
  local.forEach((span) => merged.set(span.id, span));

  // Merge remote spans (remote wins for conflicts, but this can be customized)
  remote.forEach((span) => {
    const existing = merged.get(span.id);
    if (!existing) {
      merged.set(span.id, span);
    }
    // Could add more sophisticated merge logic here
  });

  return Array.from(merged.values());
}
