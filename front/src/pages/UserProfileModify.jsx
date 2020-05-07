import React, { useContext } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { toast } from 'react-toastify';

import { AppContext } from '../app-context.js';

import UserProfileModifyProfileImage from '../components/UserProfileModifyProfileImage.jsx';
import UserProfileModifyGeneral from '../components/UserProfileModifyGeneral.jsx';
import UserProfileModifyOtherInformations from '../components/UserProfileModifyOtherInformations.jsx';
import UserProfileModifyBiography from '../components/UserProfileModifyBiography.jsx';
import UserProfileModifyAddress from '../components/UserProfileModifyAddress.jsx';
import UserProfileModifyPassword from '../components/UserProfileModifyPassword.jsx';
import UserProfileModifyTags from '../components/UserProfileModifyTags.jsx';
import UserProfileModifyPictures from '../components/UserProfileModifyPictures.jsx';

const Container = styled.section`
    ${tw`w-full mx-auto py-10 px-3`}

    @media (min-width: 768px) {
        ${tw`w-4/5`}
    }

    @media (min-width: 1024px) {
        ${tw`w-3/5`}
    }

    @media (min-width: 1280px) {
        ${tw`w-2/5`}
    }

    @media (min-width: 1904px) {
        ${tw`w-1/3`}
    }
`;

const Title = styled.h1`
    font-family: 'Saira', sans-serif;

    ${tw`text-3xl`}
`;

export default function UserProfileModifyPage() {
    const {
        context: { user },
        context,
        setContext,
    } = useContext(AppContext);

    const components = [
        UserProfileModifyProfileImage,
        UserProfileModifyGeneral,
        UserProfileModifyOtherInformations,
        UserProfileModifyBiography,
        UserProfileModifyAddress,
        UserProfileModifyPassword,
        UserProfileModifyTags,
        UserProfileModifyPictures,
    ];

    function triggerToast(state, error = false) {
        const message =
            state === false ? 'An error occured, try again latter' : state;

        toast(message, {
            type: state === false || error === true ? 'error' : 'success',
        });
    }

    return (
        <Container>
            <Title>Edit Profile</Title>

            {components.map((Component, i) => (
                <Component
                    key={i}
                    user={user}
                    context={context}
                    setContext={setContext}
                    triggerToast={triggerToast}
                />
            ))}
        </Container>
    );
}
