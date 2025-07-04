
import { useState } from 'react';
import { useModerationMutations } from './useModerationMutations';

export const useModerationHandlers = () => {
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickModerationAd, setQuickModerationAd] = useState<any>(null);
  const [quickModerationAction, setQuickModerationAction] = useState<'approve' | 'reject' | null>(null);
  const [isQuickDialogOpen, setIsQuickDialogOpen] = useState(false);
  
  const { quickApproveMutation, quickRejectMutation } = useModerationMutations();

  const handleViewAd = (ad: any) => {
    console.log('Opening moderation modal for ad:', ad.id);
    setSelectedAd(ad);
    setIsModalOpen(true);
  };

  const handleQuickApprove = (ad: any) => {
    console.log('Quick approve triggered for ad:', ad.id);
    setQuickModerationAd(ad);
    setQuickModerationAction('approve');
    setIsQuickDialogOpen(true);
  };

  const handleQuickReject = (ad: any) => {
    console.log('Quick reject triggered for ad:', ad.id);
    setQuickModerationAd(ad);
    setQuickModerationAction('reject');
    setIsQuickDialogOpen(true);
  };

  const handleQuickModerationConfirm = (message?: string) => {
    if (!quickModerationAd) return;

    if (quickModerationAction === 'approve') {
      quickApproveMutation.mutate(quickModerationAd.id);
    } else if (quickModerationAction === 'reject' && message) {
      quickRejectMutation.mutate({ adId: quickModerationAd.id, message });
    }

    setIsQuickDialogOpen(false);
    setQuickModerationAd(null);
    setQuickModerationAction(null);
  };

  const handleModerationComplete = () => {
    console.log('Moderation completed, refreshing data');
    setIsModalOpen(false);
    setSelectedAd(null);
  };

  return {
    selectedAd,
    isModalOpen,
    setIsModalOpen,
    quickModerationAd,
    quickModerationAction,
    isQuickDialogOpen,
    setIsQuickDialogOpen,
    quickApproveMutation,
    quickRejectMutation,
    handleViewAd,
    handleQuickApprove,
    handleQuickReject,
    handleQuickModerationConfirm,
    handleModerationComplete
  };
};
