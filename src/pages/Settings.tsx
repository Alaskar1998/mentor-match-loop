import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Separator } from "@/components/ui/separator";

import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  Shield, 
  CreditCard, 
  Palette, 
  Globe, 
  Trash2, 
  Mail,
  Lock,
  Eye,
  EyeOff,
  Save
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const Settings = () => {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("notifications");
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    // Notification settings
    emailNotifications: true,
    pushNotifications: true,
    invitationNotifications: true,
    chatNotifications: true,
    marketingEmails: false,
    
    // Privacy settings
    profileVisibility: "public",
    showEmail: false,
    showPhone: false,
    
    // Appearance settings
    theme: "system",
    language: "en",
    
    // Account settings
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const tabs = [
    { id: "notifications", label: t('pages.profile.notifications'), icon: Bell },
    { id: "privacy", label: t('pages.profile.privacy'), icon: Shield },
    { id: "billing", label: t('pages.profile.billing'), icon: CreditCard },
    { id: "appearance", label: t('pages.profile.appearance'), icon: Palette },
    { id: "account", label: t('pages.profile.account'), icon: Lock }
  ];

  const handleSave = () => {
    // Save settings based on active tab
    toast.success(t('actions.settingsSaved'));
  };

  const handleDeleteAccount = () => {
    if (confirm(t('pages.profile.deleteAccountConfirm'))) {
      // TODO: Implement account deletion
      toast.error(t('pages.profile.accountDeletionComingSoon'));
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "notifications":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('pages.profile.emailNotifications')}</h3>
              <div className="space-y-4">
                {[
                  { key: "emailNotifications", label: t('pages.profile.emailNotifications'), description: t('pages.profile.emailNotificationsDesc') },
                  { key: "invitationNotifications", label: t('pages.profile.invitationNotifications'), description: t('pages.profile.invitationNotificationsDesc') },
                  { key: "chatNotifications", label: t('pages.profile.chatNotifications'), description: t('pages.profile.chatNotificationsDesc') },
                  { key: "marketingEmails", label: t('pages.profile.marketingEmails'), description: t('pages.profile.marketingEmailsDesc') }
                ].map(({ key, label, description }) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{label}</div>
                      <div className="text-sm text-muted-foreground">{description}</div>
                    </div>
                    <Switch
                      checked={settings[key as keyof typeof settings] as boolean}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, [key]: checked }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('pages.profile.notifications')}</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{t('pages.profile.notifications')}</div>
                  <div className="text-sm text-muted-foreground">{t('actions.pushNotificationsDesc')}</div>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, pushNotifications: checked }))}
                />
              </div>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('actions.profileVisibility')}</h3>
              <Select value={settings.profileVisibility} onValueChange={(value) => setSettings(prev => ({ ...prev, profileVisibility: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">{t('actions.profileVisibilityPublic')}</SelectItem>
                  <SelectItem value="members">{t('actions.profileVisibilityMembers')}</SelectItem>
                  <SelectItem value="private">{t('actions.profileVisibilityPrivate')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('actions.contactInformation')}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t('actions.showEmailAddress')}</div>
                    <div className="text-sm text-muted-foreground">{t('actions.showEmailAddressDesc')}</div>
                  </div>
                  <Switch
                    checked={settings.showEmail}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showEmail: checked }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{t('actions.showPhoneNumber')}</div>
                    <div className="text-sm text-muted-foreground">{t('actions.showPhoneNumberDesc')}</div>
                  </div>
                  <Switch
                    checked={settings.showPhone}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showPhone: checked }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('actions.changePassword')}</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t('actions.currentPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={settings.currentPassword}
                      onChange={(e) => setSettings(prev => ({ ...prev, currentPassword: e.target.value }))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('actions.newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={settings.newPassword}
                    onChange={(e) => setSettings(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('actions.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={settings.confirmPassword}
                    onChange={(e) => setSettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
                <Button variant="outline">{t('actions.updatePassword')}</Button>
              </div>
            </div>
          </div>
        );

      case "billing":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{t('actions.currentPlan')}</h3>
                <p className="text-muted-foreground">{t('actions.manageSubscription')}</p>
              </div>
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {user?.userType === "premium" ? "Premium" : "Free"}
              </Badge>
            </div>

            {user?.userType === "free" && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <h4 className="font-semibold text-primary">{t('actions.upgradeToPremium')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('actions.upgradeDescription')}
                    </p>
                    <Button>{t('actions.upgradeNow')}</Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('actions.paymentMethod')}</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <div className="font-medium">•••• •••• •••• 4242</div>
                      <div className="text-sm text-muted-foreground">Expires 12/25</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">{t('actions.edit')}</Button>
                </div>
                <Button variant="outline" className="w-full">{t('actions.addPaymentMethod')}</Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('actions.billingHistory')}</h3>
              <div className="text-sm text-muted-foreground">
                {t('actions.noBillingHistory')}
              </div>
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('actions.theme')}</h3>
              <Select value={settings.theme} onValueChange={(value) => setSettings(prev => ({ ...prev, theme: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('actions.light')}</SelectItem>
                  <SelectItem value="dark">{t('actions.dark')}</SelectItem>
                  <SelectItem value="system">{t('actions.system')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('actions.language')}</h3>
              <Select value={settings.language} onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "account":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('actions.accountInformation')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t('pages.profile.accountId')}</Label>
                  <div className="text-sm text-muted-foreground font-mono">{user?.id}</div>
                </div>
                <div>
                  <Label>{t('actions.memberSince')}</Label>
                  <div className="text-sm text-muted-foreground">January 2024</div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('actions.dataExport')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('actions.dataExportDesc')}
              </p>
              <Button variant="outline">{t('actions.requestDataExport')}</Button>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-destructive">{t('actions.dangerZone')}</h3>
              <div className="border border-destructive/20 rounded-lg p-4 space-y-4">
                <div>
                  <h4 className="font-medium">{t('actions.deleteAccount')}</h4>
                  <p className="text-sm text-muted-foreground">
                    {t('actions.deleteAccountDesc')}
                  </p>
                </div>
                <Button variant="destructive" onClick={handleDeleteAccount} className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  {t('actions.deleteAccount')}
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('pages.profile.settings')}</h1>
          <p className="text-muted-foreground">
            {t('actions.manageAccountSettings')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted ${
                          activeTab === tab.id ? "bg-muted border-r-2 border-primary" : ""
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  {(() => {
                    const ActiveIcon = tabs.find(tab => tab.id === activeTab)?.icon || Bell;
                    return <ActiveIcon className="w-5 h-5" />;
                  })()}
                  {tabs.find(tab => tab.id === activeTab)?.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderTabContent()}
                
                <div className="flex justify-end pt-6 border-t mt-6">
                  <Button onClick={handleSave} className="gap-2">
                    <Save className="w-4 h-4" />
                    {t('pages.profile.saveSettings')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;