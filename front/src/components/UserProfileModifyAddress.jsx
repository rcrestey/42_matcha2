import React, { useRef, useEffect, useState, useMemo } from 'react';
import places from 'places.js';

import useForm, { useFormField } from '../components/Form.jsx';
import UserProfileModifyEditionGroup from './UserProfileModifyEditionGroup.jsx';
import { API_ENDPOINT, fetcher, formatAddress } from '../constants.js';

export default function UserProfileModifyAddress({
    user: { addresses, roaming },
    context,
    setContext,
    triggerToast,
}) {
    const formId = 'modify-address';

    const [latlng, setLatlng] = useState({ lat: -1, long: -1 });
    const [roamingPref, setRoamingPref] = useState(
        roaming === 'ACCEPTED' ? true : false
    );
    const [
        address,
        setAddress,
        isAddressValid,
        setAddressIsValid,
    ] = useFormField({});

    const addressTextFieldRef = useRef(null);
    const [placesAutocomplete, setPlacesAutocomplete] = useState(null);

    const addressTextFieldId = 'address-text-field';

    const primaryAddress = useMemo(
        () => addresses.find(({ type }) => type === 'PRIMARY') || {},
        [addresses]
    );

    const { name, city, administrative, country } = primaryAddress;

    const fields = [
        {
            id: addressTextFieldId,
            label: 'Address',
            defaultValue: formatAddress({
                name,
                city,
                administrative,
                country,
            }),
            // value: address,
            setValue: setAddress,
            isValid: isAddressValid,
            setIsValid: setAddressIsValid,
        },
        {
            id: 'itinerance-mode-checkbox',
            checkbox: true,
            value: roamingPref,
            setValue: setRoamingPref,
            label: 'Go Right now in Rooooamiinng Mode !',
        },
    ];

    const [isValid, Form] = useForm({ fields });

    useEffect(() => {
        const { name, administrative, county, country, city } = primaryAddress;

        setAddress({
            name,
            administrative,
            county,
            country,
            city,
        });
    }, [primaryAddress, setAddress]);

    useEffect(() => {
        const { point: { x, y } = {} } = primaryAddress;

        if (!(x && y)) return;

        setLatlng({ lat: x, long: y });
    }, [primaryAddress]);

    useEffect(() => {
        addressTextFieldRef.current = document.getElementById(
            addressTextFieldId
        );

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
                        name,
                        administrative,
                        county,
                        country,
                        city,
                        latlng: { lat, lng },
                    },
                }) => {
                    setAddress({
                        name,
                        administrative,
                        county,
                        country,
                        city,
                    });
                    setLatlng({ lat, long: lng });
                }
            );

            setPlacesAutocomplete(placesAutocomplete);
        }
    }, [placesAutocomplete, setAddress]);

    function onSubmit() {
        if (address !== null && latlng.lat !== -1 && latlng.long !== -1) {
            fetcher(`${API_ENDPOINT}/profile/address`, {
                json: true,
                method: 'PUT',
                credentials: 'include',
                body: { isPrimary: true, auto: false, ...address, ...latlng },
            })
                .then(res => res.json())
                .then(({ statusCode }) => {
                    triggerToast(
                        statusCode === 'DONE'
                            ? 'Your address has been changed'
                            : false
                    );

                    if (statusCode === 'DONE') {
                        setContext(context => ({
                            ...context,
                            user: {
                                ...context.user,
                                addresses: [
                                    ...context.user.addresses.filter(
                                        ({ type }) => type !== 'PRIMARY'
                                    ),
                                    {
                                        ...address,
                                        point: {
                                            x: latlng.lat,
                                            y: latlng.long,
                                        },
                                        type: 'PRIMARY',
                                    },
                                ],
                            },
                        }));
                    }
                })
                .catch(() => triggerToast(false));
        } else {
            triggerToast('Take a valid address', true);
        }

        if (
            roaming === 'NOT_SET' ||
            (roaming === 'ACCEPTED' && !roamingPref) ||
            (roaming === 'REFUSED' && roamingPref)
        ) {
            fetcher(`${API_ENDPOINT}/profile/roaming`, {
                json: true,
                method: 'PUT',
                credentials: 'include',
                body: { value: roamingPref ? 'ACCEPTED' : 'REFUSED' },
            }).catch(() => {});

            if (roamingPref === true) {
                fetcher(`${API_ENDPOINT}/profile/location`, {
                    json: true,
                    method: 'PUT',
                    credentials: 'include',
                    body: { acceptGeolocation: true },
                }).catch(() => {});
            }

            setContext({
                ...context,
                user: {
                    ...context.user,
                    roaming: roamingPref ? 'ACCEPTED' : 'REFUSED',
                },
            });
        }
    }

    return (
        <UserProfileModifyEditionGroup title="Address" formId={formId}>
            <Form
                id={formId}
                fields={fields}
                isValid={isValid}
                hideButton
                onSubmit={onSubmit}
            />
        </UserProfileModifyEditionGroup>
    );
}
