
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { deleteStory } from "@/app/actions";
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

interface Story {
    id: string;
    title: string;
    content: string;
}

interface StoryListProps {
    stories: Story[];
    businessId: string;
    onStoryDeleted: () => void;
}

export function StoryList({ stories, businessId, onStoryDeleted }: StoryListProps) {
    const { toast } = useToast();

    const handleDelete = async (storyId: string) => {
        const result = await deleteStory(storyId, businessId);
        if (result.success) {
            toast({ title: "Success", description: result.message });
            onStoryDeleted();
        } else {
            toast({ title: "Error", description: result.error, variant: 'destructive' });
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Stories</CardTitle>
                <CardDescription>A list of stories you've created.</CardDescription>
            </CardHeader>
            <CardContent>
                {stories && stories.length > 0 ? (
                    <ul className="space-y-4">
                        {stories.map(story => (
                            <li key={story.id} className="flex items-start gap-4 rounded-md border p-4">
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-secondary">
                                    <BookOpen className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{story.title}</p>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{story.content}</p>
                                </div>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>This will permanently delete this story.</AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(story.id)} className="bg-destructive hover:bg-destructive/90">
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-center text-sm text-muted-foreground py-8">No stories created yet.</p>
                )}
            </CardContent>
        </Card>
    )
}
