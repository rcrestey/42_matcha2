import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';

import ProfileCard from '../components/ProfileCard.jsx';

const Container = styled.article`
    ${tw`w-full`}

    transition: all 100ms;
`;

export default function Profile(props) {
    const { uuid, pictures, images, onLike, onDismiss } = props;

    return (
        <Container>
            <ProfileCard
                {...props}
                pictures={(pictures || images || []).slice(0, 1)}
                onLike={() => onLike(uuid)}
                onDismiss={() => onDismiss(uuid)}
            />
        </Container>
    );
}
