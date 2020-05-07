import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Transition } from 'react-transition-group';
import tw from 'tailwind.macro';

const rotate = keyframes`
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
`;

const SpinnerContainerBackgroundGrayCss = tw`bg-gray-100`;
const SpinnerContainerCss = tw`opacity-0`;
const SpinnerContainerHideCss = tw`hidden`;

const SpinnerContainer = styled.div`
    --transition-duration: 300ms;
    --transition-delay: 1000ms;

    ${tw`fixed inset-0 flex justify-center items-center bg-white opacity-100 z-40`}

    transition: opacity var(--transition-duration) var(--transition-delay);

    ${({ backgroundGray }) =>
        backgroundGray && SpinnerContainerBackgroundGrayCss}
    ${({ fadeOut }) => fadeOut && SpinnerContainerCss}
    ${({ hide }) => hide && SpinnerContainerHideCss}
`;

const SpinnerBar = styled.div`
    &::after {
        ${tw`block`}

        content: '';
        width: 64px;
        height: 64px;
        margin: 1px;
        border-radius: 50%;
        border: 10px solid #2a4365;
        border-color: #2a4365 transparent #2a4365 transparent;
        animation: ${rotate} 1.2s linear infinite;
    }
`;

export default function Spinner({
    in: trigger,
    timeout,
    backgroundGray = false,
    ...props
}) {
    return (
        <Transition in={trigger} timeout={timeout} {...props}>
            {state => (
                <SpinnerContainer
                    fadeOut={['exiting', 'exited'].includes(state)}
                    hide={state === 'exited'}
                    backgroundGray={backgroundGray}
                >
                    <SpinnerBar />
                </SpinnerContainer>
            )}
        </Transition>
    );
}
