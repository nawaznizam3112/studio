
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, UserPlus, UserCheck, CheckCircle, UserX, Star } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuPortal,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";

interface Lead {
    id: string;
    name: string;
    phone: string;
    email: string;
    serviceInterest: string;
    status: 'new' | 'qualified' | 'converted' | 'lost';
    date: string;
    source: string;
}

interface LeadListProps {
    leads: Lead[];
    onAction: () => void;
}

const getLeadStatusBadge = (status: string) => {
    switch (status) {
        case 'new':
            return <Badge variant="secondary" className="bg-blue-100 text-blue-700"><UserPlus className="mr-1 h-3 w-3" />New</Badge>;
        case 'qualified':
            return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700"><UserCheck className="mr-1 h-3 w-3" />Qualified</Badge>;
        case 'converted':
            return <Badge variant="secondary" className="bg-green-100 text-green-700"><CheckCircle className="mr-1 h-3 w-3" />Converted</Badge>;
        case 'lost':
            return <Badge variant="destructive"><UserX className="mr-1 h-3 w-3" />Lost</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

export function LeadList({ leads, onAction }: LeadListProps) {

    // This would eventually call a server action
    const handleStatusChange = (leadId: string, newStatus: Lead['status']) => {
        console.log(`Changing lead ${leadId} to ${newStatus}`);
        // onAction(); // Refresh data after action
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Patient Leads</CardTitle>
                <CardDescription>Patients who have shown interest by checking in or entering a campaign.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Patient</TableHead>
                            <TableHead>Interest / Source</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.length > 0 ? leads.map(lead => (
                            <TableRow key={lead.id}>
                                <TableCell>
                                    <div className="font-medium">{lead.name}</div>
                                    <div className="text-xs text-muted-foreground">{lead.phone || lead.email}</div>
                                </TableCell>
                                <TableCell>
                                    <div>{lead.serviceInterest}</div>
                                    <div className="text-xs text-muted-foreground">via {lead.source}</div>
                                </TableCell>
                                <TableCell>{lead.date}</TableCell>
                                <TableCell>{getLeadStatusBadge(lead.status)}</TableCell>
                                <TableCell className="text-right">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuSub>
                                                <DropdownMenuSubTrigger>
                                                    <span>Update Status</span>
                                                </DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuRadioGroup value={lead.status} onValueChange={(newStatus) => handleStatusChange(lead.id, newStatus as Lead['status'])}>
                                                        <DropdownMenuRadioItem value="new">New</DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="qualified">Qualified</DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="converted">Converted</DropdownMenuRadioItem>
                                                        <DropdownMenuRadioItem value="lost">Lost</DropdownMenuRadioItem>
                                                    </DropdownMenuRadioGroup>
                                                </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <Star className="w-8 h-8 text-muted-foreground/50" />
                                        <p>No leads yet.</p>
                                        <p className="text-xs text-muted-foreground">New leads from campaigns and check-ins will appear here.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
