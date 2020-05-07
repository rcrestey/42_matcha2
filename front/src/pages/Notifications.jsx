import React, { useMemo, useContext, useEffect } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';

import { AppContext } from '../app-context.js';
import RelativeTime from '../components/RelativeTime.jsx';
import { API_ENDPOINT } from '../constants.js';

const Container = styled.article`
    ${tw`mx-auto px-5 w-full mt-6 mb-4`}

    @media (min-width: 768px) {
        ${tw`w-3/5`}
    }
`;

const Title = styled.h2`
    font-family: 'Saira', sans-serif;

    ${tw`text-3xl mb-4`}
`;

const Notification = styled.div`
    ${tw`flex flex-col items-start bg-white px-3 py-2 cursor-pointer`}

    transition: background-color 200ms;

    &:first-of-type {
        ${tw`rounded-tl rounded-tr`}
    }

    &:not(:last-of-type) {
        ${tw`border-b border-gray-400`}
    }

    &:last-of-type {
        ${tw`rounded-bl rounded-br`}
    }

    &:hover {
        ${tw`bg-gray-300`}
    }
`;

const NotificationTitle = styled.h3`
    ${tw`text-lg`}
`;

const NotificationDescription = styled.p`
    ${tw`text-base`}
`;

const NotificationDate = styled(RelativeTime)`
    ${tw`text-red text-sm text-gray-600 font-medium`}
`;

const NOTIFICATIONS_TYPES = new Map([
    ['GOT_LIKE', 'Someone liked you'],
    ['GOT_VISIT', 'Someone visited your profile'],
    ['GOT_MESSAGE', 'New message'],
    ['GOT_LIKE_MUTUAL', "It's a match !"],
    ['GOT_UNLIKE_MUTUAL', 'Undo match'],
]);

const d = +new Date() - 1000;

function NoData() {
    return <div className="text-center">You received no one notification</div>;
}

export default function Notifications() {
    const {
        context: { notifications: notificationsArray },
        setContext,
    } = useContext(AppContext);

    const notifications = useMemo(
        () =>
            notificationsArray.map(({ uuid, type, message, createdAt }) => ({
                uuid,
                title: NOTIFICATIONS_TYPES.get(type),
                description: message,
                createdAt: createdAt || d,
            })),
        [notificationsArray]
    );

    useEffect(() => {
        fetch(`${API_ENDPOINT}/user/saw-notifications`, {
            credentials: 'include',
        }).catch(() => {});

        setContext(context => ({
            ...context,
            newDataNotifications: false,
        }));
    }, [setContext]);

    return (
        <Container>
            <Title>Notifications</Title>

            {notifications.length > 0 ? (
                notifications.map(({ uuid, title, description, createdAt }) => (
                    <Notification key={uuid}>
                        <NotificationTitle>{title}</NotificationTitle>

                        <NotificationDescription>
                            {description}
                        </NotificationDescription>

                        <NotificationDate datetime={createdAt} />
                    </Notification>
                ))
            ) : (
                <NoData />
            )}
        </Container>
    );
}
