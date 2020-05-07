import React from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';

import Image404 from '../assets/404.png';

const Container = styled.article`
    ${tw`flex flex-col items-center mx-auto px-5 w-3/5 text-center mt-5 text-2xl`}
`;

const Title = styled.h2`
    ${tw`mb-6`}
`;

export default function NotFound() {
    return (
        <Container>
            <Title>{"The page you searched for doesn't exist !"}</Title>

            <img src={Image404} alt="404 error" />
        </Container>
    );
}
