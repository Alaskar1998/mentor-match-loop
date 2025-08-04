import { useTranslation } from "react-i18next";
import { Search, Filter, MoreHorizontal, Download } from "lucide-react";
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
import { useAdminInvitations } from "@/hooks/useAdminData";
import { useState, useMemo } from "react";

const Invitations = () => {
  const { t } = useTranslation();
  const { data: invitations, isLoading, error } = useAdminInvitations();
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [skillFilter, setSkillFilter] = useState("all");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('admin.invitations.title', 'Invitations')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.invitations.subtitle', 'Track skill exchange invitations')}
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-muted-foreground">Loading invitations...</p>
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
            {t('admin.invitations.title', 'Invitations')}
          </h1>
          <p className="text-muted-foreground">
            {t('admin.invitations.subtitle', 'Track skill exchange invitations')}
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <p className="text-destructive">Error loading invitations</p>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Filter and search logic
  const filteredInvitations = useMemo(() => {
    if (!invitations) return [];
    
    return invitations.filter(invitation => {
      // Search term filter
      const matchesSearch = searchTerm === "" || 
        invitation.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invitation.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invitation.skill.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === "all" || invitation.status === statusFilter;
      
      // Skill filter
      const matchesSkill = skillFilter === "all" || invitation.skill === skillFilter;
      
      return matchesSearch && matchesStatus && matchesSkill;
    });
  }, [invitations, searchTerm, statusFilter, skillFilter]);

  // Get unique values for filter options
  const uniqueSkills = useMemo(() => {
    if (!invitations) return [];
    return [...new Set(invitations.map(invitation => invitation.skill))].filter(Boolean);
  }, [invitations]);

  // Export functionality
  const handleExport = () => {
    const csvContent = [
      ['Sender', 'Receiver', 'Skill', 'Status', 'Sent Date', 'Response Date'],
      ...filteredInvitations.map(invitation => [
        invitation.senderName,
        invitation.receiverName,
        invitation.skill,
        invitation.status,
        invitation.sentDate,
        invitation.responseDate || ''
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invitations-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'accepted':
        return <Badge variant="default">Accepted</Badge>;
      case 'declined':
        return <Badge variant="destructive">Declined</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t('admin.invitations.title', 'Invitations')}
        </h1>
        <p className="text-muted-foreground">
          {t('admin.invitations.subtitle', 'Track skill exchange invitations')}
        </p>
      </div>

      {/* Search and filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('admin.invitations.searchTitle', 'Invitation Management')}</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                {t('admin.invitations.export', 'Export')}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('admin.invitations.searchPlaceholder', 'Search invitations...')}
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
            
            {/* Skill Filter */}
            <Select value={skillFilter} onValueChange={setSkillFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Skill" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Skills</SelectItem>
                {uniqueSkills.map(skill => (
                  <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredInvitations.length} of {invitations?.length || 0} invitations
          </div>
        </CardContent>
      </Card>

      {/* Invitations table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.invitations.tableTitle', 'All Invitations')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.invitations.table.sender', 'Sender')}</TableHead>
                <TableHead>{t('admin.invitations.table.receiver', 'Receiver')}</TableHead>
                <TableHead>{t('admin.invitations.table.skill', 'Skill')}</TableHead>
                <TableHead>{t('admin.invitations.table.status', 'Status')}</TableHead>
                <TableHead>{t('admin.invitations.table.sentDate', 'Sent Date')}</TableHead>
                <TableHead>{t('admin.invitations.table.responseDate', 'Response Date')}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvitations?.map((invitation) => (
                <TableRow key={invitation.id}>
                  <TableCell className="font-medium">{invitation.senderName}</TableCell>
                  <TableCell>{invitation.receiverName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{invitation.skill}</Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(invitation.status)}
                  </TableCell>
                  <TableCell>{invitation.sentDate}</TableCell>
                  <TableCell>{invitation.responseDate || '-'}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          {t('admin.invitations.actions.view', 'View Details')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {t('admin.invitations.actions.resend', 'Resend')}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          {t('admin.invitations.actions.cancel', 'Cancel')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">No invitations found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Invitations; 