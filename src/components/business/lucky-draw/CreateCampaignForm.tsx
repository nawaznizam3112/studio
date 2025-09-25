
'use client';
import { useState } from 'react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Label } from '../../ui/label';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { CreateCampaignData } from '@/types/campaign';

interface CreateCampaignFormProps {
  onSubmit: (data: CreateCampaignData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CreateCampaignForm({ onSubmit, onCancel, isLoading }: CreateCampaignFormProps) {
  const [formData, setFormData] = useState<CreateCampaignData>({
    title: '',
    description: '',
    prize: '',
    associatedService: '',
    prizeImageUrl: undefined,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (field: keyof CreateCampaignData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, prizeImageUrl: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, prizeImageUrl: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = formData.title && formData.description && formData.prize && formData.associatedService;

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center justify-between">
              Create New Lucky Draw
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title</Label>
                <Input
                  id="title"
                  placeholder="Enter campaign title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your lucky draw campaign"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reward">Prize</Label>
                <Input
                  id="reward"
                  placeholder="Enter the prize (e.g., Free laser session)"
                  value={formData.prize}
                  onChange={(e) => handleInputChange('prize', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Prize Image</Label>
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Prize preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="p-3 bg-muted rounded-full">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              Click to upload prize image
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                        </div>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="associatedService">Associated Service</Label>
                <Input
                  id="associatedService"
                  placeholder="Service name (e.g., Laser Hair Removal)"
                  value={formData.associatedService}
                  onChange={(e) => handleInputChange('associatedService', e.target.value)}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  This is the service users express interest in to enter the draw.
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!isFormValid || isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                >
                  {isLoading ? 'Creating...' : 'Create Campaign'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
