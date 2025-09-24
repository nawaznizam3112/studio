
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EditBusinessDialog } from "./edit-business-dialog";
import { QRCodeDialog } from "./qr-code-dialog";
import { StatusToggle } from "./status-toggle";
import { DeleteBusinessDialog } from "./delete-business-dialog";
import { Phone, MoreVertical, CreditCard, Trash2, Edit, Link as LinkIcon, QrCode } from "lucide-react";
import { CopyLinkButton } from "./copy-link-button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { ManageCreditsDialog } from "./manage-credits-dialog";

export interface Business {
    id: string;
    name: string;
    industry: string;
    ownerName: string;
    ownerEmail: string;
    phone?: string;
    qrStatus: 'active' | 'inactive';
    promoLinkUrl?: string;
    introVideoUrl?: string;
    promoVideoUrl?: string;
    message_credits?: number;
}

export interface Industry {
    id: string;
    name: string;
}

interface BusinessListProps {
    businesses: Business[];
    industries: Industry[];
    onAction: () => void; // A generic callback for any action
}

export function BusinessList({ businesses, industries, onAction }: BusinessListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Registered Businesses</CardTitle>
                <CardDescription>A list of all businesses on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Mobile View */}
                <div className="md:hidden">
                    <ul className="space-y-4">
                        {businesses.length > 0 ? (
                            businesses.map((business) => (
                                <li key={business.id} className="rounded-lg border p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold">{business.name}</p>
                                            <p className="text-sm text-muted-foreground">{business.industry}</p>
                                        </div>
                                        <Badge variant={business.qrStatus === 'active' ? 'default' : 'secondary'}>
                                            {business.qrStatus}
                                        </Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <p>{business.ownerName}</p>
                                        <p>{business.ownerEmail}</p>
                                        {business.phone && <p>{business.phone}</p>}
                                        <p>Credits: <span className="font-bold">{business.message_credits || 0}</span></p>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <StatusToggle
                                            businessId={business.id}
                                            currentStatus={business.qrStatus}
                                            onStatusChanged={onAction}
                                        />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <ManageCreditsDialog businessId={business.id} businessName={business.name} onCreditsAdded={onAction} asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}><CreditCard className="mr-2 h-4 w-4" /> Manage Credits</DropdownMenuItem>
                                                </ManageCreditsDialog>
                                                <DropdownMenuSeparator />
                                                <CopyLinkButton businessId={business.id} asChild>
                                                    <DropdownMenuItem><LinkIcon className="mr-2 h-4 w-4" /> Copy Link</DropdownMenuItem>
                                                </CopyLinkButton>
                                                <QRCodeDialog business={business} asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}><QrCode className="mr-2 h-4 w-4" /> View QR Code</DropdownMenuItem>
                                                </QRCodeDialog>
                                                <EditBusinessDialog business={business} industries={industries} onBusinessUpdated={onAction} asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                </EditBusinessDialog>
                                                <DropdownMenuSeparator />
                                                <DeleteBusinessDialog businessId={business.id} businessName={business.name} onBusinessDeleted={onAction} asChild>
                                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                                </DeleteBusinessDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No businesses found.</p>
                        )}
                    </ul>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Business Name</TableHead>
                                <TableHead>Industry</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Credits</TableHead>
                                <TableHead>QR Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {businesses.length > 0 ? (
                                businesses.map((business) => (
                                    <TableRow key={business.id}>
                                        <TableCell className="font-medium">
                                            <div>{business.name}</div>
                                            {business.phone && (
                                                 <div className="text-xs text-muted-foreground flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    {business.phone}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>{business.industry}</TableCell>
                                        <TableCell>
                                            <div>{business.ownerName}</div>
                                            <div className="text-xs text-muted-foreground">{business.ownerEmail}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{business.message_credits || 0}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <StatusToggle
                                                businessId={business.id}
                                                currentStatus={business.qrStatus}
                                                onStatusChanged={onAction}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <ManageCreditsDialog businessId={business.id} businessName={business.name} onCreditsAdded={onAction} asChild>
                                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}><CreditCard className="mr-2 h-4 w-4" /> Manage Credits</DropdownMenuItem>
                                                    </ManageCreditsDialog>
                                                    <DropdownMenuSeparator />
                                                    <CopyLinkButton businessId={business.id} asChild>
                                                      <DropdownMenuItem><LinkIcon className="mr-2 h-4 w-4" /> Copy Link</DropdownMenuItem>
                                                    </CopyLinkButton>
                                                    <QRCodeDialog business={business} asChild>
                                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}><QrCode className="mr-2 h-4 w-4" /> View QR Code</DropdownMenuItem>
                                                    </QRCodeDialog>
                                                    <EditBusinessDialog business={business} industries={industries} onBusinessUpdated={onAction} asChild>
                                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                    </EditBusinessDialog>
                                                    <DropdownMenuSeparator />
                                                    <DeleteBusinessDialog businessId={business.id} businessName={business.name} onBusinessDeleted={onAction} asChild>
                                                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                                    </DeleteBusinessDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        No businesses found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
