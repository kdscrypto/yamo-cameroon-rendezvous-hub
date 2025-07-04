
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserStatus from '../UserStatus';

interface ConversationHeaderProps {
  onBack: () => void;
  adTitle?: string;
  otherParticipant: string;
  otherParticipantId?: string;
}

const ConversationHeader = ({ 
  onBack, 
  adTitle, 
  otherParticipant, 
  otherParticipantId 
}: ConversationHeaderProps) => {
  return (
    <div className="flex items-center gap-3 p-4 border-b bg-white dark:bg-gray-800">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="w-4 h-4" />
      </Button>
      
      <div className="flex items-center gap-3 flex-1">
        {/* Avatar placeholder */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
          {otherParticipant.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {otherParticipant}
            </h2>
            {otherParticipantId && (
              <UserStatus userId={otherParticipantId} />
            )}
          </div>
          {adTitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              À propos de: {adTitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationHeader;
