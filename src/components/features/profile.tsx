
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useSession } from "@/hooks/use-session.tsx";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Skeleton } from "../ui/skeleton";
import { db } from "@/lib/firebase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "@/hooks/use-toast";
import { updateUserProfile, changeUserPassword, deleteUserAccount } from "@/app/actions";
import { useFormStatus } from "react-dom";
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
import { useRouter } from "next/navigation";

interface UserProfile {
    name?: string;
    email?: string;
    phone?: string;
}

function SubmitButton({ children }: { children: React.ReactNode }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Saving...' : children}
        </Button>
    )
}

export function Profile() {
  const { session, loading: sessionLoading, clearSession } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const editProfileFormRef = useRef<HTMLFormElement>(null);
  const changePasswordFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.userId) {
        setLoading(false);
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", session.userId));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      } finally {
        setLoading(false);
      }
    }
    if (!sessionLoading) {
        fetchProfile();
    }
  }, [session, sessionLoading]);

  const handleUpdateProfile = async (formData: FormData) => {
    if (!session?.userId) return;
    formData.append('userId', session.userId);
    const result = await updateUserProfile(formData);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      setProfile(prev => ({...prev, name: formData.get('name') as string, phone: formData.get('phone') as string}));
    } else {
      toast({ title: "Error", description: result.error, variant: 'destructive' });
    }
  }
  
  const handleChangePassword = async (formData: FormData) => {
    if (!session?.userId) return;
    if (formData.get('newPassword') !== formData.get('confirmPassword')) {
        toast({ title: "Error", description: "New passwords do not match.", variant: 'destructive' });
        return;
    }
    formData.append('userId', session.userId);
    const result = await changeUserPassword(formData);
    if (result.success) {
      toast({ title: "Success", description: result.message });
      changePasswordFormRef.current?.reset();
    } else {
      toast({ title: "Error", description: result.error, variant: 'destructive' });
    }
  }

  const handleDeleteAccount = async () => {
    if (!session?.userId) return;
    const result = await deleteUserAccount(session.userId);
    if (result.success) {
      toast({ title: "Account Deleted", description: result.message });
      clearSession();
      router.push('/login');
    } else {
      toast({ title: "Error", description: result.error, variant: 'destructive' });
    }
  }


  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  if (loading || sessionLoading) {
    return <ProfileSkeleton />
  }

  if (!session || !profile) {
    return (
       <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle>Not Logged In</CardTitle>
            <CardDescription>Please log in to view your profile.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
                <Link href="/login">Go to Login</Link>
            </Button>
          </CardContent>
       </Card>
    )
  }
  
  return (
    <Card className="w-full max-w-2xl">
        <CardHeader>
            <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                    <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(profile.name)}`} alt="User avatar" data-ai-hint="person face" />
                    <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle>{profile.name}</CardTitle>
                    <CardDescription>{profile.email}</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Profile Details</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-6">
                    <form ref={editProfileFormRef} action={handleUpdateProfile} className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>Update your name and phone number.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" defaultValue={profile.name} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" defaultValue={profile.email} disabled />
                                    <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" name="phone" type="tel" defaultValue={profile.phone} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <SubmitButton>Save Changes</SubmitButton>
                            </CardFooter>
                        </Card>
                    </form>
                </TabsContent>
                <TabsContent value="security" className="mt-6">
                    <div className="space-y-6">
                        <form ref={changePasswordFormRef} action={handleChangePassword} className="space-y-4">
                             <Card>
                                <CardHeader>
                                    <CardTitle>Change Password</CardTitle>
                                    <CardDescription>Update your account password.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                     <div className="space-y-2">
                                        <Label htmlFor="currentPassword">Current Password</Label>
                                        <Input id="currentPassword" name="currentPassword" type="password" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input id="newPassword" name="newPassword" type="password" required />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                        <Input id="confirmPassword" name="confirmPassword" type="password" required />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <SubmitButton>Change Password</SubmitButton>
                                </CardFooter>
                            </Card>
                        </form>
                        <Card className="border-destructive">
                            <CardHeader>
                                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                                <CardDescription>These actions are irreversible.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive">Delete My Account</Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                                                Yes, delete my account
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}

function ProfileSkeleton() {
  return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
            <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div>
                    <Skeleton className="h-7 w-40" />
                    <Skeleton className="h-5 w-52 mt-1" />
                </div>
            </div>
        </CardHeader>
        <CardContent>
           <div className="space-y-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-64 w-full" />
           </div>
        </CardContent>
    </Card>
  )
}
