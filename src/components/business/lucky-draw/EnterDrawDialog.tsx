
'use client';

import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogDescription, 
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '../../ui/alert-dialog';
import { Campaign } from '../../../types/campaign';

interface EnterDrawDialogProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  businessName: string;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export function EnterDrawDialog({
  isOpen,
  onClose,
  campaign,
  businessName,
  onConfirm,
  isSubmitting = false,
}: EnterDrawDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Enter Lucky Draw: {campaign.title}</AlertDialogTitle>
          <AlertDialogDescription>
            To enter the draw for a <span className="font-bold">{campaign.prize}</span>, you must express interest in the following service:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-2 p-3 font-bold text-center bg-secondary rounded-md">
          {campaign.associatedService || 'the associated treatment'}
        </div>
        <AlertDialogDescription>
            This will create a lead for {businessName}. Do you want to proceed?
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Yes, Enter Now'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

    