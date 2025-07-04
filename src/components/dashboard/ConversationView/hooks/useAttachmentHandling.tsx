
import { supabase } from '@/integrations/supabase/client';
import { Attachment } from '../types';

export const useAttachmentHandling = () => {
  const saveAttachments = async (messageId: string, attachments: Attachment[]) => {
    if (!attachments || attachments.length === 0) return;

    const attachmentInserts = attachments.map(attachment => ({
      message_id: messageId,
      file_name: attachment.name,
      file_url: attachment.url,
      file_type: attachment.type,
      file_size: attachment.size
    }));

    const { error: attachmentError } = await supabase
      .from('message_attachments')
      .insert(attachmentInserts);

    if (attachmentError) {
      console.error('Error saving attachments:', attachmentError);
    }
  };

  return {
    saveAttachments
  };
};
