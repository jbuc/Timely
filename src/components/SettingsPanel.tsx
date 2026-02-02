import { useTimelyStore } from '../store';
import { requestNotificationPermission, canShowNotifications } from '../services/notifications';

interface SettingsPanelProps {
  onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const settings = useTimelyStore((s) => s.settings);
  const updateSettings = useTimelyStore((s) => s.updateSettings);
  const themes = useTimelyStore((s) => s.themes);
  const activeThemeId = useTimelyStore((s) => s.activeThemeId);
  const setActiveTheme = useTimelyStore((s) => s.setActiveTheme);
  const user = useTimelyStore((s) => s.user);

  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      updateSettings({ notificationsEnabled: true });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-text-muted/20 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-text">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-text-muted/20 transition-colors"
          >
            <CloseIcon className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Theme */}
          <div>
            <h3 className="text-sm font-medium text-text-muted mb-3">Theme</h3>
            <div className="grid grid-cols-2 gap-2">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setActiveTheme(theme.id)}
                  className={`
                    p-3 rounded-lg border-2 transition-all
                    ${activeThemeId === theme.id
                      ? 'border-primary'
                      : 'border-transparent hover:border-text-muted/30'}
                  `}
                  style={{ backgroundColor: theme.colors.background }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: theme.colors.primary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: theme.colors.secondary }}
                    />
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: theme.colors.accent }}
                    />
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: theme.colors.text }}
                  >
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="text-sm font-medium text-text-muted mb-3">Notifications</h3>
            <div className="space-y-3">
              {!canShowNotifications() && (
                <button
                  onClick={handleRequestNotifications}
                  className="w-full py-2 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/80"
                >
                  Enable Notifications
                </button>
              )}
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-text">Enable notifications</span>
                <Toggle
                  checked={settings.notificationsEnabled}
                  onChange={(checked) => updateSettings({ notificationsEnabled: checked })}
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-text">Sound</span>
                <Toggle
                  checked={settings.soundEnabled}
                  onChange={(checked) => updateSettings({ soundEnabled: checked })}
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-text">Vibration</span>
                <Toggle
                  checked={settings.vibrateEnabled}
                  onChange={(checked) => updateSettings({ vibrateEnabled: checked })}
                />
              </label>
            </div>
          </div>

          {/* Display */}
          <div>
            <h3 className="text-sm font-medium text-text-muted mb-3">Display</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-text">Compact mode</span>
                <Toggle
                  checked={settings.compactMode}
                  onChange={(checked) => updateSettings({ compactMode: checked })}
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-text">Show labels</span>
                <Toggle
                  checked={settings.showLabels}
                  onChange={(checked) => updateSettings({ showLabels: checked })}
                />
              </label>
              <div className="flex items-center justify-between">
                <span className="text-text">Clock format</span>
                <select
                  value={settings.clockFormat}
                  onChange={(e) =>
                    updateSettings({ clockFormat: e.target.value as '12h' | '24h' })
                  }
                  className="px-3 py-1.5 bg-background rounded-lg border border-text-muted/30 text-text text-sm"
                >
                  <option value="12h">12-hour</option>
                  <option value="24h">24-hour</option>
                </select>
              </div>
            </div>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-medium text-text-muted mb-3">Account</h3>
            {user ? (
              <div className="p-3 bg-background rounded-lg">
                <p className="text-text font-medium">{user.displayName ?? 'User'}</p>
                <p className="text-text-muted text-sm">{user.email}</p>
              </div>
            ) : (
              <div className="p-3 bg-background rounded-lg text-center">
                <p className="text-text-muted text-sm mb-2">
                  Sign in to sync your timers across devices
                </p>
                <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/80">
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-medium text-text-muted mb-3">About</h3>
            <div className="p-3 bg-background rounded-lg">
              <p className="text-text font-medium">Timely</p>
              <p className="text-text-muted text-sm">Making time real for the time blind</p>
              <p className="text-text-muted text-xs mt-2">Version 0.1.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`
        relative w-12 h-6 rounded-full transition-colors
        ${checked ? 'bg-primary' : 'bg-text-muted/30'}
      `}
    >
      <span
        className={`
          absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-0'}
        `}
      />
    </button>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
