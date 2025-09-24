
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { createQuiz } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2 } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

interface Option {
    text: string;
    tip?: string;
}

interface Question {
    text: string;
    options: Option[];
}

interface CreateQuizFormProps {
    businessId: string;
    onQuizCreated: () => void;
}

export function CreateQuizForm({ businessId, onQuizCreated }: CreateQuizFormProps) {
    const { toast } = useToast();
    const [title, setTitle] = useState('');
    const [questions, setQuestions] = useState<Question[]>([{ text: '', options: [{ text: '' }, { text: '' }] }]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleQuestionChange = (qIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].text = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex].text = value;
        setQuestions(newQuestions);
    };
    
    const handleTipChange = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex].tip = value;
        setQuestions(newQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, { text: '', options: [{ text: '' }, { text: '' }] }]);
    };

    const removeQuestion = (qIndex: number) => {
        const newQuestions = questions.filter((_, index) => index !== qIndex);
        setQuestions(newQuestions);
    };

    const addOption = (qIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options.push({ text: '' });
        setQuestions(newQuestions);
    };

    const removeOption = (qIndex: number, oIndex: number) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, index) => index !== oIndex);
        setQuestions(newQuestions);
    };
    
    const resetForm = () => {
        setTitle('');
        setQuestions([{ text: '', options: [{ text: '' }, { text: '' }] }]);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const quizData = {
            businessId,
            title,
            questions
        };

        const result = await createQuiz(quizData);

        if (result.success) {
            toast({ title: "Success!", description: result.message });
            resetForm();
            onQuizCreated();
        } else {
            toast({
                title: "Error Creating Quiz",
                description: result.error || 'Please check your form for errors.',
                variant: 'destructive'
            });
        }
        setIsSubmitting(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>New Quiz</CardTitle>
                <CardDescription>Engage customers with an interactive quiz.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <ScrollArea className="h-96 pr-4">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="quiz-title">Quiz Title</Label>
                                <Input id="quiz-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Daily Health Check" required />
                            </div>

                            {questions.map((question, qIndex) => (
                                <div key={qIndex} className="space-y-4 rounded-md border p-4 relative">
                                    <div className="space-y-2">
                                        <Label htmlFor={`q-${qIndex}-text`}>Question {qIndex + 1}</Label>
                                        <Input id={`q-${qIndex}-text`} value={question.text} onChange={(e) => handleQuestionChange(qIndex, e.target.value)} placeholder="e.g., How do you feel today?" required />
                                    </div>

                                    {question.options.map((option, oIndex) => (
                                        <div key={oIndex} className="ml-4 space-y-2 rounded-md border p-3">
                                            <Label htmlFor={`q-${qIndex}-o-${oIndex}-text`}>Option {oIndex + 1}</Label>
                                            <div className="flex items-center gap-2">
                                                <Input id={`q-${qIndex}-o-${oIndex}-text`} value={option.text} onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)} placeholder="e.g., Great!" required />
                                                {question.options.length > 2 && (
                                                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => removeOption(qIndex, oIndex)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                )}
                                            </div>
                                             <Label htmlFor={`q-${qIndex}-o-${oIndex}-tip`} className="text-xs text-muted-foreground">Instant Tip (Optional)</Label>
                                            <Textarea id={`q-${qIndex}-o-${oIndex}-tip`} value={option.tip} onChange={(e) => handleTipChange(qIndex, oIndex, e.target.value)} placeholder="e.g., Glad to hear it! Keep it up." rows={2} />
                                        </div>
                                    ))}
                                    
                                    <Button type="button" variant="outline" size="sm" onClick={() => addOption(qIndex)}>
                                        <PlusCircle className="mr-2" /> Add Option
                                    </Button>
                                    
                                    {questions.length > 1 && (
                                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8" onClick={() => removeQuestion(qIndex)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                            ))}

                            <Button type="button" variant="secondary" className="w-full" onClick={addQuestion}>
                                <PlusCircle className="mr-2" /> Add Another Question
                            </Button>
                        </div>
                    </ScrollArea>
                    <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Quiz'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

    