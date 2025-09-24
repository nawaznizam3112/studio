
'use client';
import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createProduct } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "../ui/progress";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { Upload } from "lucide-react";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Adding...' : 'Add Recommended Product'}
        </Button>
    )
}

interface CreateProductFormProps {
    businessId: string;
    onProductCreated: () => void;
}

export function CreateProductForm({ businessId, onProductCreated }: CreateProductFormProps) {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const storageRef = ref(storage, `products/${businessId}/${Date.now()}_${file.name}`);
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
                    setImageUrl(downloadURL);
                    setUploadProgress(null);
                    toast({ title: "Success", description: "Image uploaded successfully." });
                });
            }
        );
    };

    async function handleAction(formData: FormData) {
        formData.append('businessId', businessId);
        formData.append('imageUrl', imageUrl);
        const result = await createProduct(formData);
        if (result.success) {
            toast({
                title: "Success!",
                description: "Product recommendation added.",
            });
            formRef.current?.reset();
            setImageUrl('');
        onProductCreated();
        } else {
            toast({
                title: "Error",
                description: result.error,
                variant: 'destructive',
            });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recommend a Product</CardTitle>
                <CardDescription>Add a product recommendation with an image and link.</CardDescription>
            </CardHeader>
            <CardContent>
                <form ref={formRef} action={handleAction} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input name="name" id="name" placeholder="e.g., Advanced Whitening Toothpaste" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea name="description" id="description" placeholder="Briefly describe why you recommend it." required />
                    </div>
                    <div className="space-y-2">
                         <Label>Product Image</Label>
                        <div 
                            className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md cursor-pointer"
                            onClick={handleFileSelect}
                        >
                            <div className="space-y-1 text-center">
                                {imageUrl ? (
                                    <img src={imageUrl} alt="Preview" className="mx-auto h-24 w-auto rounded-md" />
                                ) : (
                                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                                )}
                                <div className="flex text-sm text-muted-foreground">
                                    <p className="pl-1">{imageUrl ? 'Click to change image' : 'Click to upload an image'}</p>
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
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input name="price" id="price" type="number" step="0.01" placeholder="e.g., 150" required />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="productUrl">Product URL</Label>
                        <Input name="productUrl" id="productUrl" type="url" placeholder="https://example.com/product-link" required />
                        <p className="text-xs text-muted-foreground">Link to Amazon, your webstore, etc.</p>
                    </div>
                    <SubmitButton />
                </form>
            </CardContent>
        </Card>
    );
}
