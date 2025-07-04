
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface ConversationHeaderProps {
  onBack: () => void;
  adTitle?: string;
  otherParticipant: string;
}

const ConversationHeader = ({ onBack, adTitle, otherParticipant }: ConversationHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="w-4 h-4" />
      </Button>
      <div>
        <h2 className="text-2xl font-bold">
          {adTitle ? `Re: ${adTitle}` : 'Conversation directe'}
        </h2>
        <p className="text-muted-foreground">
          Avec: {otherParticipant}
        </p>
      </div>
    </div>
  );
};

export default ConversationHeader;
