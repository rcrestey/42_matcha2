import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { NavLink } from 'react-router-dom';
import { toast } from 'react-toastify';

import { API_ENDPOINT, useIsMounted } from '../constants.js';
import InfiniteScrollContainer from './InfiniteScrollContainer.jsx';
import UnknownUserImage from '../assets/unknown_person.png';

const Container = styled.article`
    ${tw`mx-auto p-5 w-full overflow-y-auto relative h-full`}

    @media (min-width: 768px) {
        ${tw`w-3/5`}
    }
`;

const Title = styled.h2`
    font-family: 'Saira', sans-serif;

    ${tw`text-3xl mb-4`}
`;

const Item = styled.div`
    ${tw`flex items-center bg-white px-3 py-2 cursor-pointer`}

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

const Picture = styled.img`
    ${tw`w-16 h-16 rounded-full mr-6 object-cover`}
`;

const Username = styled.h3`
    ${tw`text-lg`}
`;

export default function HistoryList({ title, type, noData, dataProperty }) {
    const LIMIT = 10;

    const [lovers, setLovers] = useState([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const offsetsFetchedRef = useRef(new Set());

    const isMounted = useIsMounted();

    const fetchLovers = useCallback(
        offset => {
            if (offsetsFetchedRef.current.has(offset)) return;

            offsetsFetchedRef.current.add(offset);

            setLoading(true);

            return fetch(
                `${API_ENDPOINT}/user/${type}/history/${LIMIT}/${offset}`,
                {
                    credentials: 'include',
                }
            )
                .then(res => res.json())
                .then(
                    ({
                        [dataProperty]: {
                            data: newLovers,
                            data: { length: newLoversCount },
                            hasMore,
                        },
                    }) => {
                        if (!isMounted.current) return;

                        setHasMore(hasMore);

                        if (newLoversCount > 0) {
                            setLovers(lovers => [...lovers, ...newLovers]);
                            setOffset(offset => offset + newLoversCount);
                        }
                    }
                )
                .catch(() => {
                    toast('An error occured during data fetching');
                })
                .finally(() => {
                    if (!isMounted.current) return;

                    setLoading(false);
                });
        },
        [dataProperty, isMounted, type]
    );

    function fetchMore() {
        fetchLovers(offset);
    }

    useEffect(() => {
        fetchLovers(0);
    }, [fetchLovers]);

    return (
        <Container>
            <Title>{title}</Title>

            {lovers.length === 0 ? (
                <div>{loading ? 'loading …' : noData}</div>
            ) : (
                <InfiniteScrollContainer
                    fetchMore={fetchMore}
                    hasMore={hasMore}
                    className="mb-5 text-center"
                >
                    {lovers.map(({ uuid, username, src }, i) => (
                        <Item as={NavLink} to={`/profile/${uuid}`} key={i}>
                            <Picture
                                src={src || UnknownUserImage}
                                alt={`${username}'s profile picture`}
                            />

                            <Username>{username}</Username>
                        </Item>
                    ))}
                </InfiniteScrollContainer>
            )}
        </Container>
    );
}
