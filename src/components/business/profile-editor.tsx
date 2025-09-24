
'use client';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateBusiness } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface Business {
    id: string;
    name: string;
    industry: string;
    ownerName: string;
    ownerEmail: string;
    phone?: string;
    promoLinkUrl?: string;
    introVideoUrl?: string;
    promoVideoUrl?: string;
}

interface ProfileEditorProps {
    business: Business;
    onProfileUpdated: () => void;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Saving Changes...' : 'Save Changes'}
        </Button>
    )
}

export function ProfileEditor({ business, onProfileUpdated }: ProfileEditorProps) {
    const { toast } = useToast();
    const [introUrl, setIntroUrl] = useState(business.introVideoUrl || '');
    const [promoUrl, setPromoUrl] = useState(business.promoVideoUrl || '');

    async function handleAction(formData: FormData) {
        const result = await updateBusiness(business.id, formData);
        if (result.success) {
            toast({
                title: "Success!",
                description: result.message,
            });
            onProfileUpdated();
        } else {
            toast({
                title: "Error",
                description: result.error,
                variant: 'destructive',
            });
        }
    }

    const handleRemoveVideo = (type: 'intro' | 'promo', e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (type === 'intro') {
            setIntroUrl('');
        } else {
            setPromoUrl('');
        }
    }

    return (
        <form action={handleAction}>
            <Card>
                <CardHeader>
                    <CardTitle>Business Profile</CardTitle>
                    <CardDescription>Manage your business details and video content.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* These fields are passed through but not editable by the business owner from this form */}
                    <input type="hidden" name="business-name" value={business.name} />
                    <input type="hidden" name="industry" value={business.industry} />
                    <input type="hidden" name="owner-name" value={business.ownerName} />
                    <input type="hidden" name="owner-email" value={business.ownerEmail} />
                    <input type="hidden" name="phone" value={business.phone || ''} />
                    
                    <div className="space-y-2">
                        <Label htmlFor="introVideoUrl">Intro Video URL</Label>
                        <div className="flex items-center gap-2">
                            <Input 
                                name="introVideoUrl" 
                                id="introVideoUrl" 
                                type="url" 
                                placeholder="https://youtube.com/watch?v=..." 
                                value={introUrl}
                                onChange={(e) => setIntroUrl(e.target.value)}
                            />
                             <Button type="button" variant="ghost" size="icon" onClick={(e) => handleRemoveVideo('intro', e)} aria-label="Remove Intro Video">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">The video shown to customers in the digital lounge.</p>
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="promoVideoUrl">Promotional Video URL</Label>
                        <div className="flex items-center gap-2">
                            <Input 
                                name="promoVideoUrl" 
                                id="promoVideoUrl" 
                                type="url" 
                                placeholder="https://youtube.com/watch?v=..." 
                                value={promoUrl}
                                onChange={(e) => setPromoUrl(e.target.value)}
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={(e) => handleRemoveVideo('promo', e)} aria-label="Remove Promotional Video">
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                         <p className="text-xs text-muted-foreground">The short-form video shown in the reel on the customer dashboard.</p>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="promoLinkUrl">Promotional Link URL (Optional)</Label>
                        <Input name="promoLinkUrl" id="promoLinkUrl" type="url" defaultValue={business.promoLinkUrl} placeholder="https://example.com/your-page" />
                    </div>

                </CardContent>
                <CardFooter>
                    <SubmitButton />
                </CardFooter>
            </Card>
        </form>
    );
}

    