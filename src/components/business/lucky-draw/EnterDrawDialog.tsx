
'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Gift, Phone, Mail, AlertTriangle } from 'lucide-react';
import { Campaign } from '../../../types/campaign';

interface EnterDrawDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  businessName: string;
  onConfirm: (customerData: { name: string; phone: string; email?: string }) => void;
  isSubmitting?: boolean;
  initialUserData: { name: string; phone: string; email?: string };
}

export function EnterDrawDialog({ 
  isOpen, 
  onClose, 
  campaign, 
  businessName, 
  onConfirm,
  isSubmitting,
  initialUserData,
}: EnterDrawDialogProps) {
  
  const [customerData, setCustomerData] = useState(initialUserData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!customerData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!customerData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\+]?[\d\s\-\(\)]{10,}$/.test(customerData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (customerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      onConfirm({
        name: customerData.name.trim(),
        phone: customerData.phone.trim(),
        email: customerData.email.trim() || undefined
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md mx-4">
        <AlertDialogHeader className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center">
              <Gift className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <AlertDialogTitle className="text-center text-xl">
            Enter Lucky Draw
          </AlertDialogTitle>
          
          <div className="space-y-3">
            <div className="text-center">
              <Badge variant="secondary" className="bg-gradient-to-r from-purple-600 to-blue-500 text-white border-0 mb-2">
                {campaign.prize}
              </Badge>
              <p className="text-sm text-muted-foreground">
                From {businessName}
              </p>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Service Interest:</p>
                  <p className="text-muted-foreground">{campaign.associatedService}</p>
                </div>
              </div>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Full Name *</Label>
            <Input
              id="customer-name"
              placeholder="Enter your full name"
              value={customerData.name}
              onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
              className={errors.name ? 'border-destructive' : ''}
              readOnly={!!initialUserData.name}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-phone">Phone Number *</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="customer-phone"
                placeholder="Enter your phone number"
                value={customerData.phone}
                onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                className={`pl-10 ${errors.phone ? 'border-destructive' : ''}`}
                readOnly={!!initialUserData.phone}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-email">Email (Optional)</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="customer-email"
                type="email"
                placeholder="Enter your email address"
                value={customerData.email}
                onChange={(e) => setCustomerData(prev => ({ ...prev, email: e.target.value }))}
                className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                 readOnly={!!initialUserData.email}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>
        </div>

        <AlertDialogDescription className="text-center text-sm bg-muted/30 p-3 rounded-lg">
          This will create a lead for the business. A confirmation SMS will be sent to the business owner. 
          Do you want to proceed?
        </AlertDialogDescription>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel onClick={handleClose} className="flex-1" disabled={isSubmitting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Entering...' : 'Yes, Enter Now'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
