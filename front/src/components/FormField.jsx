import React from 'react';

import Input from './Input.jsx';

export default function FormField({
    name,
    defaultValue,
    onChange,
    type = 'text',
    isOk,
}) {
    return (
        <Input
            id={name + '-sign-up'}
            isOk={isOk}
            name={name}
            errors={isOk ? [] : ['this is not good']}
            defaultValue={defaultValue}
            onChange={onChange}
            type={name === 'password' || name === 'email' ? name : type}
        />
    );
}
