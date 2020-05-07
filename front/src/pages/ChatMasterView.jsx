import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { useParams } from 'react-router-dom';

import ConversationsList from '../components/ConversationsList.jsx';
import ConversationId from '../components/ConversationId.jsx';

const Container = styled.div`
    ${tw`flex flex-nowrap w-full h-full relative`}

    & > :nth-child(1) {
        ${tw`w-1/3`}

        max-width: 350px;
    }

    & > :nth-child(2) {
        ${tw`flex-1 border-l border-gray-300`}
    }
`;

export default function ChatMasterView() {
    const { uuid } = useParams();

    return (
        <Container>
            <ConversationsList id={uuid} />

            <ConversationId id={uuid} />
        </Container>
    );
}
