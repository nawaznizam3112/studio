
'use client';

import { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Upload } from 'lucide-react';
import Image from 'next/image';

interface CreateCampaignFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function CreateCampaignForm({ onSubmit, onCancel }: CreateCampaignFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prize, setPrize] = useState('');
  const [prizeImageUrl, setPrizeImageUrl] = useState<string | null>(null);
  const [associatedService, setAssociatedService] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ title, description, prize, prizeImageUrl, associatedService });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload this to a storage service
      // and get a URL. For now, we'll use a local object URL.
      setPrizeImageUrl(URL.createObjectURL(file));
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Create a New Lucky Draw</CardTitle>
        <CardDescription>Fill out the details for your new campaign.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Campaign Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prize">Prize</Label>
            <Input id="prize" value={prize} onChange={(e) => setPrize(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>Prize Image</Label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {prizeImageUrl ? (
                    <Image src={prizeImageUrl} alt="Prize preview" width={100} height={100} className="mx-auto h-24 w-auto object-contain rounded-md" />
                ) : (
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                )}
                <div className="flex text-sm text-muted-foreground">
                  <label
                    htmlFor="prizeImageUrl"
                    className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input id="prizeImageUrl" name="prizeImageUrl" type="file" className="sr-only" onChange={handleImageUpload} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="associatedService">Associated Service</Label>
            <Input id="associatedService" value={associatedService} onChange={(e) => setAssociatedService(e.target.value)} required />
            <p className="text-xs text-muted-foreground">This is the service users express interest in to enter the draw.</p>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit">Create Campaign</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
