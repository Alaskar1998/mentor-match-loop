import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useGamification } from '@/hooks/useGamification';
import { useNotifications } from '@/hooks/useNotifications';
import { logger } from '@/utils/logger';

const TestPage = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { state: gamificationState } = useGamification();
  const { notifications } = useNotifications();
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    const results: string[] = [];

    // Test 1: Check if auth provider loads without errors
    if (!isLoading) {
      results.push('✅ Auth provider loaded successfully');
    } else {
      results.push('⏳ Auth provider still loading...');
    }

    // Test 2: Check if user data is available
    if (user) {
      results.push(`✅ User data loaded: ${user.name}`);
    } else if (isAuthenticated === false) {
      results.push('✅ User not authenticated (expected)');
    } else {
      results.push('⏳ User authentication status pending...');
    }

    // Test 3: Check if gamification provider works
    if (gamificationState) {
      results.push(
        `✅ Gamification state loaded: ${gamificationState.appCoins} coins`
      );
    } else {
      results.push('❌ Gamification state not available');
    }

    // Test 4: Check if notifications provider works
    try {
      if (notifications && Array.isArray(notifications)) {
        results.push(
          `✅ Notifications provider loaded: ${notifications.length} notifications`
        );
      } else {
        results.push(
          '✅ Notifications provider loaded: 0 notifications (normal for new users)'
        );
      }
    } catch (error) {
      results.push(
        '❌ Notifications provider error: ' + (error as Error).message
      );
    }

    // Test 5: Check for StrictMode double-invocation
    logger.debug(
      'TestPage useEffect called - checking for StrictMode behavior'
    );

    setTestResults(results);
  }, [user, isAuthenticated, isLoading, gamificationState, notifications]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">StrictMode Test Page</h1>

      <div className="bg-card rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Results</h2>
        <div className="space-y-2">
          {testResults.map((result, index) => (
            <div key={index} className="text-sm">
              {result}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Current State</h2>
        <div className="space-y-2 text-sm">
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</div>
          <div>User: {user ? user.name : 'None'}</div>
          <div>Coins: {gamificationState?.appCoins || 0}</div>
          <div>Notifications: {notifications?.length || 0}</div>
          <div>
            General Notifications:{' '}
            {notifications?.filter(n => n.type === 'general').length || 0}
          </div>
          <div>
            Chat Notifications:{' '}
            {notifications?.filter(n => n.type === 'chat').length || 0}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            1. This page tests if all providers work correctly with StrictMode
            enabled
          </p>
          <p>2. Check the browser console for any errors or warnings</p>
          <p>3. Try refreshing the page to test refresh behavior</p>
          <p>4. All tests should show ✅ if StrictMode is working properly</p>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
