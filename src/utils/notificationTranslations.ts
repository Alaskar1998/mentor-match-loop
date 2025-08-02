import { useTranslation } from 'react-i18next';
import { translateSkill } from './translationUtils';

export const translateNotificationContent = (
  notificationType: string,
  data: any,
  language: string
): { title: string; message: string } => {
  const { t } = useTranslation();

  const userName = data?.userName || data?.senderName || 'مستخدم';
  const skillName = data?.skillName ? translateSkill(data.skillName, language) : '';
  const message = data?.message || '';

  switch (notificationType) {
    case 'review_received':
      return {
        title: t('actions.reviewReceived'),
        message: t('actions.reviewReceivedDesc', { name: userName })
      };

    case 'exchange_finished':
      return {
        title: t('actions.exchangeFinished'),
        message: t('actions.exchangeFinishedDesc', { name: userName })
      };

    case 'exchange_active':
      return {
        title: t('actions.exchangeActive'),
        message: t('actions.exchangeActiveDesc', { name: userName })
      };

    case 'exchange_request':
      return {
        title: t('actions.exchangeRequest'),
        message: t('actions.exchangeRequestDesc', { name: userName })
      };

    case 'invitation_received':
      return {
        title: t('actions.newInvitationReceived'),
        message: t('actions.newInvitationReceivedDesc', { name: userName, skill: skillName })
      };

    case 'exchange_completed':
      return {
        title: t('actions.exchangeCompleted'),
        message: t('actions.exchangeCompletedDesc', { name: userName })
      };

    case 'contract_ready_for_review':
      return {
        title: t('actions.contractReadyForReview'),
        message: t('actions.contractReadyForReviewDesc', { name: userName })
      };

    case 'invitation_accepted':
      return {
        title: t('actions.invitationAccepted'),
        message: t('actions.invitationAcceptedDesc', { name: userName, skill: skillName })
      };

    case 'profile_viewed':
      return {
        title: t('actions.profileViewed'),
        message: t('actions.profileViewedDesc', { name: userName })
      };

    case 'exchange_declined':
      return {
        title: t('actions.exchangeDeclined'),
        message: t('actions.exchangeDeclinedDesc', { name: userName })
      };

    case 'exchange_started':
      return {
        title: t('actions.exchangeStarted'),
        message: t('actions.exchangeStartedDesc', { name: userName })
      };

    case 'new_message':
      return {
        title: t('actions.newMessage'),
        message: t('actions.newMessageDesc', { name: userName, message: message })
      };

    default:
      return {
        title: notificationType,
        message: 'إشعار جديد'
      };
  }
};

export const getNotificationIcon = (notificationType: string): string => {
  switch (notificationType) {
    case 'review_received':
    case 'exchange_request':
    case 'exchange_active':
    case 'exchange_started':
    case 'contract_ready_for_review':
    case 'exchange_declined':
      return '🎯';
    case 'exchange_finished':
      return '📬';
    case 'invitation_received':
      return '📨';
    case 'exchange_completed':
      return '🎉';
    case 'invitation_accepted':
      return '✅';
    case 'profile_viewed':
      return '👁️';
    case 'new_message':
      return '💬';
    default:
      return '📬';
  }
}; 