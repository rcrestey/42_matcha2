import React, { useState, useCallback, forwardRef } from 'react';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import FeatherIcon from 'feather-icons-react';

import Profile from './Profile.jsx';
import FloatingButton from './FloatingButton.jsx';
import ResultsFilters from './ResultsFilters.jsx';
import Spinner from './Spinner.jsx';
import InfiniteScrollContainer from './InfiniteScrollContainer.jsx';

const Container = styled.section`
    ${tw`p-5 overflow-y-auto relative h-full`}

    ${({ exited }) =>
        !exited &&
        css`
            transform: translate(0);
        `}

    > .scroll-container {
        ${tw`relative`}

        display: grid;

        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));

        @media (min-width: 768px) {
            grid-template-columns: repeat(auto-fill, minmax(325px, 1fr));
        }

        @media (min-width: 1280px) {
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        }

        grid-column-gap: 10px;
        grid-row-gap: 10px;
    }
`;

const NoDataContainer = styled.div`
    ${tw`absolute inset-0 flex justify-center items-center`}
`;

function NoData() {
    return (
        <NoDataContainer>No one celebrity matches the criteria</NoDataContainer>
    );
}

function ShowFiltersButton({ onClick }) {
    return (
        <FloatingButton onClick={onClick} marginBottomMobile>
            <FeatherIcon icon="sliders" />
        </FloatingButton>
    );
}

const PressToLoadButton = styled.button`
    ${tw`mx-auto my-3 px-2 py-1 bg-blue-700 text-white`}
`;

function ProfilesContainer(
    {
        waitForLoading = false,
        search = false,
        profiles = [],
        preview = false,
        loading = false,
        onLike = () => {},
        onDismiss = () => {},
        onFiltersUpdate = () => {},
        fetchMore = () => {},
        hasMore = false,
    },
    ref
) {
    const [showFiltersDialog, setShowFiltersDialog] = useState(false);
    const [exited, setExited] = useState(false);
    const [loaded, setLoaded] = useState(false);

    function triggerModal(e) {
        e.stopPropagation();

        setShowFiltersDialog(true);
    }

    const onHide = useCallback(() => setShowFiltersDialog(false), []);

    function onLoadProfiles() {
        fetchMore();

        setLoaded(true);
    }

    return (
        <Container ref={ref} exited={exited}>
            <Spinner
                in={loading}
                timeout={1000}
                backgroundGray
                onEnter={() => setExited(false)}
                onExited={() => setExited(true)}
            />

            {loaded || !waitForLoading ? (
                !loading &&
                (profiles.length > 0 ? (
                    <InfiniteScrollContainer
                        fetchMore={fetchMore}
                        hasMore={hasMore}
                        className="scroll-container mb-5"
                    >
                        {profiles.map(profile => {
                            const { uuid } = profile;

                            return (
                                <Profile
                                    {...profile}
                                    key={uuid}
                                    preview={preview}
                                    onLike={onLike}
                                    onDismiss={onDismiss}
                                />
                            );
                        })}
                    </InfiniteScrollContainer>
                ) : (
                    <NoData />
                ))
            ) : (
                <PressToLoadButton onClick={onLoadProfiles}>
                    Load profiles
                </PressToLoadButton>
            )}

            <ShowFiltersButton onClick={triggerModal} />

            <ResultsFilters
                search={search}
                show={showFiltersDialog}
                onHide={onHide}
                onConfirm={onFiltersUpdate}
            />
        </Container>
    );
}

export default forwardRef(ProfilesContainer);
