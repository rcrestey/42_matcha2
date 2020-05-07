import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';

const SEXUAL_ORIENTATIONS_TEXTS = new Map([
    ['HOMOSEXUAL', { label: 'Ho', title: 'Homosexual' }],
    ['HETEROSEXUAL', { label: 'He', title: 'Heterosexual' }],
    ['BISEXUAL', { label: 'Bi', title: 'Bisexual' }],
]);

const Container = styled.p`
    ${tw`text-blue-600`}

    &::before {
        ${tw`mr-2`}

        content: '/'
    }
`;

export default function SexualOrientation({ sexualOrientation }) {
    const orientation = SEXUAL_ORIENTATIONS_TEXTS.get(
        sexualOrientation || 'BISEXUAL'
    );

    return <Container title={orientation.title}>{orientation.label}</Container>;
}
