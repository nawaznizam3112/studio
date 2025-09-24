
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Link as LinkIcon, ExternalLink, ImageOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteProduct } from "@/app/actions";
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
import Link from 'next/link';
import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    productUrl?: string;
    imageUrl?: string;
}

interface ProductListProps {
    products: Product[];
    businessId: string;
    onProductDeleted: () => void;
}

export function ProductList({ products, businessId, onProductDeleted }: ProductListProps) {
    const { toast } = useToast();

    const handleDelete = async (productId: string) => {
        const result = await deleteProduct(productId, businessId);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            onProductDeleted();
        } else {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Recommended Products</CardTitle>
                <CardDescription>A list of products you recommend to patients.</CardDescription>
            </CardHeader>
            <CardContent>
                {products && products.length > 0 ? (
                    <ul className="space-y-4">
                        {products.map(product => (
                            <li key={product.id} className="flex items-start gap-4 rounded-md border p-4">
                                <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0 flex items-center justify-center">
                                    <Image 
                                        src={product.imageUrl || `https://picsum.photos/seed/${product.id}/64/64`}
                                        alt={product.name}
                                        width={64}
                                        height={64}
                                        className="rounded-md object-cover"
                                        data-ai-hint="product image"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{product.name}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                                    <p className="text-sm font-bold text-primary mt-1">₹{product.price.toFixed(2)}</p>
                                    {product.productUrl && (
                                        <Button asChild variant="link" className="p-0 h-auto text-xs">
                                            <Link href={product.productUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="mr-1 h-3 w-3" /> View Product Link
                                            </Link>
                                        </Button>
                                    )}
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This will permanently delete the recommendation for: <span className="font-bold">{product.name}</span>.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-destructive hover:bg-destructive/90">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-10">
                        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                        <p className="mt-4 text-sm text-muted-foreground">No recommended products yet.</p>
                        <p className="text-xs text-muted-foreground">Use the form to add your first recommendation.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
