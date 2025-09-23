import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Ticket } from "lucide-react";

export function GrandDrawCard() {
    const grandDrawImage = PlaceHolderImages.find(img => img.id === 'grand-draw-prize');

    return (
        <Card className="shadow-md h-full flex flex-col md:flex-row overflow-hidden">
            <div className="relative w-full md:w-2/5 h-48 md:h-auto">
                {grandDrawImage && (
                    <Image 
                        src={grandDrawImage.imageUrl} 
                        alt="Grand Prize" 
                        layout="fill" 
                        objectFit="cover" 
                        data-ai-hint={grandDrawImage.imageHint} 
                    />
                )}
            </div>
            <div className="flex flex-col justify-center p-6 w-full md:w-3/5">
                <CardHeader className="p-0 mb-4">
                    <CardTitle className="font-headline text-2xl">Platform-Level Grand Draw</CardTitle>
                    <CardDescription>A chance to win big with every entry!</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="mb-4">
                        <h4 className="font-semibold text-lg">Win a MacBook Pro!</h4>
                        <p className="text-muted-foreground text-sm">Every clinic campaign entry automatically earns you a ticket for the grand prize draw.</p>
                    </div>
                    <div className="flex items-center text-sm text-primary font-medium mb-4">
                        <Ticket className="h-5 w-5 mr-2" />
                        <span>Next Draw: August 31, 2024</span>
                    </div>
                    <Button variant="secondary">Learn More</Button>
                </CardContent>
            </div>
        </Card>
    );
}