
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useParams } from 'next/navigation';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, Gift, Share2, Copy } from 'lucide-react';
import { campaigns } from '@/lib/data';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Please enter your name.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  treatmentInterest: z.string({ required_error: 'Please select a treatment of interest.' }),
  whatsappOptIn: z.boolean().default(false),
});

export default function EntryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const params = useParams();
  const campaign = campaigns.find(c => c.id === params.id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      whatsappOptIn: true,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    console.log(values);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: 'Entry Confirmed!',
      description: "You're now in the draw. Good luck!",
    });
    setIsSubmitted(true);
    setIsLoading(false);
  }

  const handleCopyReferral = () => {
    const referralLink = `${window.location.origin}/entry/${campaign?.id}?ref=12345`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: "Referral link copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };


  if (!campaign) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The campaign you are looking for does not exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if(isSubmitted) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-secondary/30 p-4">
            <div className="w-full max-w-md">
                <Card className="shadow-2xl">
                    <CardHeader className="items-center text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                        <CardTitle className="font-headline text-3xl">You're In!</CardTitle>
                        <CardDescription>Your entry for the "{campaign.name}" is confirmed.</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center space-y-6">
                        <div className="bg-primary/10 p-4 rounded-lg border border-dashed border-primary/50">
                            <h3 className="font-semibold flex items-center justify-center gap-2"><Gift className="h-5 w-5"/>You've won:</h3>
                            <p className="text-sm">1 Entry to the Clinic Draw</p>
                            <p className="text-sm font-bold text-primary">1 Entry to the MacBook Pro Grand Draw!</p>
                        </div>
                        <div className="bg-accent/10 p-4 rounded-lg border border-dashed border-accent/50">
                             <h3 className="font-semibold flex items-center justify-center gap-2"><Share2 className="h-5 w-5" />Boost Your Chances!</h3>
                             <p className="text-sm text-muted-foreground mt-2 mb-4">Get extra Grand Draw entries for every friend who signs up.</p>
                             <Button onClick={handleCopyReferral} className="w-full">
                                {copied ? <CheckCircle className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                                {copied ? 'Link Copied!' : 'Copy Your Referral Link'}
                             </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
             <div className="mt-8">
                <Logo />
             </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-secondary/30 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="items-center text-center">
             <Logo className="mb-2"/>
            <CardTitle className="font-headline text-2xl">{campaign.name}</CardTitle>
            <CardDescription>Enter now for a chance to win amazing prizes!</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="9876543210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="treatmentInterest"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Treatment of Interest</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a service..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {campaign.services?.map((service) => (
                            <SelectItem key={service} value={service}>
                              {service}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="whatsappOptIn"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                      <FormControl>
                         <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I agree to receive updates via WhatsApp.
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full !mt-6">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Enter Lucky Draw'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
       <div className="mt-8">
            <Logo />
       </div>
    </div>
  );
}
