import React from 'react';

import styled from 'styled-components';
import tw from 'tailwind.macro';

const Container = styled.article`
    ${tw`flex flex-col items-start pr-4 cursor-default`}

    width: 300px;
`;

const Title = styled.h2`
    ${tw`text-black text-lg mb-2`}
`;

const Text = styled.p`
    ${tw`text-gray-900 text-sm`}
`;

const ButtonsContainer = styled.footer`
    ${tw`w-full flex justify-end items-center mt-3`}
`;

const ButtonErrorStyles = tw`bg-red-500`;

const Button = styled.button`
    ${tw`px-2 py-1 text-white bg-blue-900 rounded`}

    &:focus {
        ${tw`outline-none`}
    }

    &:not(:last-child) {
        ${tw`mr-1`}
    }

    ${({ error }) => error && ButtonErrorStyles}
`;

export default function RoamingModePopUp({
    title = 'PopUp !',
    text = 'description',
    closeToast,
    onConfirm = () => {},
}) {
    function onDisagreementClick() {
        onConfirm(false);
        closeToast();
    }

    function onAgreementClick() {
        onConfirm(true);
        closeToast();
    }

    return (
        <Container>
            <Title>{title}</Title>

            <Text>{text}</Text>

            <ButtonsContainer>
                <Button onClick={closeToast}>Close</Button>
                <Button error onClick={onDisagreementClick}>
                    Disagree
                </Button>
                <Button onClick={onAgreementClick}>Agree</Button>
            </ButtonsContainer>
        </Container>
    );
}
