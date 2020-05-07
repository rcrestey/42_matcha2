import React, { useMemo } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import FeatherIcon from 'feather-icons-react';

const Container = styled.div`
    ${tw`flex items-center my-1`}
`;

const CheckboxContainerCheckedStyles = tw`bg-blue-800`;

const CheckboxContainer = styled.div`
    ${tw`w-5 h-5 relative border-2 border-blue-800 rounded cursor-pointer`}

    transition: background-color 100ms;

    ${({ checked = false }) => checked && CheckboxContainerCheckedStyles}
`;

const InputCheckbox = styled.input`
    ${tw`absolute opacity-0 z-20 cursor-pointer`}

    width: calc(100% + 4px);
    height: calc(100% + 4px);

    top: -2px;
    left: -2px;
`;

const IconVisibleStyles = tw`opacity-100`;

const Icon = styled(FeatherIcon)`
    ${tw`m-auto opacity-0 absolute w-full h-full z-10 text-white`}

    transition: opacity 100ms;

    ${({ checked = false }) => checked && IconVisibleStyles}
`;

const Label = styled.label`
    ${tw`ml-2 cursor-pointer`}
`;

export default function Checkbox({
    value = false,
    setValue = () => {},
    label = 'Checkbox',
}) {
    const id = useMemo(() => `checkbox-${(Math.random() * 1000) | 0}`, []);

    return (
        <Container>
            <CheckboxContainer checked={value}>
                <InputCheckbox
                    id={id}
                    type="checkbox"
                    checked={value}
                    onChange={({ target: { checked } }) => setValue(checked)}
                />
                <Icon icon="check" checked={value} />
            </CheckboxContainer>
            <Label htmlFor={id}>{label}</Label>
        </Container>
    );
}
