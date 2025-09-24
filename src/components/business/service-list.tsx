
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteService } from "@/app/actions";
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

interface Service {
    id: string;
    name: string;
}

interface ServiceListProps {
    services: Service[];
    businessId: string;
    onServiceDeleted: () => void;
}

export function ServiceList({ services, businessId, onServiceDeleted }: ServiceListProps) {
    const { toast } = useToast();

    const handleDelete = async (serviceId: string) => {
        const result = await deleteService(serviceId, businessId);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            onServiceDeleted();
        } else {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Services</CardTitle>
                <CardDescription>A list of services your business offers.</CardDescription>
            </CardHeader>
            <CardContent>
                {services && services.length > 0 ? (
                    <ul className="space-y-3">
                        {services.map(service => (
                            <li key={service.id} className="flex items-center gap-4 rounded-md border p-3">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                                    <List className="h-4 w-4 text-secondary-foreground" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium">{service.name}</p>
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
                                            <AlertDialogDescription>This will permanently delete the service: <span className="font-bold">{service.name}</span>.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(service.id)} className="bg-destructive hover:bg-destructive/90">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">No services created yet.</p>
                )}
            </CardContent>
        </Card>
    )
}
