'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  suggestPatientFollowUps,
  type SuggestPatientFollowUpsOutput,
} from '@/ai/flows/suggest-patient-follow-ups';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { patientHistory as defaultPatientHistory } from '@/lib/data';

const formSchema = z.object({
  availableSlots: z.string().min(5, { message: 'Please describe available slots.' }),
  patientHistory: z.string().min(10, { message: 'Patient history is required.' }),
});

export function PatientSuggester() {
  const [result, setResult] = useState<SuggestPatientFollowUpsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      availableSlots: 'Tomorrow: 2 PM - 4 PM. Friday: 10 AM - 12 PM.',
      patientHistory: defaultPatientHistory.trim(),
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await suggestPatientFollowUps(values);
      setResult(res);
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error generating suggestions',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Clinic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="availableSlots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Appointment Slots</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Tomorrow from 2 PM to 4 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="patientHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient History Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a summary of recent patient visits."
                        className="h-48"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Get Suggestions
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Follow-up Suggestions</CardTitle>
          <CardDescription>AI-powered recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
          {result && (
            <div className="p-4 border rounded-md bg-secondary/50 min-h-[150px]">
              <ul className="list-disc space-y-2 pl-5 text-sm">
                {result.patientSuggestions.split('\n').filter(s => s.trim().length > 0 && s.startsWith('- ')).map((suggestion, index) => (
                  <li key={index}>{suggestion.substring(2)}</li>
                ))}
              </ul>
            </div>
          )}
          {!isLoading && !result && (
             <div className="flex items-center justify-center h-64 text-center text-muted-foreground">
                <p>Fill out the form to get patient follow-up suggestions.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
