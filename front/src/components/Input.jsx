import React, { useState } from 'react';
import FeatherIcon from 'feather-icons-react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

const BaseInput = styled.input`
    transition: border-color 200ms;
    min-width: 16rem;

    ${tw`border-b-2 border-blue-200 text-gray-900 bg-transparent outline-none py-1 my-1 w-full`}

    ${({ isOk }) => isOk === false && tw`border-red-500`}

    &::placeholder {
        ${tw`text-gray-700`}
    }

    &:focus {
        ${({ isOk }) => isOk && tw`border-blue-400`}
    }
`;

const CloseIconContainer = styled.div`
    ${tw`absolute inset-y-0 right-0 flex flex-col justify-center items-end text-gray-500`}
`;

const ErrorsListItem = styled.div`
    transition: all 200ms;

    ${tw`text-red-700`}

    transform: translateY(
        ${({ state }) =>
            state === 'entering' || state === 'exiting' ? -5 : 0}px
    );
    opacity: ${({ state }) =>
        state === 'entering' || state === 'exiting' ? 0 : 1};
`;

function ErrorsList({ errors = [] }) {
    return (
        <TransitionGroup>
            {Array.isArray(errors) &&
                errors.map((error, i) => (
                    <CSSTransition
                        key={i}
                        timeout={{ appear: 200, enter: 0, exit: 200 }}
                    >
                        {state => (
                            <ErrorsListItem state={state}>
                                {error}
                            </ErrorsListItem>
                        )}
                    </CSSTransition>
                ))}
        </TransitionGroup>
    );
}

const PasswordIconContainer = styled.button`
    ${tw`absolute right-0`}

    top: 8px;

    &:focus {
        ${tw`outline-none`}
    }
`;

function PasswordIcon({ show, setShow }) {
    const icon = show === true ? 'eye-off' : 'eye';

    return (
        <PasswordIconContainer
            onClick={e => {
                e.preventDefault();
                setShow(!show);
            }}
        >
            <FeatherIcon icon={icon} />
        </PasswordIconContainer>
    );
}

function Input(
    {
        id,
        name,
        autocomplete,
        value,
        defaultValue,
        setValue,
        label,
        type = 'text',
        textarea = false,
        isOk,
        closable = false,
        errors,
        onChange,
        hidden = false,
        ...extra
    },
    ref
) {
    const tag = textarea === true ? 'textarea' : 'input';
    const [show, setShow] = useState(type === 'password' ? false : true);

    const inputType =
        type !== 'password' ? type : show === true ? 'text' : 'password';

    return (
        <div>
            <div className="relative">
                <BaseInput
                    as={tag}
                    ref={ref}
                    id={id}
                    name={name}
                    autoComplete={autocomplete}
                    placeholder={label}
                    type={inputType}
                    label={label}
                    {...{ defaultValue, ...(!defaultValue && { value }) }}
                    isOk={isOk}
                    hidden={hidden}
                    className={type === 'password' && 'pr-8'}
                    onChange={e => {
                        if (typeof onChange === 'function') {
                            onChange(e);
                        }

                        setValue(e.target.value);
                    }}
                    {...extra}
                />

                {type === 'password' && PasswordIcon({ show, setShow })}

                {closable === true && (
                    <CloseIconContainer>
                        <FeatherIcon
                            icon="x"
                            onClick={() => setValue('')}
                            className="cursor-pointer"
                        />
                    </CloseIconContainer>
                )}
            </div>

            <ErrorsList errors={errors} />
        </div>
    );
}

export default React.forwardRef(Input);
