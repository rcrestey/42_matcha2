import React, { useState, useEffect } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { toast } from 'react-toastify';

import { API_ENDPOINT, fetcher, useIsMounted } from '../constants.js';

import ProfileCard from '../components/ProfileCard.jsx';

const Container = styled.article`
    ${tw`mx-auto px-5 w-full`}

    @media (min-width: 768px) {
        ${tw`w-4/5`}
    }

    @media (min-width: 1280px) {
        ${tw`w-3/5`}
    }
`;

export default function Profile() {
    const { uuid } = useParams();
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);

    const isMounted = useIsMounted();

    useEffect(() => {
        setIsLoading(true);

        fetcher(`${API_ENDPOINT}/user/${uuid}`, {
            json: true,
            credentials: 'include',
        })
            .then(res => res.json())
            .then(user => {
                if (!isMounted.current) return;

                setUser(user);
            })
            .catch(() => {})
            .finally(() => {
                if (!isMounted.current) return;

                setIsLoading(false);
            });
    }, [isMounted, uuid]);

    function onLike() {
        const isLikingTheProfile = ['VIRGIN', 'HAS_LIKED_US'].includes(
            user.likeStatus
        );
        const action = isLikingTheProfile ? 'like' : 'unlike';

        let newStatus = '';

        switch (user.likeStatus) {
            case 'VIRGIN':
                newStatus = 'LIKED_IT';
                break;
            case 'HAS_LIKED_US':
                newStatus = 'MATCH';
                break;
            case 'LIKED_IT':
                newStatus = 'VIRGIN';
                break;
            case 'MATCH':
                newStatus = 'HAS_LIKED_US';
                break;
            default:
                return;
        }

        setUser(user => ({
            ...user,
            likeStatus: newStatus,
        }));

        fetch(`${API_ENDPOINT}/user/${action}/${uuid}`, {
            method: 'POST',
            credentials: 'include',
        })
            .catch(() => {})
            .finally(() => {
                toast(`You ${action}d ${user.username}`, {
                    type: 'success',
                });
            });
    }

    function onBlock() {
        fetch(`${API_ENDPOINT}/user/block/${uuid}`, {
            method: 'POST',
            credentials: 'include',
        })
            .catch(() => {})
            .finally(() => {
                toast(`You blocked ${user.username}`, {
                    type: 'success',
                });

                if (!isMounted.current) return;

                setUser(null);
            });
    }

    function onReport() {
        fetch(`${API_ENDPOINT}/user/report/${uuid}`, {
            method: 'POST',
            credentials: 'include',
        })
            .catch(() => {})
            .finally(() => {
                toast(`You reported ${user.username}`, {
                    type: 'success',
                });
            });
    }

    if (isLoading === false && user === null) {
        return <Redirect to="/404" />;
    }

    return (
        <Container>
            {isLoading || user === null ? (
                <div>Loading …</div>
            ) : (
                <ProfileCard
                    {...user}
                    flat
                    onLike={onLike}
                    onBlock={onBlock}
                    onReport={onReport}
                />
            )}
        </Container>
    );
}
