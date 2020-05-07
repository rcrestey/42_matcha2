import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { API_ENDPOINT } from '../constants';
import useForm, { useFormField } from '../components/Form.jsx';
import LayoutSignOn from '../layouts/SignOn.jsx';

const SIGN_UP_RESPONSES_TOAST_MESSAGES = new Map([
    ['EMAIL_INCORRECT', 'The provided email is not correct'],
    ['USERNAME_INCORRECT', 'The provided username is not correct'],
    ['GIVEN_NAME_INCORRECT', 'The provided given name is not correct'],
    ['FAMILY_NAME_INCORRECT', 'The provided family name is not correct'],
    ['PASSWORD_INCORRECT', 'The provided password is not correct'],
    ['FORBIDDEN_INFORMATION', 'The provided username/email is incorrect'],
]);

export default function SignUp() {
    const [email, setEmail, isEmailValid, setEmailIsValid] = useFormField('');
    const [
        username,
        setUsername,
        isUsernameValid,
        setUsernameIsValid,
    ] = useFormField('');
    const [
        givenName,
        setGivenName,
        isGivenNameValid,
        setGivenNameIsValid,
    ] = useFormField('');
    const [
        familyName,
        setFamilyName,
        isFamilyNameValid,
        setFamilyNameIsValid,
    ] = useFormField('');
    const [
        password,
        setPassword,
        isPasswordValid,
        setPasswordIsValid,
    ] = useFormField('');
    const [acceptGeolocation, setAcceptGeolocation] = useState(false);
    const [coordsPromise, setCoordsPromise] = useState(Promise.resolve());

    const fields = [
        {
            name: 'email',
            autocomplete: 'email',
            label: 'Email',
            value: email,
            setValue: setEmail,
            isValid: isEmailValid,
            setIsValid: setEmailIsValid,
            type: 'email',
            email: true,
        },
        {
            name: 'nickname',
            autocomplete: 'nickname',
            label: 'Username',
            value: username,
            setValue: setUsername,
            isValid: isUsernameValid,
            setIsValid: setUsernameIsValid,
            min: 3,
            max: 20,
        },
        {
            name: 'given-name',
            autocomplete: 'given-name',
            label: 'First Name',
            value: givenName,
            setValue: setGivenName,
            isValid: isGivenNameValid,
            setIsValid: setGivenNameIsValid,
            min: 3,
            max: 20,
        },
        {
            name: 'family-name',
            autocomplete: 'family-name',
            label: 'Last Name',
            value: familyName,
            setValue: setFamilyName,
            isValid: isFamilyNameValid,
            setIsValid: setFamilyNameIsValid,
            min: 3,
            max: 20,
        },
        {
            name: 'new-password',
            autocomplete: 'new-password',
            label: 'Password',
            value: password,
            setValue: setPassword,
            isValid: isPasswordValid,
            setIsValid: setPasswordIsValid,
            type: 'password',
            min: 6,
        },
        {
            id: 'accept-geolocation-checkbox',
            checkbox: true,
            value: acceptGeolocation,
            setValue: setAcceptGeolocation,
            label: 'Do you agree with geolocation ?',
        },
    ];

    const [isValidRef, FormComponent] = useForm({ fields, onSubmit });

    useEffect(() => {
        if (acceptGeolocation === true && 'geolocation' in navigator) {
            // Get the current location of the user through JS API
            const p = new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    ({ coords: { latitude, longitude } }) => {
                        resolve({ latitude, longitude });
                    },
                    error => {
                        if (error.code !== error.PERMISSION_DENIED) {
                            reject(error);
                            return;
                        }

                        fetchPositionByIPAddress()
                            .then(coords => resolve(coords))
                            .catch(err => reject(err));
                    }
                );
            });

            setCoordsPromise(p);
        } else {
            setCoordsPromise(fetchPositionByIPAddress());
        }
    }, [acceptGeolocation]);

    function fetchPositionByIPAddress() {
        return fetch(
            `http://api.ipstack.com/check?access_key=${process.env.REACT_APP_IP_TO_ADDRESS_API_KEY}&format=1&fields=main`
        )
            .then(res => res.json())
            .then(({ latitude, longitude }) => ({ latitude, longitude }));
    }

    function onSubmit() {
        fetch(`${API_ENDPOINT}/auth/sign-up`, {
            method: 'POST',
            body: JSON.stringify({
                email,
                username,
                givenName,
                familyName,
                password,
                acceptGeolocation,
            }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        })
            .then(res => res.json())
            .then(async ({ statusCode, userUuid: uuid }) => {
                if (statusCode !== 'DONE') {
                    const message = SIGN_UP_RESPONSES_TOAST_MESSAGES.get(
                        statusCode
                    );
                    if (message === undefined) {
                        throw new Error('Incorrect response');
                    }

                    toast(message, {
                        type: 'error',
                    });
                    return;
                }

                toast('We sent you an email to confirm your account', {
                    type: 'success',
                });

                try {
                    // send the current location to the API if the response is successful
                    const { latitude, longitude } = await coordsPromise;

                    fetch(`${API_ENDPOINT}/profile/address/position`, {
                        method: 'POST',
                        body: JSON.stringify({
                            lat: latitude,
                            long: longitude,
                            isPrimary: true,
                            uuid,
                        }),
                        headers: { 'Content-Type': 'application/json' },
                    }).catch(() => {});
                } catch (e) {
                    throw new Error('Incorrect response');
                }
            })
            .catch(() => {
                toast('An error occured, try again later', {
                    type: 'error',
                });
            });
    }

    return (
        <LayoutSignOn title="Sign up">
            <FormComponent
                onSubmit={onSubmit}
                fields={fields}
                isValid={isValidRef}
            />
        </LayoutSignOn>
    );
}
