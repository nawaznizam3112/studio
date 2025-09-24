
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteQuiz } from "@/app/actions";
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";

interface Quiz {
    id: string;
    title: string;
    questions: any[];
}

interface QuizListProps {
    quizzes: Quiz[];
    businessId: string;
    onQuizDeleted: () => void;
}

export function QuizList({ quizzes, businessId, onQuizDeleted }: QuizListProps) {
    const { toast } = useToast();

    const handleDelete = async (quizId: string) => {
        const result = await deleteQuiz(quizId, businessId);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            onQuizDeleted();
        } else {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Current Quizzes</CardTitle>
                <CardDescription>A list of quizzes you've created for patients.</CardDescription>
            </CardHeader>
            <CardContent>
                {quizzes && quizzes.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {quizzes.map(quiz => (
                            <AccordionItem value={quiz.id} key={quiz.id}>
                                <div className="flex items-center gap-2">
                                    <AccordionTrigger className="flex-1">
                                         <div className="flex items-center gap-4">
                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                                                <ClipboardCheck className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold">{quiz.title}</p>
                                                <p className="text-sm text-muted-foreground">{quiz.questions.length} Questions</p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>This will permanently delete the quiz: <span className="font-bold">{quiz.title}</span></AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleDelete(quiz.id)} className="bg-destructive hover:bg-destructive/90">
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                                <AccordionContent>
                                    <div className="ml-8 pl-6 border-l space-y-2">
                                        {quiz.questions.map((q, i) => (
                                            <div key={i}>
                                                <p className="font-medium text-sm">{i+1}. {q.text}</p>
                                                <ul className="list-disc pl-5 text-xs text-muted-foreground">
                                                    {q.options.map((o: any, j: number) => (
                                                        <li key={j}>{o.text}{o.tip && <span className="text-primary/80 italic"> - Tip: {o.tip}</span>}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">No quizzes created yet.</p>
                )}
            </CardContent>
        </Card>
    )
}

    