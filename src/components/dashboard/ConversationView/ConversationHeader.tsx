
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import UserStatus from '../UserStatus';

interface ConversationHeaderProps {
  onBack: () => void;
  adTitle?: string;
  otherParticipant: string;
  otherParticipantId?: string;
}

const ConversationHeader = ({ onBack, adTitle, otherParticipant, otherParticipantId }: ConversationHeaderProps) => {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeft className="w-4 h-4" />
      </Button>
      <div className="flex-1">
        <h2 className="text-2xl font-bold">
          {adTitle ? `Re: ${adTitle}` : 'Conversation directe'}
        </h2>
        <div className="flex items-center gap-2">
          <p className="text-muted-foreground">
            Avec: {otherParticipant}
          </p>
          {otherParticipantId && (
            <UserStatus userId={otherParticipantId} showText />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationHeader;
