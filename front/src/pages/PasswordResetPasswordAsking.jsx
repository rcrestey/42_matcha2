import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { AppContext } from '../app-context.js';
import useForm, { useFormField } from '../components/Form.jsx';
import { useWS } from '../ws.js';
import LayoutSignOn from '../layouts/SignOn.jsx';
import { API_ENDPOINT, useIsMounted } from '../constants';
import { setupContextAfterLoggingIn } from './SignIn.jsx';

export default function PasswordResetPasswordAsking() {
    const { uuid, token } = useParams();
    const { setContext } = useContext(AppContext);
    const [, launchWS] = useWS();

    const [
        password,
        setPassword,
        isPasswordValid,
        setPasswordIsValid,
    ] = useFormField('');

    const fields = [
        {
            label: '',
            value: '',
            name: 'username',
            autocomplete: 'username',
            hidden: true,
            disableValidation: true,
        },
        {
            label: 'New Password',
            name: 'new-password',
            autocomplete: 'new-password',
            value: password,
            setValue: setPassword,
            isValid: isPasswordValid,
            setIsValid: setPasswordIsValid,
            min: 6,
            type: 'password',
        },
    ];

    const [isValid, FormComponent] = useForm({ fields, onSubmit });

    const isMounted = useIsMounted();

    function onSubmit() {
        fetch(`${API_ENDPOINT}/auth/reset-password/changing/`, {
            method: 'POST',
            body: JSON.stringify({
                uuid,
                token,
                password,
            }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        })
            .then(res => res.json())
            .then(async ({ statusCode, user }) => {
                if (!isMounted.current) return;

                if (statusCode === 'DONE') {
                    toast(
                        'Success ! You are getting redirected to your home !',
                        {
                            type: 'success',
                        }
                    );

                    await setupContextAfterLoggingIn({
                        setContext,
                        user,
                        launchWS,
                    });
                    return;
                }

                const message =
                    statusCode === 'LINK_INCORRECT'
                        ? 'The link you followed is invalid'
                        : 'An error occured, try again later';

                toast(message, {
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
        <LayoutSignOn title="But today... Is your lucky day">
            <FormComponent
                onSubmit={onSubmit}
                fields={fields}
                isValid={isValid}
            />
        </LayoutSignOn>
    );
}
