
'use client';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Gift, Megaphone, Play, ExternalLink } from "lucide-react";
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getAllActiveOffers } from '@/app/actions';
import Link from 'next/link';
import { Skeleton } from '../ui/skeleton';


interface Offer {
  id: string;
  title: string;
  description: string;
  businessName: string;
  businessId: string;
  pointsRequired: number;
  expiresAt: string;
}

export function PromotionalFeed() {
    const [promotions, setPromotions] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchOffers() {
            setLoading(true);
            const { offers, error } = await getAllActiveOffers();
            if (error) {
                console.error("Failed to fetch offers:", error);
            } else {
                setPromotions(offers || []);
            }
            setLoading(false);
        }
        fetchOffers();
    }, []);

    const getPromotionIcon = (type: string) => {
        switch (type) {
          case 'video': return <Video className="w-5 h-5 text-white" />;
          case 'offer': return <Gift className="w-5 h-5 text-white" />;
          default: return <Megaphone className="w-5 h-5 text-white" />;
        }
    };
    
    const getPromotionColor = (type: string) => {
        switch (type) {
          case 'video': return 'from-blue-500 to-cyan-500';
          case 'offer': return 'from-green-500 to-lime-500';
          default: return 'from-purple-500 to-indigo-500';
        }
    };
    
    const renderLoading = () => (
        <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
                 <Card key={i} className="overflow-hidden">
                    <Skeleton className="w-full aspect-video" />
                    <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-6 h-6 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </Card>
            ))}
        </div>
    )

    if (loading) {
        return renderLoading();
    }
    
    if (promotions.length === 0) {
        return (
            <Card className="p-8 text-center text-muted-foreground">
                <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg">No Promotions Available</h3>
                <p>Check back later for new offers and promotions!</p>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            {promotions.map((promotion, index) => (
                <motion.div
                    key={promotion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                    <Card className="overflow-hidden">
                         <div className="relative">
                            <Image
                                src={`https://picsum.photos/seed/${promotion.id}/400/225`}
                                alt={promotion.title}
                                width={400}
                                height={225}
                                className="w-full object-cover aspect-video"
                                data-ai-hint="advertisement image"
                            />
                            <div className={`absolute top-2 right-2 p-2 rounded-full bg-gradient-to-tr ${getPromotionColor('offer')}`}>
                                {getPromotionIcon('offer')}
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Image
                                    src={`https://picsum.photos/seed/${promotion.businessId}/40/40`}
                                    alt={promotion.businessName}
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                    data-ai-hint="logo"
                                />
                                <Link href={`/business/${promotion.businessId}`} className="text-sm font-medium text-muted-foreground hover:underline">
                                    {promotion.businessName}
                                </Link>
                            </div>
                            <h4 className="font-semibold text-lg">{promotion.title}</h4>
                            <p className="text-muted-foreground text-sm mt-1">{promotion.description}</p>
                            <div className="mt-3 flex items-center justify-between">
                                <Badge className="bg-red-500 text-white text-base">
                                    ₹{promotion.pointsRequired}
                                </Badge>
                                <Button asChild size="sm">
                                    <Link href={`/business/${promotion.businessId}`}>
                                        View Offer <ExternalLink className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}
