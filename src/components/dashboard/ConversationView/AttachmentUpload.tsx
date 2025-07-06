
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, File, Image } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AttachmentFile {
  id: string;
  file: File;
  progress: number;
  uploaded: boolean;
  url?: string;
}

interface AttachmentUploadProps {
  onAttachmentsChange: (attachments: Array<{ url: string; name: string; type: string; size: number }>) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
}

const AttachmentUpload = ({ 
  onAttachmentsChange, 
  maxFiles = 5, 
  maxSizeInMB = 10 
}: AttachmentUploadProps) => {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (attachment: AttachmentFile): Promise<{ url: string; name: string; type: string; size: number } | null> => {
    try {
      const fileExt = attachment.file.name.split('.').pop();
      const fileName = `${user!.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      console.log('Uploading file to message-attachments bucket:', fileName);

      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, attachment.file);

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      console.log('File uploaded successfully:', data);

      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(fileName);

      console.log('Public URL generated:', publicUrl);

      // Update progress to 100%
      setAttachments(prev => 
        prev.map(att => 
          att.id === attachment.id 
            ? { ...att, progress: 100, uploaded: true, url: publicUrl }
            : att
        )
      );

      return {
        url: publicUrl,
        name: attachment.file.name,
        type: attachment.file.type,
        size: attachment.file.size
      };
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Erreur lors de l'upload de ${attachment.file.name}`);
      setAttachments(prev => prev.filter(att => att.id !== attachment.id));
      return null;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      toast.error('Vous devez être connecté pour envoyer des fichiers');
      return;
    }

    console.log('Files dropped:', acceptedFiles);

    if (attachments.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} fichiers autorisés`);
      return;
    }

    const oversizedFiles = acceptedFiles.filter(file => file.size > maxSizeInMB * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`Fichier(s) trop volumineux. Maximum ${maxSizeInMB}MB par fichier.`);
      return;
    }

    setIsUploading(true);

    const newAttachments: AttachmentFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      uploaded: false
    }));

    setAttachments(prev => [...prev, ...newAttachments]);

    try {
      const uploadPromises = newAttachments.map(uploadFile);
      const uploadedFiles = await Promise.all(uploadPromises);
      const successfulUploads = uploadedFiles.filter(file => file !== null);
      
      if (successfulUploads.length > 0) {
        const currentUploaded = getUploadedAttachments();
        onAttachmentsChange([...currentUploaded, ...successfulUploads]);
        toast.success(`${successfulUploads.length} fichier(s) uploadé(s) avec succès`);
      }
    } catch (error) {
      console.error('Error during upload process:', error);
      toast.error('Erreur lors de l\'upload des fichiers');
    } finally {
      setIsUploading(false);
    }
  }, [user, attachments, maxFiles, maxSizeInMB, onAttachmentsChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading || attachments.length >= maxFiles,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'text/*': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  const removeAttachment = (id: string) => {
    const attachmentToRemove = attachments.find(att => att.id === id);
    setAttachments(prev => prev.filter(att => att.id !== id));
    
    // Update the parent component with remaining attachments
    const remainingAttachments = getUploadedAttachments().filter(att => 
      !attachmentToRemove || att.url !== attachmentToRemove.url
    );
    onAttachmentsChange(remainingAttachments);
  };

  const getUploadedAttachments = () => {
    return attachments
      .filter(att => att.uploaded && att.url)
      .map(att => ({
        url: att.url!,
        name: att.file.name,
        type: att.file.type,
        size: att.file.size
      }));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading || attachments.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        {isDragActive ? (
          <p className="text-white">Déposez les fichiers ici...</p>
        ) : (
          <div>
            <p className="text-sm text-white mb-1">
              Cliquez ou glissez-déposez des fichiers ici
            </p>
            <p className="text-xs text-gray-500">
              Maximum {maxFiles} fichiers, {maxSizeInMB}MB par fichier
            </p>
          </div>
        )}
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-white">Fichiers joints ({attachments.length}/{maxFiles})</h4>
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
              {getFileIcon(attachment.file.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white">{attachment.file.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(attachment.file.size)}</p>
                {!attachment.uploaded && (
                  <Progress value={attachment.progress} className="w-full h-1 mt-1" />
                )}
              </div>
              <div className="flex items-center gap-2">
                {attachment.uploaded ? (
                  <span className="text-xs text-green-400 font-medium">Uploadé</span>
                ) : (
                  <span className="text-xs text-blue-400 font-medium">
                    {Math.round(attachment.progress)}%
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(attachment.id)}
                  disabled={isUploading}
                  className="text-white hover:bg-muted/40"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isUploading && (
        <div className="flex items-center gap-2 text-sm text-blue-400">
          <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          Upload en cours...
        </div>
      )}
    </div>
  );
};

export default AttachmentUpload;
