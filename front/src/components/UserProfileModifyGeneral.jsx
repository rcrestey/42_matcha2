import React, { useEffect } from 'react';

import useForm, { useFormField } from '../components/Form.jsx';
import UserProfileModifyEditionGroup from './UserProfileModifyEditionGroup.jsx';
import { API_ENDPOINT } from '../constants';

export default function UserProfileModifyGeneral({
    user,
    triggerToast,
    setContext,
}) {
    const formId = 'modify-general';

    const [email, setEmail, isEmailValid, setEmailIsValid] = useFormField('');
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

    useEffect(() => {
        setEmail(user.email);
        setGivenName(user.givenName);
        setFamilyName(user.familyName);
    }, [
        setEmail,
        user.email,
        setGivenName,
        user.givenName,
        setFamilyName,
        user.familyName,
    ]);

    const fields = [
        {
            label: 'Email',
            value: email,
            setValue: setEmail,
            isValid: isEmailValid,
            setIsValid: setEmailIsValid,
            email: true,
        },
        {
            label: 'Given name',
            value: givenName,
            setValue: setGivenName,
            isValid: isGivenNameValid,
            setIsValid: setGivenNameIsValid,
            min: 3,
            max: 20,
        },
        {
            label: 'Family name',
            value: familyName,
            setValue: setFamilyName,
            isValid: isFamilyNameValid,
            setIsValid: setFamilyNameIsValid,
            min: 3,
            max: 20,
        },
    ];

    const [isValid, Form] = useForm({
        fields,
    });

    function onSubmit() {
        fetch(`${API_ENDPOINT}/profile/general`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, givenName, familyName }),
        })
            .then(res => res.json())
            .then(({ statusCode }) => {
                triggerToast(
                    statusCode === 'DONE'
                        ? 'Your informations have been changed'
                        : false
                );

                if (statusCode === 'DONE') {
                    setContext(context => ({
                        ...context,
                        user: {
                            ...context.user,
                            email,
                            givenName,
                            familyName,
                        },
                    }));
                }
            })
            .catch(() => triggerToast(false));
    }

    return (
        <UserProfileModifyEditionGroup
            title="General Preferences"
            formId={formId}
        >
            <Form
                id={formId}
                fields={fields}
                isValid={isValid}
                onSubmit={onSubmit}
                hideButton
            />
        </UserProfileModifyEditionGroup>
    );
}
