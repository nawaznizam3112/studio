
'use client';
import { useRef, useState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createCampaign, getServicesForBusiness } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "../ui/progress";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Upload } from "lucide-react";


function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Creating...' : 'Create Campaign'}
        </Button>
    )
}

interface CreateCampaignFormProps {
    businessId?: string;
    onCampaignCreated: () => void;
}

export function CreateCampaignForm({ businessId, onCampaignCreated }: CreateCampaignFormProps) {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [services, setServices] = useState<{id: string, name: string}[]>([]);
    const [loadingServices, setLoadingServices] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [prizeImageUrl, setPrizeImageUrl] = useState<string>('');
    
    useEffect(() => {
        if (!businessId) {
            setServices([]);
            return;
        }

        async function fetchServices() {
            setLoadingServices(true);
            const result = await getServicesForBusiness(businessId);
            if (result.services) {
                setServices(result.services);
            } else {
                console.error("Failed to fetch services for campaign form");
            }
            setLoadingServices(false);
        }
        
        fetchServices();
    }, [businessId]);

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const storageRef = ref(storage, `campaign_prizes/${businessId || 'platform'}/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Upload failed:", error);
                toast({ title: "Upload Failed", description: "Could not upload image.", variant: 'destructive' });
                setUploadProgress(null);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    setPrizeImageUrl(downloadURL);
                    setUploadProgress(null);
                    toast({ title: "Success", description: "Prize image uploaded successfully." });
                });
            }
        );
    };

    async function handleAction(formData: FormData) {
        if (businessId) {
            formData.append('businessId', businessId);
        }
        formData.append('prizeImageUrl', prizeImageUrl);

        const result = await createCampaign(formData);
        if (result.success) {
            toast({
                title: "Success!",
                description: result.message,
            });
            formRef.current?.reset();
            setPrizeImageUrl('');
            onCampaignCreated();
        } else {
            toast({
                title: "Error",
                description: result.error,
                variant: 'destructive',
            });
        }
    }

    return (
        <form ref={formRef} action={handleAction} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Campaign Title</Label>
                <Input name="title" id="title" placeholder="e.g., Monthly Wellness Draw" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea name="description" id="description" placeholder="e.g., Enter to win a free consultation!" required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="reward">Prize</Label>
                <Input name="reward" id="reward" placeholder="e.g., Free laser session" required />
            </div>
            <div className="space-y-2">
                <Label>Prize Image (Optional)</Label>
                <div 
                    className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer"
                    onClick={handleFileSelect}
                >
                    <div className="space-y-1 text-center">
                        {prizeImageUrl ? (
                            <img src={prizeImageUrl} alt="Preview" className="mx-auto h-24 w-auto rounded-md object-contain" />
                        ) : (
                            <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        )}
                        <div className="flex text-sm text-muted-foreground">
                            <p className="pl-1">{prizeImageUrl ? 'Click to change image' : 'Click to upload an image'}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                    </div>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*"
                />
                {uploadProgress !== null && (
                    <div className="mt-2">
                        <Progress value={uploadProgress} />
                        <p className="text-xs text-center mt-1">{Math.round(uploadProgress)}%</p>
                    </div>
                )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="associatedService">Associated Service (for Lead Gen)</Label>
                {businessId ? (
                    <Select name="associatedService">
                        <SelectTrigger id="associatedService" disabled={loadingServices}>
                            <SelectValue placeholder={loadingServices ? "Loading services..." : "Select a service..."} />
                        </SelectTrigger>
                        <SelectContent>
                             <SelectItem value="Any Service">Any Service</SelectItem>
                            {services.map(service => (
                                <SelectItem key={service.id} value={service.name}>{service.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Input name="associatedService" id="associatedService" placeholder="e.g., Advanced Laser Hair Removal" required />
                )}
                <p className="text-xs text-muted-foreground">This is the service users express interest in to enter the draw.</p>
            </div>
            <SubmitButton />
        </form>
    );
}
