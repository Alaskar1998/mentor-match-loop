import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Download, 
  Upload, 
  RefreshCw, 
  Users, 
  Calendar, 
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { upgradeInterestService } from "@/services/upgradeInterestService";

const UpgradeInterests = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [upgradeInterests, setUpgradeInterests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load upgrade interests from localStorage
  const refreshUpgradeInterests = () => {
    try {
      setIsLoading(true);
      const interests = upgradeInterestService.getInterests();
      setUpgradeInterests(interests);
      console.log('Refreshed upgrade interests:', interests);
    } catch (error) {
      console.error('Error refreshing upgrade interests:', error);
      setUpgradeInterests([]);
      toast({
        title: "Error",
        description: "Failed to load upgrade interests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load upgrade interests on component mount
  useEffect(() => {
    refreshUpgradeInterests();
  }, []);

  // Export upgrade interest data
  const handleExportData = () => {
    try {
      const exportData = upgradeInterestService.exportData();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `upgrade-interests-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Data exported successfully",
        description: `Exported ${upgradeInterests.length} upgrade interests`,
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      toast({
        title: "Export failed",
        description: "Could not export upgrade interest data",
        variant: "destructive",
      });
    }
  };

  // Import upgrade interest data
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonString = e.target?.result as string;
        const success = upgradeInterestService.importData(jsonString);
        
        if (success) {
          refreshUpgradeInterests();
          toast({
            title: "Data imported successfully",
            description: "Upgrade interests have been imported",
          });
        } else {
          toast({
            title: "Import failed",
            description: "Could not import upgrade interest data",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error importing data:', error);
        toast({
          title: "Import failed",
          description: "Invalid file format",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  // Test upgrade interest tracking
  const handleTestInterest = () => {
    const testUser = {
      id: 'test-user-' + Date.now(),
      email: 'test@example.com',
      name: 'Test User'
    };
    upgradeInterestService.trackInterest(testUser.id, testUser.email, testUser.name, 'monthly');
    toast({
      title: "Test interest added",
      description: "Added test upgrade interest to localStorage",
    });
    // Refresh the list
    setTimeout(refreshUpgradeInterests, 100);
  };

  // Clear all interests (for testing)
  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all upgrade interests? This cannot be undone.')) {
      upgradeInterestService.clearAll();
      refreshUpgradeInterests();
      toast({
        title: "All interests cleared",
        description: "All upgrade interests have been removed",
      });
    }
  };

  // Get summary statistics
  const getSummary = () => {
    const total = upgradeInterests.length;
    const monthly = upgradeInterests.filter(i => i.plan === 'monthly').length;
    const yearly = upgradeInterests.filter(i => i.plan === 'yearly').length;
    const thisWeek = upgradeInterests.filter(i => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(i.timestamp) > oneWeekAgo;
    }).length;
    const thisMonth = upgradeInterests.filter(i => {
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return new Date(i.timestamp) > oneMonthAgo;
    }).length;

    return { total, monthly, yearly, thisWeek, thisMonth };
  };

  const summary = getSummary();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Upgrade Interests Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Monitor user interest in upgrading to premium plans
        </p>
        <p className="text-sm text-muted-foreground">
          This page works entirely client-side and doesn't depend on Supabase
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button 
          onClick={refreshUpgradeInterests}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
        <Button 
          variant="outline" 
          onClick={handleExportData}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export Data
        </Button>
        <Button 
          variant="outline" 
          onClick={handleTestInterest}
          className="flex items-center gap-2"
        >
          <Users className="h-4 w-4" />
          Test Interest
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleClearAll}
          className="flex items-center gap-2"
        >
          Clear All
        </Button>
      </div>

      {/* Import section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Import Upgrade Interest Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="max-w-xs"
            />
            <span className="text-sm text-muted-foreground">
              Import upgrade interest data from a JSON file
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Summary statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{summary.total}</div>
            <div className="text-sm text-muted-foreground">Total Interests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{summary.monthly}</div>
            <div className="text-sm text-muted-foreground">Monthly Plan</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{summary.yearly}</div>
            <div className="text-sm text-muted-foreground">Yearly Plan</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">{summary.thisWeek}</div>
            <div className="text-sm text-muted-foreground">This Week</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-red-600">{summary.thisMonth}</div>
            <div className="text-sm text-muted-foreground">This Month</div>
          </CardContent>
        </Card>
      </div>

      {/* Status indicator */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {upgradeInterests.length > 0 ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <span className="font-medium">
                {upgradeInterests.length > 0 
                  ? 'Upgrade interests are being tracked successfully' 
                  : 'No upgrade interests found'
                }
              </span>
            </div>
            <Badge variant={upgradeInterests.length > 0 ? 'default' : 'secondary'}>
              {upgradeInterests.length > 0 ? 'Active' : 'No Data'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade interests list */}
      {upgradeInterests.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Upgrade Interests ({upgradeInterests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {upgradeInterests
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((interest, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <Badge variant={interest.plan === 'monthly' ? 'default' : 'secondary'}>
                        {interest.plan}
                      </Badge>
                      <div>
                        <div className="font-medium">{interest.userName}</div>
                        <div className="text-sm text-muted-foreground">{interest.userEmail}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(interest.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No upgrade interests found</h3>
            <p className="text-muted-foreground mb-4">
              Users haven't shown interest in upgrading yet, or there might be an issue with data collection.
            </p>
            <Button onClick={handleTestInterest} variant="outline">
              Test Interest Tracking
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Debug information */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Storage Key:</strong> maharat_hub_upgrade_interest
            </div>
            <div>
              <strong>Local Storage Available:</strong> {typeof localStorage !== 'undefined' ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Service Available:</strong> {typeof upgradeInterestService !== 'undefined' ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>Last Updated:</strong> {upgradeInterests.length > 0 ? new Date(Math.max(...upgradeInterests.map(i => new Date(i.timestamp).getTime()))).toLocaleString() : 'Never'}
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={() => {
              // @ts-ignore - debug method
              window.upgradeInterestService?.debugStorage();
            }}
            className="mt-4"
          >
            Debug Storage in Console
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UpgradeInterests;
