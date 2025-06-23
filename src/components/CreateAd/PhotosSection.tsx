
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Image, Upload, X } from 'lucide-react';

interface PhotosSectionProps {
  formData: {
    photos: File[];
  };
  onInputChange: (field: string, value: File[]) => void;
}

const PhotosSection = ({ formData, onInputChange }: PhotosSectionProps) => {
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos = [...formData.photos, ...files].slice(0, 6); // Limite à 6 photos
    onInputChange('photos', newPhotos);
  };

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    onInputChange('photos', newPhotos);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Photos</CardTitle>
        <CardDescription>
          Ajoutez jusqu'à 6 photos pour rendre votre annonce plus attractive
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Photo upload area */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              Glissez vos photos ici ou cliquez pour sélectionner
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <Button 
              type="button" 
              variant="outline"
              onClick={() => document.getElementById('photo-upload')?.click()}
              disabled={formData.photos.length >= 6}
            >
              <Upload className="w-4 h-4 mr-2" />
              Choisir des photos ({formData.photos.length}/6)
            </Button>
          </div>

          {/* Photo preview grid */}
          {formData.photos.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PhotosSection;
