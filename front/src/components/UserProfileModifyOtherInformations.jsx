import React, { useEffect } from 'react';

import useForm, { useFormField } from '../components/Form.jsx';
import UserProfileModifyEditionGroup from './UserProfileModifyEditionGroup.jsx';
import { API_ENDPOINT } from '../constants';

const intl = new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
});

function padStart(targetString, targetLength, padString) {
    targetLength = targetLength >> 0;
    padString = String(typeof padString !== 'undefined' ? padString : ' ');
    if (targetString.length > targetLength) {
        return String(targetString);
    } else {
        targetLength = targetLength - targetString.length;
        if (targetLength > padString.length) {
            padString += padString.repeat(targetLength / padString.length);
        }
        return padString.slice(0, targetLength) + String(targetString);
    }
}

export default function UserProfileModifyOtherInformations({
    user,
    setContext,
    triggerToast,
}) {
    const formId = 'modify-other-informations';

    const [
        birthday,
        setBirthday,
        isBirthdayValid,
        setBirthdayIsValid,
    ] = useFormField('');
    const [gender, setGender, isGenderValid, setGenderIsValid] = useFormField(
        'MALE'
    );
    const [
        sexualOrientation,
        setSexualOrientation,
        isSexualOrientationValid,
        setSexualOrientationIsValid,
    ] = useFormField('BISEXUAL');

    useEffect(() => {
        if (user.gender) setGender(user.gender);
        if (user.sexualOrientation)
            setSexualOrientation(user.sexualOrientation);
        if (user.birthday) {
            try {
                const formattedDate = intl.format(new Date(user.birthday));
                const [months, days, years] = formattedDate.split('/');
                if (formattedDate.length !== 10) {
                    setBirthday(
                        `${padStart(months, 2, '0')}/${padStart(
                            days,
                            2,
                            '0'
                        )}/${padStart(years, 4, '0')}`
                    );
                    return;
                }

                setBirthday(formattedDate);
            } catch (e) {
                return;
            }
        }
    }, [
        setGender,
        user.gender,
        setSexualOrientation,
        user.sexualOrientation,
        setBirthday,
        user.birthday,
    ]);

    const fields = [
        {
            label: 'Birthday',
            value: birthday,
            setValue: setBirthday,
            isValid: isBirthdayValid,
            setIsValid: setBirthdayIsValid,
            mask: [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/],
            min: 10,
            max: 11,
            minYears: 18,
        },
        {
            label: 'Gender',
            value: gender,
            setValue: setGender,
            isValid: isGenderValid,
            setIsValid: setGenderIsValid,
            segmented: true,
            items: [
                { value: 'MALE', text: 'Male' },
                { value: 'FEMALE', text: 'Female' },
            ],
        },
        {
            label: 'Sexual Orientation',
            value: sexualOrientation,
            setValue: setSexualOrientation,
            isValid: isSexualOrientationValid,
            setIsValid: setSexualOrientationIsValid,
            segmented: true,
            items: [
                { value: 'HETEROSEXUAL', text: 'Heterosexual' },
                { value: 'HOMOSEXUAL', text: 'Homosexual' },
                { value: 'BISEXUAL', text: 'Bisexual' },
            ],
        },
    ];

    const [isValid, Form] = useForm({ fields });

    function onSubmit() {
        const date = new Date(birthday);

        fetch(`${API_ENDPOINT}/profile/extended`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                birthday: +new Date(
                    Date.UTC(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate()
                    )
                ),
                gender,
                sexualOrientation,
            }),
        })
            .then(res => res.json())
            .then(({ statusCode }) => {
                triggerToast(
                    statusCode === 'DONE'
                        ? 'Your extended profile has been changed'
                        : statusCode === 'UNDER_BIRTHDAY'
                        ? 'You are too young'
                        : false,
                    statusCode === 'UNDER_BIRTHDAY' ? true : false
                );

                if (statusCode === 'DONE') {
                    setContext(context => ({
                        ...context,
                        user: {
                            ...context.user,
                            birthday: date,
                            gender,
                            sexualOrientation,
                        },
                    }));
                }
            })
            .catch(() => triggerToast(false));
    }

    return (
        <UserProfileModifyEditionGroup
            title="Other Informations"
            formId={formId}
        >
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
