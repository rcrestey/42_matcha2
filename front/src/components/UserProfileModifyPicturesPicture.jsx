import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import FeatherIcon from 'feather-icons-react';

const PictureContainer = styled.div`
    ${tw`flex items-stretch relative h-40 overflow-hidden`}

    min-width: 250px;
    max-width: 250px;

    &:hover > img {
        transform: scale(1.1);
    }

    &:hover > img + div {
        ${tw`opacity-75`}
    }
`;

const Img = styled.img`
    ${tw`object-cover`}

    transition: transform 100ms;

    transform: scale(1);
`;

const OverlayContainer = styled.div`
    ${tw`absolute inset-0 flex items-center justify-center opacity-0 bg-gray-900 text-white`}

    transition: opacity 100ms;
`;

const Button = styled.button`
    &:focus {
        ${tw`outline-none`}
    }

    &:hover,
    &:focus {
        ${tw`text-red-700`}
    }
`;

function DeleteButton({ onClick = () => {} }) {
    return (
        <Button>
            <FeatherIcon icon="delete" onClick={onClick} />
        </Button>
    );
}

export default function Picture({ src, alt, onDelete }) {
    return (
        <PictureContainer>
            <Img src={src} alt={alt} />

            <OverlayContainer>
                <DeleteButton onClick={onDelete} />
            </OverlayContainer>
        </PictureContainer>
    );
}
