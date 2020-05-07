import React, {
    useState,
    useRef,
    useMemo,
    useEffect,
    useCallback,
    useContext,
} from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import FeatherIcon from 'feather-icons-react';
import { toast } from 'react-toastify';

import MyProfile from '../components/MyProfile.jsx';
import ProfilesContainer from '../components/ProfilesContainer.jsx';
import { API_ENDPOINT, fetcher, useIsMounted } from '../constants.js';
import { AppContext } from '../app-context.js';

const ClosingContainer = styled.button`
    ${tw`absolute py-2 w-6 flex justify-center items-center bg-blue-700 text-white rounded-r opacity-25`}

    transition: opacity 200ms ease-out;

    &:hover {
        ${tw`opacity-100`}
    }

    &:hover,
    &:focus {
        ${tw`outline-none`}
    }

    > svg {
        transition: transform 200ms ease-out;

        &.reverse {
            transform: rotate3d(0, 1, 0, 180deg);
        }
    }

    top: 20px;
    right: -24px;
`;

const Container = styled.section`
    ${tw`w-full h-full`}

    display: grid;
    grid-template-columns: repeat(10, 1fr);

    & > :first-child {
        ${tw`hidden`}

        transition: transform 200ms ease-out;

        &.collapse {
            transform: translateX(-100%);
        }

        @media (min-width: 768px) {
            ${tw`block z-20`}

            grid-column: 1 / span 3;
            grid-row: 1;
        }
    }

    & > :nth-child(2) {
        grid-column: 1 / span 10;
        grid-row: 1;

        @media (min-width: 768px) {
            ${tw`z-10 ml-8`}

            grid-column: 4 / 11;
            grid-row: 1;

            &.expand {
                grid-column: 1 / span 10;
            }
        }
    }
`;

export default function Home() {
    const LIMIT = 5;

    const {
        context: { user },
    } = useContext(AppContext);
    const [collapse, setCollapse] = useState(false);
    const homeViewRef = useRef(null);
    const [body, setBody] = useState({});
    const [profiles, setProfiles] = useState([]);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);

    const offsetsFetchedRef = useRef([]);
    const currentlyRunOffset = useRef(0);
    const controller = useMemo(() => new AbortController(), []);

    const isMounted = useIsMounted();

    const fetchData = useCallback(
        (offset, body, hideLoader = false) => {
            if (offsetsFetchedRef.current.includes(offset)) return;

            offsetsFetchedRef.current = [
                ...offsetsFetchedRef.current.filter(
                    fetchedOffset => fetchedOffset < offset
                ),
                offset,
            ];
            currentlyRunOffset.current = offset;

            setLoading(!hideLoader);

            fetcher(`${API_ENDPOINT}/match/proposals/${LIMIT}/${offset}`, {
                credentials: 'include',
                method: 'POST',
                body,
                json: true,
                signal: controller.signal,
            })
                .then(res => res.json())
                .then(({ result: { data, hasMore } = {}, statusCode }) => {
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

                    if (typeof statusCode === 'string') {
                        if (statusCode === 'INCOMPLETE_PROFILE') {
                            toast('Complete your profile guy! 😛', {
                                type: 'info',
                            });

                            return;
                        }

                        toast('An error occured during suggestions fetching', {
                            type: 'error',
                        });

                        return;
                    }

                    setHasMore(hasMore);

                    if (data.length > 0) {
                        setProfiles(profiles => [...profiles, ...data]);
                        setOffset(offset => offset + data.length);
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
        const filledUser =
            Number.isInteger(user.score) &&
            user.gender &&
            user.biography &&
            Array.isArray(user.tags) &&
            user.tags.length > 0 &&
            Array.isArray(user.addresses) &&
            user.addresses.length > 0 &&
            Array.isArray(user.images) &&
            user.images.length > 0;

        if (filledUser) return;

        toast('Complete your profile guy! 😛', {
            type: 'info',
        });
    }, [user]);

    useEffect(() => {
        return () => {
            controller.abort();
        };
    }, [controller]);

    function fetchMore(state) {
        const showLoader = state === undefined;

        fetchData(offset, body, !showLoader);
    }

    function toggleCollapse() {
        const newValue = !collapse;
        const homeView = homeViewRef.current;

        setCollapse(newValue);

        if (homeView === null) return;

        if (newValue === true) {
            homeView.classList.add('expand');
        } else {
            homeView.classList.remove('expand');
        }
    }

    function resetFetch() {
        if (offset === 1) {
            offsetsFetchedRef.current = [];
            setOffset(0);
            fetchData(0, body);
        }
    }

    function onLike(uuid) {
        const matchingUser = profiles.find(
            ({ uuid: profileUuid }) => profileUuid === uuid
        );
        if (matchingUser === undefined) return;

        resetFetch();

        setProfiles(profiles =>
            profiles.filter(({ uuid: profileUuid }) => profileUuid !== uuid)
        );
        setOffset(offset => (offset === 0 ? offset : offset - 1));

        fetch(`${API_ENDPOINT}/user/like/${uuid}`, {
            method: 'POST',
            credentials: 'include',
        })
            .catch(() => {})
            .finally(() => {
                const { username } = matchingUser;

                toast(`You liked ${username}`, {
                    type: 'success',
                });
            });
    }

    function onDismiss(uuid) {
        const matchingUser = profiles.find(
            ({ uuid: profileUuid }) => profileUuid === uuid
        );
        if (matchingUser === undefined) return;

        resetFetch();

        setProfiles(profiles =>
            profiles.filter(({ uuid: profileUuid }) => profileUuid !== uuid)
        );
        setOffset(offset => (offset === 0 ? offset : offset - 1));

        fetch(`${API_ENDPOINT}/user/not-interested/${uuid}`, {
            method: 'POST',
            credentials: 'include',
        }).catch(() => {});
    }

    function onFiltersUpdate({
        sortBy,
        sortOrder,
        ageRange,
        distanceRange,
        popularityRange,
        countCommonTags,
    }) {
        const body = {
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

        setBody(body);
        setOffset(0);
        setProfiles([]);
        offsetsFetchedRef.current = [];

        fetchData(0, body, false);
    }

    return (
        <Container>
            <MyProfile className={collapse ? 'collapse' : ''}>
                <ClosingContainer
                    name="expand-collapse"
                    onClick={toggleCollapse}
                >
                    <FeatherIcon
                        icon="chevron-left"
                        className={collapse ? 'reverse' : ''}
                    />
                </ClosingContainer>
            </MyProfile>

            <ProfilesContainer
                waitForLoading
                ref={homeViewRef}
                profiles={profiles}
                onLike={onLike}
                onDismiss={onDismiss}
                onFiltersUpdate={onFiltersUpdate}
                preview={true}
                loading={loading}
                fetchMore={fetchMore}
                hasMore={hasMore}
            />
        </Container>
    );
}
