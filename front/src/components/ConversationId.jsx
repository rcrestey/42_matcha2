import React, {
    useState,
    useEffect,
    useRef,
    useLayoutEffect,
    useMemo,
    useContext,
} from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import FeathersIcon from 'feather-icons-react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

import { AppContext } from '../app-context.js';
import { API_ENDPOINT, useIsMounted } from '../constants.js';

const Container = styled.div`
    ${tw`w-full min-h-full relative flex flex-col justify-between items-stretch bg-white`}
`;

const Head = styled.div`
    ${tw`h-12 flex justify-center items-center px-4 py-2 bg-white shadow`}
`;

const MessagesContainer = styled.div`
    ${tw`flex-1 relative`}
`;

const Messages = styled.div`
    ${tw`flex flex-col items-stretch absolute inset-0 overflow-y-scroll p-2`}
`;

const LastMessageStyle = tw`rounded-b-lg mb-4`;
const Message = styled.div`
    ${tw`rounded-none px-2 py-1 bg-gray-300 break-words`}

    max-width: 80%;
    margin-bottom: 0.125rem;

    @media (min-width: 640px) {
        max-width: 66.666667%;
    }

    &.left {
        ${tw`self-start rounded-tr-lg rounded-br-lg`}
    }
    &.right {
        ${tw`self-end bg-blue-700 text-white rounded-tl-lg rounded-bl-lg`}
    }

    &:first-child {
        ${tw`rounded-t-lg`}
    }
    &.left + &.right,
    &.right + &.left {
        ${tw`rounded-t-lg`}
    }

    ${({ last }) => last && LastMessageStyle}
`;

const Form = styled.div`
    ${tw`h-12 px-3 py-1`}
`;

const InputContainer = styled.label`
    ${tw`flex items-center w-full h-full rounded-full bg-gray-300 cursor-text`}
`;

const Input = styled.input`
    ${tw`flex-1 bg-transparent ml-2`}

    &::placeholder {
        ${tw`text-gray-800`}
    }

    &:focus {
        ${tw`outline-none`}
    }
`;

const SendButton = styled.button`
    ${tw`flex justify-center items-center h-8 w-8 mr-2 rounded-full bg-blue-500 text-white cursor-pointer`}
`;

export default function ConversationId({ id }) {
    const {
        context: {
            wsPubsub: pubsub,
            ws,
            user: me,
            user: { uuid: currentUserUuid },
        },
        setContext,
    } = useContext(AppContext);
    const location = useLocation();
    const [message, setMessage] = useState('');
    const [conversation, setConversation] = useState(undefined);

    const isMounted = useIsMounted();

    const messagesContainerRef = useRef(null);

    const messages = useMemo(() => {
        if (
            !(
                conversation !== undefined &&
                Array.isArray(conversation.messages)
            )
        )
            return [];

        return conversation.messages;
    }, [conversation]);

    const title = (conversation && conversation.title) || id;

    useEffect(() => {
        if (!pubsub) return;

        function onData(data) {
            if (!isMounted) return;

            if (!['/chat', '/chat/'].includes(location.pathname)) {
                fetch(`${API_ENDPOINT}/user/chat/saw-messages`, {
                    credentials: 'include',
                    method: 'PUT',
                }).catch(() => {});

                setTimeout(() => {
                    setContext(context => ({
                        ...context,
                        newDataConversations: false,
                    }));
                }, 100);
            }

            setConversation(data);
        }

        pubsub.subscribe(id, onData);

        return () => {
            pubsub.unsubscribe(id, onData);
        };
    }, [id, isMounted, location.pathname, pubsub, setContext]);

    useLayoutEffect(() => {
        if (messagesContainerRef.current === null) return;

        messagesContainerRef.current.scrollTo({
            top: 1000000,
            behavior: 'smooth',
        });
    }, [messages]);

    function onSend(e) {
        if (e) {
            e.stopPropagation();
        }

        setMessage('');

        const trimmedMessage = message.trim();

        if (conversation === undefined || trimmedMessage.length === 0) return;
        if (trimmedMessage.length > 255) {
            toast("Your message is too long, don't exceed 255 characters", {
                type: 'error',
            });
            return;
        }

        ws.publishMessage(id, trimmedMessage);

        pubsub._publish(id, {
            ...conversation,
            messages: [
                ...conversation.messages,
                {
                    authorUuid: currentUserUuid,
                    authorUsername: me.username,
                    createdAt: +new Date(),
                    payload: trimmedMessage,
                },
            ],
        });
    }

    function isMyMessage(messageUuid) {
        return currentUserUuid === messageUuid;
    }

    // If the id is not correct
    if (String(id).length !== 36) {
        return <Container />;
    }

    return (
        <Container>
            <Head>{title}</Head>

            <MessagesContainer>
                <Messages ref={messagesContainerRef}>
                    {messages.map(({ uuid, authorUuid, payload }, i) => {
                        const putOnLeft = !isMyMessage(authorUuid);

                        const nextMessage = messages[i + 1];
                        const isLastOfGroup =
                            nextMessage === undefined ||
                            authorUuid !== nextMessage.authorUuid;

                        return (
                            <Message
                                className={putOnLeft ? 'left' : 'right'}
                                last={isLastOfGroup}
                                key={uuid || i}
                            >
                                {payload}
                            </Message>
                        );
                    })}
                </Messages>
            </MessagesContainer>

            <Form>
                <InputContainer>
                    <Input
                        placeholder="Write your message…"
                        value={message}
                        onChange={({ target: { value } }) => setMessage(value)}
                        onKeyPress={({ key }) => {
                            key === 'Enter' && onSend();
                        }}
                    />

                    <SendButton onClick={onSend}>
                        <FeathersIcon icon="send" size={16} />
                    </SendButton>
                </InputContainer>
            </Form>
        </Container>
    );
}
