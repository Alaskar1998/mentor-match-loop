import { useTranslation } from "react-i18next";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface TopbarProps {
  title: string;
}

export const Topbar = ({ title }: TopbarProps) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex items-center justify-between h-16 px-6 bg-background border-b">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold">
          {title}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* User info */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{user?.name || user?.email}</span>
        </div>

        {/* Logout button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center space-x-2"
        >
          <LogOut className="h-4 w-4" />
          <span>{t('admin.topbar.logout', 'Logout')}</span>
        </Button>
      </div>
    </div>
  );
}; 