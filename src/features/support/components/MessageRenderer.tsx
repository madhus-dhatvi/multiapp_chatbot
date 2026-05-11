import React from 'react';
import { ChatMessage } from '../../../types/chat';
import { QuickReplyMessage } from './QuickReplyMessage';
import { ResolutionActions } from './ResolutionActions';
import { TextMessage } from './TextMessage';

interface Props {
  message: ChatMessage;
  onOptionPress: (option: any) => void;
  onResolved: () => void;
  onNotResolved: () => void;
}

export const MessageRenderer = ({
  message,
  onOptionPress,
  onResolved,
  onNotResolved,
}: Props) => {
  switch (message.type) {
    case 'QUICK_REPLIES':
      return (
        <QuickReplyMessage
          message={message}
          onPress={onOptionPress}
        />
      );

    case 'RESOLUTION_ACTIONS':
      return (
        <ResolutionActions
          disabled={message.options?.every(o => o.disabled)}
          onResolved={onResolved}
          onNotResolved={onNotResolved}
        />
      );

    default:
      return <TextMessage message={message} />;
  }
};