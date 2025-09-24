
'use client';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, Send, User } from 'lucide-react';
import { askAI } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSession } from '@/hooks/use-session.tsx';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function AIChatbot() {
    const { session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !session?.userId) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const result = await askAI({ query: currentInput, userId: session.userId });
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
                setMessages(prev => prev.filter(msg => msg.content !== currentInput));
            } else {
                const assistantMessage: Message = { role: 'assistant', content: result.response || 'Sorry, I could not process that.' };
                setMessages(prev => [...prev, assistantMessage]);
            }
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to get response from AI.' });
            setMessages(prev => prev.filter(msg => msg.content !== currentInput));
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Card className="flex h-[32rem] flex-col">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>AI Stylist / Trainer</CardTitle>
                      <CardDescription>Your personal AI assistant.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full">
                    <div className="space-y-4 p-4">
                        {messages.length === 0 && !isLoading && (
                            <div className="text-center text-sm text-muted-foreground">
                                <p>Ask me anything about style or fitness!</p>
                                <p className="text-xs">e.g., "Which haircut suits my face?"</p>
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                {message.role === 'assistant' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            <Bot className="h-4 w-4" />
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`max-w-[75%] rounded-lg p-3 text-sm ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                    {message.content.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                                </div>
                                {message.role === 'user' && (
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback>
                                        <User className="h-4 w-4" />
                                      </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="bg-primary text-primary-foreground">
                                    <Bot className="h-4 w-4" />
                                  </AvatarFallback>
                                </Avatar>
                                <div className="max-w-[75%] rounded-lg bg-secondary p-3">
                                  <div className="flex items-center gap-1.5">
                                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{animationDelay: '0ms'}}></span>
                                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{animationDelay: '200ms'}}></span>
                                      <span className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{animationDelay: '400ms'}}></span>
                                  </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </ScrollArea>
            </CardContent>
            <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        disabled={isLoading || !session}
                        autoComplete="off"
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !input.trim() || !session}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send message</span>
                    </Button>
                </form>
            </div>
        </Card>
    );
}
