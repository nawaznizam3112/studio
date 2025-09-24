
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Check, Link } from "lucide-react";
import { Slot } from "@radix-ui/react-slot";

interface CopyLinkButtonProps {
    businessId: string;
    asChild?: boolean
}

export function CopyLinkButton({ businessId, asChild = false }: CopyLinkButtonProps) {
    const { toast } = useToast();
    const [isCopied, setIsCopied] = useState(false);
    const Comp = asChild ? Slot : Button;

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent dialogs from closing
        
        // Dynamically get the site URL from the browser window
        const siteUrl = window.location.origin;
        const linkToCopy = `${siteUrl}/business/${businessId}`;

        try {
            await navigator.clipboard.writeText(linkToCopy);
            setIsCopied(true);
            toast({
                title: 'Copied to Clipboard!',
                description: 'The business link has been copied.',
            });
            setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
        } catch (error) {
            console.error('Failed to copy text: ', error);
            toast({
                title: 'Error',
                description: 'Failed to copy link.',
                variant: 'destructive',
            });
        }
    };
    
    if (asChild) {
        return (
            <Comp onClick={handleCopy}>
                {isCopied ? <><Check className="mr-2 h-4 w-4" /> Copied!</> : <>{children}</>}
            </Comp>
        )
    }

    return (
        <Button variant="outline" size="sm" onClick={handleCopy} disabled={isCopied}>
            {isCopied ? <Check className="mr-2 h-4 w-4" /> : <Link className="mr-2 h-4 w-4" />}
            {isCopied ? 'Copied!' : 'Copy Link'}
        </Button>
    );
}

function children(children: any): React.ReactNode {
    throw new Error("Function not implemented.");
}
