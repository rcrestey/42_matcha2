import React, { useState, useEffect, useRef, useMemo, forwardRef } from 'react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import Media from 'react-media';
import places from 'places.js';

import useForm, { useFormField } from './Form.jsx';
import Combobox from './Combobox.jsx';
import { API_ENDPOINT, useIsMounted } from '../constants.js';
import { trunc } from '../components/Range.jsx';

const FiltersTitle = styled.h2`
    ${tw`text-xl`}

    font-family: 'Saira', sans-serif;
`;

const Subheader = styled.p`
    ${tw`mb-1`}

    font-family: 'Saira', sans-serif;
`;

const ButtonsContainer = styled.div`
    ${tw`flex items-center justify-end mt-2`}

    & > :not(:last-child) {
        ${tw`mr-2`}
    }
`;

const Button = styled.button`
    ${tw`px-3 py-1 bg-blue-700 text-white rounded shadow relative`}

    &::after {
        content: '';
        transition: opacity 200ms;

        ${tw`absolute inset-0 shadow-lg rounded opacity-0`}
    }

    &::hover::after {
        ${tw`opacity-75`}
    }

    &::focus::after {
        ${tw`outline-none opacity-100`}
    }
`;

const DialogContainerShowStyles = tw`block`;

const MobileDialogContainer = styled.div`
    --dialog-max-width: 100%;
    --dialog-height: calc(100% - 64px);

    ${tw`hidden absolute inset-x-0 bottom-0 bg-white opacity-100 overflow-x-hidden overflow-y-scroll px-2`}

    height: var(--dialog-height);
    width: var(--dialog-max-width);

    transition: transform 300ms;

    ${({ show }) => show === true && DialogContainerShowStyles}
`;

const DesktopDialogContainer = styled.div`
    --dialog-max-width: 800px;
    --dialog-min-height: 400px;

    ${tw`m-auto bg-white p-2 overflow-x-hidden overflow-y-scroll`}

    min-height: var(--dialog-max-height);
    width: var(--dialog-max-width);

    transition: transform 300ms;

    ${({ show }) => show === true && DialogContainerShowStyles}
`;

const OverlayContainerShowStyles = css`
    ${tw`opacity-100`}

    z-index: 60;
`;

const OverlayContainer = styled.div`
    ${tw`flex absolute inset-0 opacity-0`}

    background-color: rgba(45, 55, 72, 0.75);

    transition: opacity 300ms, z-index 1ms;
    z-index: -1;

    ${({ show }) => show === true && OverlayContainerShowStyles}
`;

function OverlayForwarded({ children, ...props }, ref) {
    return (
        <OverlayContainer {...props} ref={ref}>
            {children}
        </OverlayContainer>
    );
}

const Overlay = forwardRef(OverlayForwarded);

export function useInterval(defaultValueMin, defaultValueMax) {
    const [range, setRange] = useState([defaultValueMin, defaultValueMax]);

    return [range, setRange];
}

function Filters({ search, onHide, onConfirm }) {
    const LOCATION_TEXT_FIELD_ID = 'LOCATION_TEXT_FIELD_ID';

    const [
        searchText,
        setSearchText,
        searchTextIsValid,
        setSearchTextIsValid,
    ] = useFormField('');
    const [
        location,
        setLocation,
        locationIsValid,
        setLocationIsValid,
    ] = useFormField('');
    const [coordinates, setCoordinates] = useState(null);
    const [placesAutocomplete, setPlacesAutocomplete] = useState(null);
    const [sortBy, setSortBy] = useState('age');
    const [sortOrder, setSortOrder] = useState('ASC');
    const [ageRange, setAgeRange] = useInterval(0, 20);
    const [distanceRange, setDistanceRange] = useInterval(0, 10);
    const [popularityRange, setPopularityRange] = useInterval(0, 100);
    const [countCommonTags, setCountCommonTags] = useInterval(0, 0);
    const [commonTags, setCommonTags] = useState([]);
    const [intervalsLoaded, setIntervalLoaded] = useState(false);
    const [maximumValues, setMaximumValues] = useState({
        age: 100,
        distance: 1000,
        popularity: 1000000,
        commonTags: 10,
    });
    const [propositions, setPropositions] = useState([]);

    const addressTextFieldRef = useRef(null);

    const controller = useMemo(() => new AbortController(), []);

    const isMounted = useIsMounted();

    const fields =
        search === true
            ? [
                  {
                      label: 'Kev Adams, …',
                      value: searchText,
                      setValue: setSearchText,
                      isValid: searchTextIsValid,
                      setIsValid: setSearchTextIsValid,
                  },
                  {
                      label: 'Sort by :',
                      value: sortBy,
                      setValue: setSortBy,
                      isValid: true,
                      setIsValid: () => {},
                      segmented: true,
                      items: [
                          { value: 'age', text: 'Age' },
                          { value: 'distance', text: 'Distance' },
                          { value: 'score', text: 'Popularity' },
                          { value: 'commonTags', text: 'Common tags' },
                      ],
                  },
                  {
                      label: '',
                      value: sortOrder,
                      setValue: setSortOrder,
                      isValid: true,
                      setIsValid: () => {},
                      segmented: true,
                      items: [
                          { value: 'ASC', text: 'Ascendant' },
                          { value: 'DESC', text: 'Descendant' },
                      ],
                  },
                  {
                      label: 'Age',
                      range: ageRange,
                      setRange: setAgeRange,
                      max: maximumValues['age'],
                      formatValue: value => `${value} yo`,
                  },
                  {
                      label: 'Distance',
                      range: distanceRange,
                      setRange: setDistanceRange,
                      max: maximumValues['distance'],
                      formatValue: value => `${value} km`,
                  },
                  {
                      label: 'Popularity',
                      range: popularityRange,
                      setRange: setPopularityRange,
                      max: maximumValues['popularity'],
                  },
                  {
                      label: 'Common tags',
                      range: countCommonTags,
                      setRange: setCountCommonTags,
                      max: maximumValues['commonTags'],
                  },
                  {
                      id: LOCATION_TEXT_FIELD_ID,
                      label: 'Location',
                      value: location,
                      setValue: setLocation,
                      isValid: locationIsValid,
                      setIsValid: setLocationIsValid,
                  },
              ]
            : [
                  {
                      label: 'Sort by :',
                      value: sortBy,
                      setValue: setSortBy,
                      isValid: true,
                      setIsValid: () => {},
                      segmented: true,
                      items: [
                          { value: 'age', text: 'Age' },
                          { value: 'distance', text: 'Distance' },
                          { value: 'score', text: 'Popularity' },
                          { value: 'commonTags', text: 'Common tags' },
                      ],
                  },
                  {
                      label: '',
                      value: sortOrder,
                      setValue: setSortOrder,
                      isValid: true,
                      setIsValid: () => {},
                      segmented: true,
                      items: [
                          { value: 'ASC', text: 'Ascendant' },
                          { value: 'DESC', text: 'Descendant' },
                      ],
                  },
                  {
                      label: 'Age',
                      range: ageRange,
                      setRange: setAgeRange,
                      max: maximumValues['age'],
                      formatValue: value => `${value} yo`,
                  },
                  {
                      label: 'Distance',
                      range: distanceRange,
                      setRange: setDistanceRange,
                      max: maximumValues['distance'],
                      formatValue: value => `${value} km`,
                  },
                  {
                      label: 'Popularity',
                      range: popularityRange,
                      setRange: setPopularityRange,
                      max: maximumValues['popularity'],
                  },
                  {
                      label: 'Common tags',
                      range: countCommonTags,
                      setRange: setCountCommonTags,
                      max: maximumValues['commonTags'],
                  },
              ];

    useEffect(() => {
        fetch(`${API_ENDPOINT}/profile/tags`, {
            credentials: 'include',
        })
            .then(res => res.json())
            .then(propositions => {
                if (!isMounted.current) return;

                setPropositions(propositions);
            })
            .catch(() => {});
    }, [isMounted]);

    useEffect(() => {
        if (intervalsLoaded === true || !isMounted.current) return;

        setIntervalLoaded(true);

        fetch(`${API_ENDPOINT}/match/interval`, {
            credentials: 'include',
            signal: controller.signal,
        })
            .then(res => res.json())
            .then(({ maxAge, maxScore, maxDistance, maxCommonTags }) => {
                if (!isMounted.current) return;

                setMaximumValues({
                    age: maxAge,
                    distance: maxDistance,
                    popularity: maxScore,
                    commonTags: maxCommonTags,
                });

                setAgeRange(([min]) => [min, trunc(maxAge)]);
                setDistanceRange(([min]) => [min, trunc(maxDistance)]);
                setPopularityRange(([min]) => [min, trunc(maxScore)]);
                setCountCommonTags(([min]) => [min, trunc(maxCommonTags)]);
            })
            .catch(() => {
                if (!isMounted.current) return;

                setIntervalLoaded(false);
            });
    }, [
        intervalsLoaded,
        isMounted,
        setAgeRange,
        setCountCommonTags,
        setDistanceRange,
        setPopularityRange,
        controller,
    ]);

    useEffect(() => {
        const el = document.getElementById(LOCATION_TEXT_FIELD_ID);
        if (el === null || !isMounted.current) return;

        addressTextFieldRef.current = el;

        if (placesAutocomplete === null) {
            const placesAutocomplete = places({
                appId: process.env.REACT_APP_ALGOLIA_PLACES_APP_ID,
                apiKey: process.env.REACT_APP_ALGOLIA_PLACES_API_KEY,
                container: addressTextFieldRef.current,
                style: false,
            }).configure({
                language: 'en',
                type: 'address',
                useDeviceLocation: false,
            });

            placesAutocomplete.on(
                'change',
                ({
                    suggestion: {
                        latlng: { lat, lng },
                        value,
                    },
                }) => {
                    if (!isMounted.current) return;

                    setCoordinates({ lat, long: lng });
                    setLocation(value);
                }
            );

            setPlacesAutocomplete(placesAutocomplete);
        }
    }, [isMounted, placesAutocomplete, setLocation]);

    useEffect(() => {
        return () => {
            controller.abort();
        };
    }, [controller]);

    const seperation = search === true ? 3 : 2;

    const [, FormSort] = useForm({});
    const [, FormFilter] = useForm({});

    function confirmFilters() {
        onConfirm({
            search,
            searchText,
            location: coordinates,
            sortBy,
            sortOrder,
            ageRange,
            distanceRange,
            popularityRange,
            countCommonTags,
            commonTags: commonTags.map(({ text }) => text),
        });

        onHide();
    }

    return (
        <div>
            <FiltersTitle>
                {search === true
                    ? 'Find the celebrity you always dreamed'
                    : 'Precise the results'}
            </FiltersTitle>

            <FormSort fields={fields.slice(0, seperation)} hideButton />

            <Subheader>Criteria :</Subheader>

            <FormFilter fields={fields.slice(seperation)} hideButton />

            {search === true && (
                <Combobox
                    label="Common tags"
                    items={commonTags}
                    setItems={setCommonTags}
                    propositions={propositions}
                    onAddItem={null}
                />
            )}

            <ButtonsContainer>
                <Button onClick={onHide}>Cancel</Button>
                <Button onClick={confirmFilters}>Apply</Button>
            </ButtonsContainer>
        </div>
    );
}

export default function ResultsFilters({ search, show, onHide, onConfirm }) {
    const overlayRef = useRef(null);
    const modalsContainerRef = useMemo(
        () => document.getElementById('modals-container'),
        []
    );

    useEffect(() => {
        function onClick() {
            onHide();
        }

        window.addEventListener('click', onClick);

        return () => {
            window.removeEventListener('click', onClick);
        };
    }, [onHide]);

    const Child = (
        <Filters search={search} onHide={onHide} onConfirm={onConfirm} />
    );

    return ReactDOM.createPortal(
        <Overlay show={show} ref={overlayRef}>
            <Media query="(max-width: 640px)">
                {smallDevice =>
                    smallDevice ? (
                        <MobileDialogContainer
                            show={show}
                            onClick={e => e.stopPropagation()}
                        >
                            {Child}
                        </MobileDialogContainer>
                    ) : (
                        <DesktopDialogContainer
                            show={show}
                            onClick={e => e.stopPropagation()}
                        >
                            {Child}
                        </DesktopDialogContainer>
                    )
                }
            </Media>
        </Overlay>,
        modalsContainerRef
    );
}
