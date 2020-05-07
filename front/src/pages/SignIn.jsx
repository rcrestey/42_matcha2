import React, { useContext } from 'react';
import { toast } from 'react-toastify';
import { NavLink } from 'react-router-dom';

import { getNotifications } from '../App.jsx';
import { AppContext } from '../app-context.js';
import { useWS } from '../ws.js';
import { API_ENDPOINT, SIGN_IN_MESSAGES, useIsMounted } from '../constants';
import useForm, { useFormField } from '../components/Form.jsx';
import LayoutSignOn from '../layouts/SignOn.jsx';
import { RoutesEnum } from '../Routes.jsx';

export async function setupContextAfterLoggingIn({
    setContext,
    user,
    launchWS,
}) {
    const result = await getNotifications();
    if (result === undefined) return;

    const { notifications, newDataNotifications } = result;

    setContext(context => ({
        ...context,
        user,
        loggedIn: true,
        ws: launchWS(
            type => {
                setContext(context => ({
                    ...context,
                    [type === 'conversations'
                        ? 'newDataConversations'
                        : 'newDataNotifications']: true,
                }));
            },
            notification => {
                setContext(context => ({
                    ...context,
                    notifications: [notification, ...context.notifications],
                }));
            }
        ),
        newDataConversations: (user && !user.sawMessages) || false,
        notifications,
        newDataNotifications,
    }));
}

export default function SignUp() {
    const [, launchWS] = useWS();
    const [
        username,
        setUsername,
        isUsernameValid,
        setUsernameIsValid,
    ] = useFormField('');
    const [
        password,
        setPassword,
        isPasswordValid,
        setPasswordIsValid,
    ] = useFormField('');
    const { setContext } = useContext(AppContext);

    const isMounted = useIsMounted();

    const fields = [
        {
            label: 'Username',
            name: 'username',
            autocomplete: 'username',
            value: username,
            setValue: setUsername,
            isValid: isUsernameValid,
            setIsValid: setUsernameIsValid,
            min: 3,
            max: 20,
        },
        {
            label: 'Password',
            name: 'current-password',
            autocomplete: 'current-password',
            value: password,
            setValue: setPassword,
            isValid: isPasswordValid,
            setIsValid: setPasswordIsValid,
            type: 'password',
            min: 6,
        },
    ];

    const [isValidRef, FormComponent] = useForm({ fields, onSubmit });

    function onSubmit() {
        fetch(`${API_ENDPOINT}/auth/sign-in`, {
            method: 'POST',
            body: JSON.stringify({
                username,
                password,
            }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        })
            .then(res => res.json())
            .then(async ({ statusCode, user }) => {
                if (!isMounted.current) return;

                const isError = statusCode !== 'DONE';
                const message = SIGN_IN_MESSAGES.get(statusCode);

                toast(message, {
                    type: isError === true ? 'error' : 'success',
                });

                if (isError === false) {
                    await setupContextAfterLoggingIn({
                        setContext,
                        user,
                        launchWS,
                    });
                }
            })
            .catch(() => {});
    }

    return (
        <LayoutSignOn title="Sign in">
            <FormComponent
                onSubmit={onSubmit}
                fields={fields}
                isValid={isValidRef}
            />

            <NavLink to={RoutesEnum.RESET_PASSWORD_EMAIL} className="mt-4">
                I forgot my password
            </NavLink>
        </LayoutSignOn>
    );
}
