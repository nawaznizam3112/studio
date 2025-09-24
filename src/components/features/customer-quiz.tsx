
'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, ArrowRight, CheckCircle, Lightbulb } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Quiz {
    id: string;
    title: string;
    questions: {
        text: string;
        options: {
            text: string;
            tip?: string;
        }[];
    }[];
}

interface CustomerQuizProps {
    quiz: Quiz;
    onQuizComplete: (results: { question: string; answer: string }[]) => void;
}

export function CustomerQuiz({ quiz, onQuizComplete }: CustomerQuizProps) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [instantTip, setInstantTip] = useState<string | null>(null);
    const [isCompleted, setIsCompleted] = useState(false);

    const currentQuestion = quiz.questions[currentQuestionIndex];

    const handleValueChange = (value: string) => {
        setSelectedOption(value);
        const tip = currentQuestion.options.find(opt => opt.text === value)?.tip;
        setInstantTip(tip || null);
    };

    const handleNext = () => {
        if (selectedOption) {
            // Save answer
            const newAnswers = { ...answers, [currentQuestionIndex]: selectedOption };
            setAnswers(newAnswers);

            // Move to next question or complete
            if (currentQuestionIndex < quiz.questions.length - 1) {
                setCurrentQuestionIndex(currentQuestionIndex + 1);
                setSelectedOption(null);
                setInstantTip(null);
            } else {
                // Quiz finished
                const finalResults = quiz.questions.map((q, index) => ({
                    question: q.text,
                    answer: newAnswers[index],
                }));
                onQuizComplete(finalResults);
                setIsCompleted(true);
            }
        }
    };
    
    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setSelectedOption(answers[currentQuestionIndex - 1] || null);
            const prevQuestion = quiz.questions[currentQuestionIndex - 1];
            const prevAnswer = answers[currentQuestionIndex - 1];
            const tip = prevQuestion.options.find(opt => opt.text === prevAnswer)?.tip;
            setInstantTip(tip || null);
        }
    }
    
    if (isCompleted) {
        return (
            <Alert variant="default" className="border-green-500">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>Quiz Completed!</AlertTitle>
                <AlertDescription>
                    Thank you for your responses. Your doctor will review them shortly.
                </AlertDescription>
            </Alert>
        )
    }

    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

    return (
        <Card className="bg-secondary/50">
            <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>Answer these questions to help us understand you better.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <Label className="font-semibold">{currentQuestionIndex + 1}. {currentQuestion.text}</Label>
                        <Progress value={progress} className="mt-2 h-2" />
                    </div>
                    
                    <RadioGroup onValueChange={handleValueChange} value={selectedOption || ""}>
                        {currentQuestion.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2 rounded-md border bg-background p-3">
                                <RadioGroupItem value={option.text} id={`q${currentQuestionIndex}-o${index}`} />
                                <Label htmlFor={`q${currentQuestionIndex}-o${index}`} className="flex-1 cursor-pointer">{option.text}</Label>
                            </div>
                        ))}
                    </RadioGroup>

                    {instantTip && (
                        <Alert>
                            <Lightbulb className="h-4 w-4" />
                            <AlertTitle>Instant Tip!</AlertTitle>
                            <AlertDescription>
                                {instantTip}
                            </AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-between pt-4">
                        <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                            <ArrowLeft className="mr-2"/> Previous
                        </Button>
                        <Button onClick={handleNext} disabled={!selectedOption}>
                            {currentQuestionIndex < quiz.questions.length - 1 ? "Next" : "Finish Quiz"}
                             <ArrowRight className="ml-2"/>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

    