'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  generateMarketingMaterials,
  type GenerateMarketingMaterialsOutput,
} from '@/ai/flows/generate-marketing-materials';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const formSchema = z.object({
  campaignName: z.string().min(2, { message: 'Campaign name is required.' }),
  serviceDescription: z.string().min(10, { message: 'Service description is too short.' }),
  targetAudience: z.string().min(2, { message: 'Target audience is required.' }),
  clinicName: z.string().min(2, { message: 'Clinic name is required.' }),
});

export function MarketingGenerator() {
  const [result, setResult] = useState<GenerateMarketingMaterialsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      campaignName: 'Free Dental Check-up Draw',
      serviceDescription: 'A comprehensive dental check-up including cleaning and polishing.',
      targetAudience: 'Families and young professionals',
      clinicName: 'My Clinic',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await generateMarketingMaterials(values);
      setResult(res);
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error generating materials',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Campaign Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="campaignName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Summer Smile Makeover" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="serviceDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the service being promoted." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Audience</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., College students, working mothers" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clinicName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Clinic Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your clinic's name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Materials
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Generated Content</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {result && (
            <Tabs defaultValue="poster">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="poster">Poster</TabsTrigger>
                <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                <TabsTrigger value="sms">SMS</TabsTrigger>
              </TabsList>
              <TabsContent value="poster">
                <div className="relative mt-4 p-4 border rounded-md bg-secondary/50 min-h-[150px]">
                  <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(result.posterText, 'poster')}>
                    {copied === 'poster' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <p className="text-sm whitespace-pre-wrap">{result.posterText}</p>
                </div>
              </TabsContent>
              <TabsContent value="whatsapp">
                <div className="relative mt-4 p-4 border rounded-md bg-secondary/50 min-h-[150px]">
                  <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(result.whatsappCopy, 'whatsapp')}>
                    {copied === 'whatsapp' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <p className="text-sm whitespace-pre-wrap">{result.whatsappCopy}</p>
                </div>
              </TabsContent>
              <TabsContent value="sms">
                <div className="relative mt-4 p-4 border rounded-md bg-secondary/50 min-h-[150px]">
                  <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(result.smsReminder, 'sms')}>
                    {copied === 'sms' ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <p className="text-sm whitespace-pre-wrap">{result.smsReminder}</p>
                </div>
              </TabsContent>
            </Tabs>
          )}
          {!isLoading && !result && (
             <div className="flex items-center justify-center h-64 text-center text-muted-foreground">
                <p>Fill out the form to generate marketing content.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
