import React, { useState, useEffect, useContext } from 'react';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import { Link } from 'react-router-dom';

import { AppContext } from '../app-context.js';
import { API_ENDPOINT, useIsMounted } from '../constants.js';

const Container = styled.div`
    ${tw`w-full min-h-full relative flex flex-col bg-white`}
`;

const Head = styled.div`
    ${tw`h-12 flex justify-center items-center px-4 py-2 bg-white shadow`}
`;

const List = styled.div`
    ${tw`flex-1 relative`}

    height: calc(100% - 3rem);
`;

const ItemHoverStyle = tw`opacity-50`;
const ItemFocusStyle = tw`opacity-100`;
const Item = styled.div`
    ${tw`flex items-center h-20 px-2 py-1 relative z-10`}

    &::before {
        ${tw`absolute inset-0 opacity-0 z-0`}

        content: '';
        background-color: rgba(0, 0, 0, 0.1);
        transition: opacity 200ms;
    }

    &:hover::before {
        ${ItemHoverStyle}
    }

    ${({ selected }) =>
        selected &&
        css`
            &&::before {
                ${ItemFocusStyle}
            }
        `}
`;

const Avatar = styled.img`
    ${tw`h-12 w-12 rounded-full bg-blue-700 mr-3 object-cover`}
`;

const ItemContent = styled.div`
    ${tw`flex flex-col overflow-hidden`}

    & > * {
        ${tw`overflow-hidden whitespace-no-wrap`}

        ${css`
            text-overflow: ellipsis;
        `}
    }
`;

const Correspondant = styled.h4`
    ${tw``}
`;

const Extract = styled.p`
    ${tw`text-gray-700 font-thin text-sm`}
`;

const NoData = styled.p`
    ${tw`h-full w-full flex items-center justify-center py-3 text-gray-600`}
`;

export default function ConversationsList({ id, className }) {
    const {
        context: {
            wsPubsub: pubsub,
            user: { uuid: meUuid },
        },
        setContext,
    } = useContext(AppContext);
    const [conversations, setConversations] = useState([]);
    const isMounted = useIsMounted();

    useEffect(() => {
        if (!pubsub) return;

        function onData(conversations) {
            if (!isMounted.current) return;

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

            setConversations(conversations);
        }

        pubsub.listen(onData);

        return () => {
            pubsub.unlisten(onData);
        };
    }, [id, isMounted, pubsub, setContext]);

    return (
        <Container className={className}>
            <Head>
                <h3>Conversations</h3>
            </Head>

            <List>
                {conversations.length === 0 ? (
                    <NoData>You joined no conversation</NoData>
                ) : (
                    conversations.map(({ uuid, title, messages, users }) => {
                        const description =
                            Array.isArray(messages) &&
                            messages[messages.length - 1]
                                ? messages[messages.length - 1].payload
                                : '';

                        const picture = users.reduce(
                            (picture, { uuid: userUuid, profilePic }) => {
                                if (picture !== null || userUuid === meUuid)
                                    return picture;

                                return profilePic;
                            },
                            null
                        );

                        return (
                            <Item
                                as={Link}
                                selected={uuid === id}
                                to={`/chat/${uuid}`}
                                key={uuid}
                            >
                                <Avatar src={picture} />

                                <ItemContent>
                                    <Correspondant>{title}</Correspondant>

                                    <Extract>{description}</Extract>
                                </ItemContent>
                            </Item>
                        );
                    })
                )}
            </List>
        </Container>
    );
}
