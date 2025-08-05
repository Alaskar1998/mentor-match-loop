/**
 * @file DevTools.tsx
 * @description Developer tools component for debugging and performance monitoring
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  performanceMonitor,
  PerformanceMetrics,
} from '@/utils/performanceMonitor';
import { logger } from '@/utils/logger';
import { useAuth } from '@/hooks/useAuth';

interface DevToolsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PerformanceData {
  componentName: string;
  metrics: PerformanceMetrics;
}

export const DevTools: React.FC<DevToolsProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('performance');
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [authState, setAuthState] = useState<any>(null);
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isOpen) return;

    // Subscribe to performance updates
    const unsubscribe = performanceMonitor.subscribe(
      (componentName, metrics) => {
        setPerformanceData(prev => {
          const existing = prev.find(
            item => item.componentName === componentName
          );
          if (existing) {
            existing.metrics = metrics;
            return [...prev];
          }
          return [...prev, { componentName, metrics }];
        });
      }
    );

    // Capture logs
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      originalLog(...args);
      setLogs(prev => [...prev, `[LOG] ${args.join(' ')}`]);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      setLogs(prev => [...prev, `[WARN] ${args.join(' ')}`]);
    };

    console.error = (...args) => {
      originalError(...args);
      setLogs(prev => [...prev, `[ERROR] ${args.join(' ')}`]);
    };

    // Update auth state
    setAuthState({ user, loading, isAuthenticated });

    return () => {
      unsubscribe();
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, [isOpen, user, loading, isAuthenticated]);

  const generatePerformanceReport = () => {
    const report = performanceMonitor.generateReport();
    console.log('Performance Report:', report);
  };

  const clearPerformanceData = () => {
    performanceMonitor.clearMetrics();
    setPerformanceData([]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const exportData = () => {
    const data = {
      performance: performanceData,
      logs: logs,
      authState: authState,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devtools-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Developer Tools</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="h-full"
          >
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="auth">Auth State</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>

            <TabsContent
              value="performance"
              className="h-full overflow-auto p-4"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Performance Metrics</h3>
                  <div className="space-x-2">
                    <Button size="sm" onClick={generatePerformanceReport}>
                      Generate Report
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearPerformanceData}
                    >
                      Clear Data
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {performanceData.map(({ componentName, metrics }) => (
                    <Card key={componentName}>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          {componentName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="font-medium">Render Time:</span>
                            <Badge
                              variant={
                                metrics.renderTime > 16
                                  ? 'destructive'
                                  : 'default'
                              }
                              className="ml-2"
                            >
                              {metrics.renderTime.toFixed(2)}ms
                            </Badge>
                          </div>
                          <div>
                            <span className="font-medium">Memory:</span>
                            <span className="ml-2">
                              {metrics.memoryUsage
                                ? `${(metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB`
                                : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Interactions:</span>
                            <span className="ml-2">
                              {metrics.interactionCount}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">Errors:</span>
                            <Badge
                              variant={
                                metrics.errorCount > 0
                                  ? 'destructive'
                                  : 'default'
                              }
                              className="ml-2"
                            >
                              {metrics.errorCount}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="logs" className="h-full overflow-auto p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Console Logs</h3>
                  <Button size="sm" variant="outline" onClick={clearLogs}>
                    Clear Logs
                  </Button>
                </div>

                <div className="bg-muted rounded-lg p-4 h-96 overflow-auto font-mono text-sm">
                  {logs.length === 0 ? (
                    <p className="text-muted-foreground">No logs yet...</p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="mb-1">
                        <span className="text-muted-foreground">
                          [{new Date().toLocaleTimeString()}]
                        </span>{' '}
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="auth" className="h-full overflow-auto p-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Authentication State</h3>

                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Authenticated:</span>
                        <Badge
                          variant={isAuthenticated ? 'default' : 'secondary'}
                        >
                          {isAuthenticated ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Loading:</span>
                        <Badge variant={loading ? 'default' : 'secondary'}>
                          {loading ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <Separator />
                      <div>
                        <span className="font-medium">User Data:</span>
                        <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                          {JSON.stringify(user, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="tools" className="h-full overflow-auto p-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Development Tools</h3>

                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Data Export</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={exportData} className="w-full">
                        Export All Data
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          performanceMonitor.configure({
                            enabled: !performanceMonitor['config'].enabled,
                          })
                        }
                        className="w-full"
                      >
                        Toggle Performance Monitoring
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const report = performanceMonitor.generateReport();
                          console.log('Performance Report:', report);
                        }}
                        className="w-full"
                      >
                        Log Performance Report
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Debugging</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          logger.info('Test log message');
                          logger.warn('Test warning message');
                          logger.error('Test error message');
                        }}
                        className="w-full"
                      >
                        Test Logging
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          localStorage.clear();
                          sessionStorage.clear();
                          window.location.reload();
                        }}
                        className="w-full"
                      >
                        Clear Storage & Reload
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
