import React, { useState, useMemo } from 'react';
import styled, { css } from 'styled-components';
import tw from 'tailwind.macro';
import FeatherIcon from 'feather-icons-react';

import UnknownUserImage from '../assets/unknown_person.png';

const Container = styled.div`
    ${tw`relative max-w-full h-64 overflow-x-hidden`}
`;

const ImagesContainer = styled.div`
    ${tw`h-full`}

    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: 100%;

    transition: transform 500ms ease-out;
    will-change: transform;

    > img {
        ${tw`h-full w-full object-cover`}
    }
`;

const Image = styled.img`
    ${tw`bg-red-500 `}
`;

const NavButtonContainer = styled.nav`
    ${tw`absolute inset-y-0 flex justify-center items-center`}

    ${props =>
        props.position === 'left'
            ? css`
                  left: 0;
                  padding-left: 5px;
              `
            : css`
                  right: 0;
                  padding-right: 5px;
              `}
`;

const NavButton = styled.button`
    ${tw`bg-gray-800 rounded-full w-5 h-5 text-white flex justify-center items-center`}

    transition: opacity 100ms ease-out;

    &:focus {
        ${tw`outline-none`}
    }

    ${({ disabled }) =>
        disabled &&
        css`
            opacity: 0;
            cursor: auto;
        `}
`;

const Footer = styled.footer`
    ${tw`absolute bottom-0 inset-x-0 py-2 flex justify-center items-center`}
`;

const Dot = styled.button`
    ${tw`bg-gray-500 shadow w-3 h-3 rounded-full relative mx-1`}

    transition: background-color 200ms ease-out;

    &:hover,
    &:focus {
        ${tw`outline-none`}
    }

    ${({ active }) => active && tw`bg-gray-800`}

    &::after {
        content: '';
        ${tw`absolute w-full h-full inset-0 rounded-full shadow-2xl opacity-0`}

        transition: all 200ms;
    }

    &:hover::after,
    &:focus::after {
        ${tw`opacity-100`}
    }
`;

function decrementDisplayedImage({ displayedImage, setDisplayedImage }) {
    if (displayedImage <= 0) return;

    setDisplayedImage(displayedImage - 1);
}

function incrementDisplayedImage({
    imagesCount,
    displayedImage,
    setDisplayedImage,
}) {
    if (displayedImage + 1 >= imagesCount) return;

    setDisplayedImage(displayedImage + 1);
}

export default function ImageCarousel({ images }) {
    const [displayedImage, setDisplayedImage] = useState(0);

    const imagesStack = useMemo(() => {
        const stack =
            !Array.isArray(images) || images.length === 0
                ? [
                      {
                          src: UnknownUserImage,
                      },
                  ]
                : [...images];

        return stack.sort(({ imageNumber: a }, { imageNumber: b }) => a - b);
    }, [images]);
    const imagesCount = useMemo(() => imagesStack.length, [imagesStack.length]);

    return (
        <Container>
            <ImagesContainer
                style={{ transform: `translateX(-${displayedImage * 100}%)` }}
            >
                {imagesStack.map(({ src }, i) => (
                    <Image key={i} src={src} />
                ))}
            </ImagesContainer>

            <NavButtonContainer position="left">
                <NavButton
                    onClick={() =>
                        decrementDisplayedImage({
                            imagesCount,
                            displayedImage,
                            setDisplayedImage,
                        })
                    }
                    disabled={displayedImage === 0 && imagesCount > 0}
                >
                    <FeatherIcon icon="chevron-left" size={18} />
                </NavButton>
            </NavButtonContainer>

            <NavButtonContainer position="right">
                <NavButton
                    onClick={() =>
                        incrementDisplayedImage({
                            imagesCount,
                            displayedImage,
                            setDisplayedImage,
                        })
                    }
                    disabled={
                        displayedImage === imagesCount - 1 && imagesCount > 0
                    }
                >
                    <FeatherIcon icon="chevron-right" size={18} />
                </NavButton>
            </NavButtonContainer>

            {Array.isArray(images) && (
                <Footer>
                    {imagesStack.length > 1 &&
                        imagesStack.map((_, i) => (
                            <Dot
                                key={i}
                                onClick={() => setDisplayedImage(i)}
                                active={displayedImage === i}
                            />
                        ))}
                </Footer>
            )}
        </Container>
    );
}
