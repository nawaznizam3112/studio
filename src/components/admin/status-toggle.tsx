
'use client';

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { toggleBusinessStatus } from "@/app/actions";
import { useState } from "react";

interface StatusToggleProps {
    businessId: string;
    currentStatus: 'active' | 'inactive';
    onStatusChanged: () => void;
}

export function StatusToggle({ businessId, currentStatus, onStatusChanged }: StatusToggleProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleToggle = async () => {
        setIsLoading(true);
        const result = await toggleBusinessStatus(businessId, currentStatus);
        if (result.success) {
            toast({
                title: "Status Updated",
                description: result.message,
            });
            onStatusChanged();
        } else {
            toast({
                title: "Error",
                description: result.error,
                variant: 'destructive',
            });
        }
        setIsLoading(false);
    };

    return (
        <div className="inline-flex items-center gap-2">
            <Switch
                id={`status-toggle-${businessId}`}
                checked={currentStatus === 'active'}
                onCheckedChange={handleToggle}
                disabled={isLoading}
                aria-label="Toggle QR Code Status"
            />
            <Label htmlFor={`status-toggle-${businessId}`} className="text-sm font-medium">
                {currentStatus === 'active' ? 'Active' : 'Inactive'}
            </Label>
        </div>
    );
}
