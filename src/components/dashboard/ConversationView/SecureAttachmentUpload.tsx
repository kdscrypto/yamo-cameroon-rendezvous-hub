import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Upload, File, Image, AlertTriangle, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AttachmentFile {
  id: string;
  file: File;
  progress: number;
  uploaded: boolean;
  url?: string;
  securityStatus: 'pending' | 'validating' | 'secure' | 'rejected';
  rejectionReason?: string;
}

interface SecureAttachmentUploadProps {
  onAttachmentsChange: (attachments: Array<{ url: string; name: string; type: string; size: number }>) => void;
  maxFiles?: number;
  maxSizeInMB?: number;
}

const SecureAttachmentUpload = ({ 
  onAttachmentsChange, 
  maxFiles = 5, 
  maxSizeInMB = 10 
}: SecureAttachmentUploadProps) => {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Validation côté client renforcée
  const validateFileSecurely = (file: File): { isValid: boolean; error?: string } => {
    // Vérifier la taille
    if (file.size > maxSizeInMB * 1024 * 1024) {
      return { isValid: false, error: `Fichier trop volumineux (max ${maxSizeInMB}MB)` };
    }

    // Vérifier l'extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.doc', '.docx'];
    const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return { isValid: false, error: `Type de fichier non autorisé: ${extension}` };
    }

    // Vérifier le nom du fichier pour éviter les caractères dangereux
    const dangerousChars = /[<>:"/\\|?*\x00-\x1f]/;
    if (dangerousChars.test(file.name)) {
      return { isValid: false, error: 'Nom de fichier contient des caractères non autorisés' };
    }

    // Vérifier la longueur du nom
    if (file.name.length > 255) {
      return { isValid: false, error: 'Nom de fichier trop long' };
    }

    return { isValid: true };
  };

  const uploadFileSecurely = async (attachment: AttachmentFile): Promise<{ url: string; name: string; type: string; size: number } | null> => {
    try {
      // Marquer comme en cours de validation
      setAttachments(prev => 
        prev.map(att => 
          att.id === attachment.id 
            ? { ...att, securityStatus: 'validating' as const }
            : att
        )
      );

      // Préparer les données pour l'upload sécurisé
      const formData = new FormData();
      formData.append('files', attachment.file);

      // Obtenir le token d'authentification
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session non trouvée');
      }

      // Appeler la fonction Edge sécurisée avec l'URL complète
      const response = await fetch('https://lusovklxvtzhluekhwvu.supabase.co/functions/v1/secure-file-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload response error:', errorText);
        throw new Error(errorText || 'Erreur lors de l\'upload');
      }

      const result = await response.json();
      
      if (!result.success || !result.files || result.files.length === 0) {
        throw new Error('Réponse invalide du serveur');
      }

      const uploadedFile = result.files[0];

      // Marquer comme sécurisé et uploadé
      setAttachments(prev => 
        prev.map(att => 
          att.id === attachment.id 
            ? { 
                ...att, 
                progress: 100, 
                uploaded: true, 
                url: uploadedFile.url,
                securityStatus: 'secure' as const
              }
            : att
        )
      );

      return {
        url: uploadedFile.url,
        name: attachment.file.name,
        type: attachment.file.type,
        size: attachment.file.size
      };

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      // Marquer comme rejeté
      setAttachments(prev => 
        prev.map(att => 
          att.id === attachment.id 
            ? { 
                ...att, 
                securityStatus: 'rejected' as const,
                rejectionReason: errorMessage
              }
            : att
        )
      );

      toast.error(`Erreur de sécurité: ${errorMessage}`);
      return null;
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      toast.error('Vous devez être connecté pour envoyer des fichiers');
      return;
    }

    if (attachments.length + acceptedFiles.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} fichiers autorisés`);
      return;
    }

    // Validation sécurisée côté client
    const validFiles: File[] = [];
    for (const file of acceptedFiles) {
      const validation = validateFileSecurely(file);
      if (!validation.isValid) {
        toast.error(`${file.name}: ${validation.error}`);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) {
      return;
    }

    setIsUploading(true);

    const newAttachments: AttachmentFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      uploaded: false,
      securityStatus: 'pending'
    }));

    setAttachments(prev => [...prev, ...newAttachments]);

    try {
      const uploadPromises = newAttachments.map(uploadFileSecurely);
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
    
    const remainingAttachments = getUploadedAttachments().filter(att => 
      !attachmentToRemove || att.url !== attachmentToRemove.url
    );
    onAttachmentsChange(remainingAttachments);
  };

  const getUploadedAttachments = () => {
    return attachments
      .filter(att => att.uploaded && att.url && att.securityStatus === 'secure')
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

  const getSecurityIcon = (status: AttachmentFile['securityStatus']) => {
    switch (status) {
      case 'pending':
        return <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />;
      case 'validating':
        return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
      case 'secure':
        return <Shield className="w-4 h-4 text-green-400" />;
      case 'rejected':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
    }
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
      <div className="flex items-center gap-2 text-sm text-blue-400">
        <Shield className="w-4 h-4" />
        <span>Upload sécurisé activé - Validation automatique des fichiers</span>
      </div>

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
            <p className="text-xs text-green-400 mt-1">
              🔒 Validation de sécurité automatique
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
                {!attachment.uploaded && attachment.securityStatus !== 'rejected' && (
                  <Progress value={attachment.progress} className="w-full h-1 mt-1" />
                )}
                {attachment.securityStatus === 'rejected' && attachment.rejectionReason && (
                  <p className="text-xs text-red-400 mt-1">❌ {attachment.rejectionReason}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {getSecurityIcon(attachment.securityStatus)}
                {attachment.securityStatus === 'secure' && (
                  <span className="text-xs text-green-400 font-medium">Sécurisé</span>
                )}
                {attachment.securityStatus === 'validating' && (
                  <span className="text-xs text-blue-400 font-medium">Validation...</span>
                )}
                {attachment.securityStatus === 'rejected' && (
                  <span className="text-xs text-red-400 font-medium">Rejeté</span>
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
          Validation sécurisée en cours...
        </div>
      )}
    </div>
  );
};

export default SecureAttachmentUpload;
