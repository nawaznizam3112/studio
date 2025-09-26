
import { Skeleton } from "@/components/ui/skeleton";
import { Hourglass } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoadingSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <Hourglass className="mx-auto h-12 w-12 text-primary/50 animate-spin" />
                    <CardTitle>Processing QR Code...</CardTitle>
                    <CardDescription>Please wait a moment.</CardDescription>
                </CardHeader>
            </Card>
        </div>
    );
}
