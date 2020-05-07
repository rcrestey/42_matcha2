import React from 'react';
import { useParams } from 'react-router-dom';

import ConversationId from '../components/ConversationId.jsx';

export default function ChatConversation() {
    const { uuid } = useParams();

    return <ConversationId id={uuid} />;
}
