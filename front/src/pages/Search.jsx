import React, {
    useState,
    useCallback,
    useRef,
    useMemo,
    useEffect,
} from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { toast } from 'react-toastify';

import ProfilesContainer from '../components/ProfilesContainer.jsx';
import { API_ENDPOINT, fetcher, useIsMounted } from '../constants.js';

const Container = styled.div`
    ${tw`w-full h-full flex flex-col`}
`;

const Title = styled.h2`
    ${tw`text-xl px-2 pb-2 pt-4`}

    font-family: 'Saira', sans-serif;
`;

export default function Search() {
    const LIMIT = 5;

    const [offset, setOffset] = useState(0);
    const [searchText, setSearchText] = useState('');
    const [body, setBody] = useState({});
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(false);

    const offsetsFetchedRef = useRef([]);
    const currentlyRunOffset = useRef(0);
    const controller = useMemo(() => new AbortController(), []);

    const isMounted = useIsMounted();

    const fetchData = useCallback(
        (offset, body, searchText, hideLoader = false) => {
            if (offsetsFetchedRef.current.includes(offset)) return;

            offsetsFetchedRef.current = [
                ...offsetsFetchedRef.current.filter(
                    fetchedOffset => fetchedOffset < offset
                ),
                offset,
            ];
            currentlyRunOffset.current = offset;

            setLoading(!hideLoader);

            fetcher(
                `${API_ENDPOINT}/match/search/${searchText}/${LIMIT}/${offset}`,
                {
                    credentials: 'include',
                    method: 'POST',
                    body,
                    json: true,
                    signal: controller.signal,
                }
            )
                .then(res => res.json())
                .then(({ result: { datas: newProfiles, hasMore } }) => {
                    if (
                        !isMounted.current ||
                        currentlyRunOffset.current !== offset
                    ) {
                        if (isMounted.current) {
                            offsetsFetchedRef.current = offsetsFetchedRef.current.filter(
                                fetchedOffset => fetchedOffset !== offset
                            );
                        }

                        return;
                    }

                    if (
                        Array.isArray(newProfiles) &&
                        Boolean(hasMore) === hasMore
                    ) {
                        setProfiles(profiles => [...profiles, ...newProfiles]);
                        setHasMore(hasMore);

                        if (newProfiles.length > 0) {
                            setOffset(offset => offset + newProfiles.length);
                        }
                    }
                })
                .catch(() => {})
                .finally(() => {
                    if (!isMounted.current) return;

                    setLoading(false);
                });
        },
        [isMounted, controller.signal]
    );

    useEffect(() => {
        return () => {
            controller.abort();
        };
    }, [controller]);

    function fetchMore() {
        fetchData(offset, body, searchText, true);
    }

    function onFiltersUpdate({
        searchText,
        location,
        sortBy,
        sortOrder,
        ageRange,
        distanceRange,
        popularityRange,
        countCommonTags,
        commonTags,
    }) {
        const body = {
            ...location,
            tagsArray: commonTags,
            orderBy: sortBy,
            order: sortOrder,
            minAge: ageRange[0] | 0,
            maxAge: ageRange[1] | 0,
            minDistance: distanceRange[0] | 0,
            maxDistance: distanceRange[1] | 0,
            minScore: popularityRange[0] | 0,
            maxScore: popularityRange[1] | 0,
            minCommonTags: countCommonTags[0] | 0,
            maxCommonTags: countCommonTags[1] | 0,
        };

        setSearchText(searchText);
        setBody(body);
        setOffset(0);
        setProfiles([]);
        offsetsFetchedRef.current = [];

        fetchData(0, body, searchText, false);
    }

    function onLike(uuid) {
        const matchingUser = profiles.find(
            ({ uuid: profileUuid }) => profileUuid === uuid
        );
        if (matchingUser === undefined) return;

        let newLikeStatus = '';

        switch (matchingUser.likeStatus) {
            case 'VIRGIN':
                newLikeStatus = 'LIKED_IT';
                break;
            case 'HAS_LIKED_US':
                newLikeStatus = 'MATCH';
                break;
            case 'LIKED_IT':
                newLikeStatus = 'VIRGIN';
                break;
            case 'MATCH':
                newLikeStatus = 'HAS_LIKED_US';
                break;
            default:
                return;
        }

        const isLiking = ['VIRGIN', 'HAS_LIKED_US'].includes(
            matchingUser.likeStatus
        );

        setProfiles(profiles =>
            profiles.map(user => ({
                ...user,
                likeStatus:
                    user.uuid !== uuid ? user.likeStatus : newLikeStatus,
            }))
        );

        fetch(`${API_ENDPOINT}/user/${isLiking ? 'like' : 'unlike'}/${uuid}`, {
            method: 'POST',
            credentials: 'include',
        })
            .catch(() => {})
            .finally(() => {
                const { username } = matchingUser;

                toast(`You ${isLiking ? 'liked' : 'unliked'} ${username}`, {
                    type: 'success',
                });
            });
    }

    return (
        <Container>
            <Title>Search celebrities</Title>

            <ProfilesContainer
                search
                profiles={profiles}
                preview={true}
                onFiltersUpdate={onFiltersUpdate}
                loading={loading}
                fetchMore={fetchMore}
                hasMore={hasMore}
                onLike={onLike}
            />
        </Container>
    );
}
