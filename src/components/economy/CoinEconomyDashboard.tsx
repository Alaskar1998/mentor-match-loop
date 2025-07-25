import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGamification } from "@/hooks/useGamification";
import { coinEconomyService } from "@/services/coinEconomyService";
import { CoinTransaction } from "@/types/coin-economy";
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const CoinEconomyDashboard = () => {
  const { state, refreshBalance } = useGamification();
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [economyStats, setEconomyStats] = useState({
    totalEarned: 0,
    totalSpent: 0,
    transactionCount: 0,
    topEarningSource: '',
    topSpendingCategory: ''
  });

  useEffect(() => {
    loadTransactionHistory();
    validateEconomy();
  }, []);

  const loadTransactionHistory = async () => {
    // In a real app, this would fetch from the service
    console.log('Loading transaction history...');
  };

  const validateEconomy = async () => {
    const isValid = await coinEconomyService.validateEconomyBalance();
    console.log('Economy validation result:', isValid);
  };

  const getTransactionIcon = (type: string) => {
    if (type.includes('purchase')) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <TrendingUp className="w-4 h-4 text-green-500" />;
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Coin Economy Dashboard</h2>
          <p className="text-muted-foreground">Track your earnings, spending, and transaction history</p>
        </div>
        <Badge className="gap-1">
          <CheckCircle className="w-3 h-3" />
          Economy Active
        </Badge>
      </div>

      {/* Current Balance */}
      <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Coins className="w-8 h-8 text-yellow-600" />
                <div>
                  <h3 className="text-2xl font-bold">{state.appCoins}</h3>
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                </div>
              </div>
            </div>
            <Button onClick={refreshBalance} variant="outline" size="sm">
              Refresh Balance
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Economy Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold text-green-600">{economyStats.totalEarned}</div>
            <p className="text-sm text-muted-foreground">Total Earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingDown className="w-6 h-6 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold text-red-600">{economyStats.totalSpent}</div>
            <p className="text-sm text-muted-foreground">Total Spent</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{economyStats.transactionCount}</div>
            <p className="text-sm text-muted-foreground">Transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Coins className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{state.appCoins - economyStats.totalSpent}</div>
            <p className="text-sm text-muted-foreground">Net Worth</p>
          </CardContent>
        </Card>
      </div>

      {/* Economy Rules Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Earning Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Earning Sources
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Daily Login (Day 1-7)</span>
              <span className="font-medium">5-30 coins</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Exchange Completion</span>
              <span className="font-medium">20 coins</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Mentor Bonus 🌟</span>
              <span className="font-medium">+10 coins</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Profile 100% Complete</span>
              <span className="font-medium">50 coins</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Watch Ad (Free users)</span>
              <span className="font-medium">10 coins</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Referral Reward</span>
              <span className="font-medium">100 coins</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Monthly Stipend (Premium)</span>
              <span className="font-medium">300 coins</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Mentor Milestone (10 exchanges)</span>
              <span className="font-medium">50 coins</span>
            </div>
          </CardContent>
        </Card>

        {/* Spending Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              Spending Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Extra Invite (Free)</span>
              <span className="font-medium">50 coins</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Message with Invite (Free)</span>
              <span className="font-medium">30 coins</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Learning Request (Free)</span>
              <span className="font-medium">100 coins</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Profile Boost (Free/Premium)</span>
              <span className="font-medium">150/100 coins</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Pinned Review</span>
              <span className="font-medium">200 coins</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Skill Verification</span>
              <span className="font-medium">500 coins</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Custom Theme</span>
              <span className="font-medium">100 coins</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Economy Validation */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Economy Balance Validation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>3 exchanges earn:</span>
            <span className="font-medium">60 coins</span>
          </div>
          <div className="flex justify-between">
            <span>2 extra invites cost:</span>
            <span className="font-medium">100 coins</span>
          </div>
          <div className="flex justify-between">
            <span>$0.99 coin pack gives:</span>
            <span className="font-medium">100 coins</span>
          </div>
          <div className="flex justify-between">
            <span>Profile boost requires:</span>
            <span className="font-medium">~8 exchanges</span>
          </div>
          <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
            ✅ Economy is balanced: Free users need ~3 exchanges or $0.99 for 2 invites
          </div>
        </CardContent>
      </Card>

      {/* Transaction History Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No transactions yet. Start earning coins!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(transaction.type)}
                    <span className="text-sm">{transaction.type.replace(/_/g, ' ')}</span>
                  </div>
                  <div className={`font-medium ${getTransactionColor(transaction.amount)}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};