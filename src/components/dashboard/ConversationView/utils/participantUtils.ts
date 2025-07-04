
export const getOtherParticipantFromConversation = (
  conversation: any,
  userId: string | undefined,
  otherParticipantProfile: any
): string => {
  if (otherParticipantProfile?.full_name) {
    return otherParticipantProfile.full_name;
  }
  
  if (otherParticipantProfile?.email) {
    return otherParticipantProfile.email;
  }
  
  if (!conversation) return 'Utilisateur inconnu';
  
  const participants = Array.isArray(conversation.participants) 
    ? conversation.participants as string[]
    : [];
  
  const otherParticipantId = participants.find((p: string) => p !== userId);
  return otherParticipantId || 'Utilisateur inconnu';
};

export const getOtherParticipantId = (
  conversation: any,
  userId: string | undefined
): string | undefined => {
  if (!conversation || !userId) return undefined;
  
  const participants = Array.isArray(conversation.participants) 
    ? conversation.participants as string[]
    : [];
  
  return participants.find((p: string) => p !== userId);
};
