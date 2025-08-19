import { useTranslation } from "react-i18next";
import { Search, Filter, MoreHorizontal, Download, Edit, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAdminUsers } from "@/hooks/useAdminData";
import React, { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const Users = () => {
  const { t } = useTranslation();
  const { data: users, isLoading, error } = useAdminUsers();
  const queryClient = useQueryClient();
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  
  // State for edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    display_name: "",
    email: "",
    country: "",
    status: "active",
    userType: "free",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { toast } = useToast();

  // Listen for upgrade interest changes and refresh data
  React.useEffect(() => {
    const handleUpgradeInterestChange = () => {
      console.log('Upgrade interest changed, refreshing admin data...');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    };

    window.addEventListener('upgradeInterestChanged', handleUpgradeInterestChange);
    
    return () => {
      window.removeEventListener('upgradeInterestChanged', handleUpgradeInterestChange);
    };
  }, [queryClient]);

  // Filter and search logic - MUST be called before any conditional returns
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    return users.filter(user => {
      // Search term filter
      const matchesSearch = searchTerm === "" || 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.country.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      
      // Type filter
      const matchesType = typeFilter === "all" || user.userType === typeFilter;
      
      // Country filter
      const matchesCountry = countryFilter === "all" || user.country === countryFilter;
      
      return matchesSearch && matchesStatus && matchesType && matchesCountry;
    });
  }, [users, searchTerm, statusFilter, typeFilter, countryFilter]);

  // Get unique values for filter options - MUST be called before any conditional returns
  const uniqueCountries = useMemo(() => {
    if (!users) return [];
    return [...new Set(users.map(user => user.country))].filter(Boolean);
  }, [users]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('admin.users.title', 'Users')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.users.subtitle', 'Manage platform users and their accounts')}
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('admin.users.title', 'Users')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.users.subtitle', 'Manage platform users and their accounts')}
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <p className="text-destructive">Error loading users</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['Name', 'Email', 'Country', 'Status', 'Type', 'Exchanges', 'Rating', 'Joined Date'],
      ...filteredUsers.map(user => [
        user.name,
        user.email,
        user.country,
        user.status,
        user.userType,
        user.exchanges.toString(),
        user.rating.toString(),
        user.joinedDate
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Edit user functionality
  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({
      display_name: user.name,
      email: user.email,
      country: user.country,
      status: user.status,
      userType: user.userType,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editForm.display_name,
          email: editForm.email,
          country: editForm.country,
          status: editForm.status,
          user_type: editForm.userType,
        })
        .eq('id', editingUser.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });
      
      setIsEditModalOpen(false);
      setEditingUser(null);
      
      // Refresh the data by invalidating the query cache
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('admin.users.title', 'Users')}
        </h1>
        <p className="text-muted-foreground">
          {t('admin.users.subtitle', 'Manage platform users and their accounts')}
        </p>
      </div>

      {/* Search and filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('admin.users.searchTitle', 'User Management')}</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                {t('admin.users.export', 'Export')}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  // @ts-ignore - debug method
                  window.upgradeInterestService?.debugStorage();
                }}
                className="ml-2"
              >
                Debug Storage
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  console.log('Manual refresh triggered');
                  queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
                }}
                className="ml-2"
              >
                Refresh Data
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  // @ts-ignore - test method
                  window.upgradeInterestService?.triggerRefresh();
                }}
                className="ml-2"
              >
                Test Event
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('admin.users.searchPlaceholder', 'Search users...')}
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Country Filter */}
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {uniqueCountries.map(country => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {users?.length || 0} users
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.users.tableTitle', 'All Users')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.users.table.name', 'Name')}</TableHead>
                <TableHead>{t('admin.users.table.email', 'Email')}</TableHead>
                <TableHead>{t('admin.users.table.country', 'Country')}</TableHead>
                <TableHead>{t('admin.users.table.status', 'Status')}</TableHead>
                <TableHead>{t('admin.users.table.type', 'Type')}</TableHead>
                <TableHead>{t('admin.users.table.exchanges', 'Exchanges')}</TableHead>
                <TableHead>{t('admin.users.table.rating', 'Rating')}</TableHead>
                <TableHead>{t('admin.users.table.joined', 'Joined')}</TableHead>
                <TableHead>{t('admin.users.table.upgradeInterest', 'Upgrade Interest')}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.country}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.status === 'active' ? 'default' : 'secondary'}
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={user.userType === 'premium' ? 'default' : 'outline'}
                    >
                      {user.userType}
                    </Badge>
                  </TableCell>
                  <TableCell>{user.exchanges}</TableCell>
                  <TableCell>{user.rating}</TableCell>
                  <TableCell>{user.joinedDate}</TableCell>
                  <TableCell>
                    {user.upgradeInterest?.hasInterest ? (
                      <div className="flex flex-col space-y-1">
                        <Badge variant="default" className="w-fit">
                          {user.upgradeInterest.plan === 'monthly' ? 'Monthly' : 'Yearly'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {user.upgradeInterest.date}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No interest</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          {t('admin.users.actions.edit', 'Edit User')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {t('admin.users.actions.view', 'View Profile')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {t('admin.users.actions.suspend', 'Suspend User')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8">
                    <p className="text-muted-foreground">No users found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information. Changes will be saved immediately.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={editForm.display_name}
                onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="country" className="text-right">
                Country
              </Label>
              <Input
                id="country"
                value={editForm.country}
                onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={editForm.status}
                onValueChange={(value) => setEditForm({ ...editForm, status: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userType" className="text-right">
                User Type
              </Label>
              <Select
                value={editForm.userType}
                onValueChange={(value) => setEditForm({ ...editForm, userType: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              disabled={isUpdating}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateUser}
              disabled={isUpdating}
            >
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users; 