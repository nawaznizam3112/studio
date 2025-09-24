
'use client';

import { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateBusiness } from '@/app/actions';
import type { Business, Industry } from './business-list';
import { Edit } from 'lucide-react';
import { Slot } from '@radix-ui/react-slot';

interface EditBusinessDialogProps {
  business: Business;
  industries: Industry[];
  onBusinessUpdated: () => void;
  asChild?: boolean;
  children?: React.ReactNode;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Saving...' : 'Save Changes'}
        </Button>
    )
}

export function EditBusinessDialog({ business, industries, onBusinessUpdated, asChild = false, children }: EditBusinessDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const Comp = asChild ? Slot : Button;


  async function handleAction(formData: FormData) {
    const result = await updateBusiness(business.id, formData);
    if (result.success) {
      toast({
        title: 'Success!',
        description: result.message,
      });
      onBusinessUpdated();
      setOpen(false);
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
        {asChild ? <Comp>{children}</Comp> : 
        <Button variant="ghost" size="sm">Edit</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Business</DialogTitle>
          <DialogDescription>
            Make changes to the business details here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form action={handleAction} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="business-name" className="text-right">
                Business Name
                </Label>
                <Input name="business-name" id="business-name" defaultValue={business.name} className="col-span-3" required />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="industry" className="text-right">
                Industry
                </Label>
                 <Select name="industry" defaultValue={business.industry} required>
                    <SelectTrigger id="industry" className="col-span-3">
                        <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                    <SelectContent>
                        {industries.map(industry => (
                            <SelectItem key={industry.id} value={industry.name}>{industry.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="owner-name" className="text-right">
                Owner's Name
                </Label>
                <Input name="owner-name" id="owner-name" defaultValue={business.ownerName} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="owner-email" className="text-right">
                Owner's Email
                </Label>
                <Input name="owner-email" id="owner-email" type="email" defaultValue={business.ownerEmail} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                Phone
                </Label>
                <Input name="phone" id="phone" type="tel" defaultValue={business.phone} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="promoLinkUrl" className="text-right">
                Promo Link URL
                </Label>
                <Input name="promoLinkUrl" id="promoLinkUrl" type="url" defaultValue={business.promoLinkUrl} placeholder="https://example.com/promo" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="introVideoUrl" className="text-right">
                Intro Video URL
                </Label>
                <Input name="introVideoUrl" id="introVideoUrl" type="url" defaultValue={business.introVideoUrl} placeholder="https://youtube.com/watch?v=..." className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="promoVideoUrl" className="text-right">
                Promo Video URL
                </Label>
                <Input name="promoVideoUrl" id="promoVideoUrl" type="url" defaultValue={business.promoVideoUrl} placeholder="https://youtube.com/watch?v=..." className="col-span-3" />
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
