
'use client';

import { useState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { addMessageCredits } from '@/app/actions';
import { CreditCard } from 'lucide-react';
import { Slot } from '@radix-ui/react-slot';

interface ManageCreditsDialogProps {
  businessId: string;
  businessName: string;
  onCreditsAdded: () => void;
  asChild?: boolean;
  children?: React.ReactNode;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Adding Credits...' : 'Add Credits'}
        </Button>
    )
}

export function ManageCreditsDialog({ businessId, businessName, onCreditsAdded, asChild = false, children }: ManageCreditsDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const Comp = asChild ? Slot : Button;


  async function handleAction(formData: FormData) {
    formData.append('businessId', businessId);
    const result = await addMessageCredits(formData);
    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
      onCreditsAdded();
      setOpen(false);
      formRef.current?.reset();
    } else {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {asChild ? (
            <Comp>{children}</Comp>
        ) : (
            <Button variant="outline" size="sm"><CreditCard className="mr-2 h-4 w-4" /> Credits</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Credits for {businessName}</DialogTitle>
          <DialogDescription>
            Manually add message credits to this business account.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={handleAction} className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="amount" className="text-right">
                Credits to Add
                </Label>
                <Input name="amount" id="amount" type="number" min="1" placeholder="e.g., 500" required />
            </div>
            <DialogFooter className="mt-4">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Cancel</Button>
                </DialogClose>
                <SubmitButton />
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
