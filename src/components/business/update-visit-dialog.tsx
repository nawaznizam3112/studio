
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
import { updateVisit } from '@/app/actions';
import { Textarea } from '../ui/textarea';
import { IndianRupee } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface UpdateVisitDialogProps {
  visitId: string;
  userId: string;
  onVisitUpdated: () => void;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Submitting...' : 'Submit for Confirmation'}
        </Button>
    )
}

export function UpdateVisitDialog({ visitId, userId, onVisitUpdated }: UpdateVisitDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);


  async function handleAction(formData: FormData) {
    formData.append('visitId', visitId);
    formData.append('userId', userId);

    const result = await updateVisit(formData);
    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
      onVisitUpdated();
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
        <Button variant="outline" size="sm">Add Expense</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Visit Expense</DialogTitle>
          <DialogDescription>
            Enter the details for this visit. The customer will be asked to confirm.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={handleAction} className="grid gap-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="amount">Amount Spent</Label>
                <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input name="amount" id="amount" type="number" step="0.01" min="0" placeholder="e.g., 1500" className="pl-8" required />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="paymentMode">Payment Mode</Label>
                <Select name="paymentMode" required>
                    <SelectTrigger id="paymentMode">
                        <SelectValue placeholder="Select payment mode..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="wallet">Wallet</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea name="notes" id="notes" placeholder="e.g., Scaling + Polishing" />
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
