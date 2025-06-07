export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">General Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Receive emails about account activity
                  </p>
                </div>
                <div className="h-6 w-11 rounded-full bg-muted"></div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <div className="h-6 w-11 rounded-full bg-muted"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Profile Visibility</h4>
                  <p className="text-sm text-muted-foreground">
                    Control who can see your profile information
                  </p>
                </div>
                <div className="h-6 w-11 rounded-full bg-muted"></div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Data Usage</h4>
                  <p className="text-sm text-muted-foreground">
                    Manage how your data is used and shared
                  </p>
                </div>
                <div className="h-6 w-11 rounded-full bg-muted"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
