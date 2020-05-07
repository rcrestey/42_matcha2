import React from 'react';
import { toast } from 'react-toastify';

import useForm, { useFormField } from '../components/Form.jsx';
import LayoutSignOn from '../layouts/SignOn.jsx';
import { API_ENDPOINT, useIsMounted } from '../constants';

export default function PasswordResetEmailAsking() {
    const [email, setEmail, isEmailValid, setEmailIsValid] = useFormField('');

    const fields = [
        {
            label: 'Email',
            autocomplete: 'email',
            name: 'email',
            value: email,
            setValue: setEmail,
            isValid: isEmailValid,
            setIsValid: setEmailIsValid,
            email: true,
        },
    ];

    const [isValid, FormComponent] = useForm({ fields, onSubmit });

    const isMounted = useIsMounted();

    function onSubmit() {
        fetch(`${API_ENDPOINT}/auth/reset-password/asking`, {
            method: 'POST',
            body: JSON.stringify({
                email,
            }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        })
            .then(res => res.json())
            .then(({ statusCode }) => {
                if (!isMounted.current) return;

                if (statusCode === 'DONE') {
                    toast(`A password reset email has been sent to ${email}`, {
                        type: 'success',
                    });
                    return;
                }
                toast('An error occured, try again later', {
                    type: 'error',
                });
            })
            .catch(() => {
                toast('An error occured, try again later', {
                    type: 'error',
                });
            });
    }

    return (
        <LayoutSignOn title="Password reset">
            <FormComponent
                onSubmit={onSubmit}
                fields={fields}
                isValid={isValid}
            />
        </LayoutSignOn>
    );
}
