
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { deleteBusiness } from '@/app/actions';
import { Trash2 } from 'lucide-react';
import { Slot } from '@radix-ui/react-slot';

interface DeleteBusinessDialogProps {
  businessId: string;
  businessName: string;
  onBusinessDeleted: () => void;
  asChild?: boolean;
  children?: React.ReactNode;
}

export function DeleteBusinessDialog({ businessId, businessName, onBusinessDeleted, asChild = false, children }: DeleteBusinessDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const Comp = asChild ? Slot : Button;


  const handleDelete = async () => {
    setIsLoading(true);
    const result = await deleteBusiness(businessId);
    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
      onBusinessDeleted();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {asChild ? <Comp>{children}</Comp> :
        <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
        </Button>}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the business account for{' '}
            <span className="font-bold">{businessName}</span> and remove all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} disabled={isLoading} className="bg-destructive hover:bg-destructive/90">
            {isLoading ? 'Deleting...' : 'Yes, delete business'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
