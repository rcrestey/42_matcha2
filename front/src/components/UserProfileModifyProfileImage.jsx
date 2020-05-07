import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import FeatherIcon from 'feather-icons-react';
import { API_ENDPOINT } from '../constants';

import UnknownUserPicture from '../assets/unknown_person.png';

const Preferences = styled.section`
    ${tw`mt-8`}
`;

const ProfileContainer = styled.div`
    ${tw`relative w-64 h-64 mx-auto`}
`;

const Img = styled.img`
    ${tw`rounded-full object-cover h-full w-full`}
`;

const Aside = styled.aside`
    ${tw`absolute bottom-0 inset-x-0 flex justify-end`}
`;

const ChangePicture = styled.label`
    ${tw`relative p-2 rounded-full bg-blue-800 text-white shadow cursor-pointer`}

    bottom: 20px;
    right: 20px;

    &::after {
        content: '';
        transition: opacity 200ms;

        ${tw`absolute inset-0 shadow-xl opacity-0 rounded-full`}
    }

    &:hover,
    &:focus {
        ${tw`outline-none`}
    }

    &:hover::after,
    &:focus::after {
        ${tw`opacity-100`}
    }
`;

function ProfileImage({ src, setContext, triggerToast }) {
    const [displayedImage, setDisplayedImage] = useState(src);
    const reader = useMemo(() => new FileReader(), []);

    useEffect(() => {
        setDisplayedImage(src);
    }, [src, setDisplayedImage]);

    useEffect(() => {
        reader.onload = ({ target: { result } }) => {
            setDisplayedImage(result);

            const uuid = String((Math.random() * 100000) | 0);

            const pictureObj = {
                uuid,
                src: result,
                imageNumber: 0,
            };

            setContext(context => ({
                ...context,
                user: {
                    ...context.user,
                    images: [
                        pictureObj,
                        ...context.user.images.filter(
                            ({ imageNumber }) => imageNumber !== 0
                        ),
                    ],
                },
            }));
        };
    }, [reader, setContext, setDisplayedImage, src]);

    function onFileChange({
        target: {
            files: [file],
        },
    }) {
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('profile', file);

        // send the file to the API
        fetch(`${API_ENDPOINT}/profile/profile-pics`, {
            credentials: 'include',
            method: 'PUT',
            header: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        })
            .then(res => res.json())
            .then(({ statusCode }) => {
                triggerToast(
                    statusCode === 'DONE'
                        ? 'Your profile picture has been changed'
                        : false
                );
            })
            .catch(() => triggerToast(false));
    }

    return (
        <ProfileContainer>
            <Img src={displayedImage} alt="profile picture" />

            <Aside>
                <ChangePicture>
                    <input
                        type="file"
                        accept="image/png, image/jpeg, image/gif"
                        hidden
                        onChange={onFileChange}
                    />
                    <FeatherIcon icon="edit-2" />
                </ChangePicture>
            </Aside>
        </ProfileContainer>
    );
}

export default function UserProfileModifyProfileImage({
    user: { images },
    setContext,
    triggerToast,
}) {
    const profilePicture = useMemo(
        () => images.find(elem => elem.imageNumber === 0),
        [images]
    );

    const defaultImg = UnknownUserPicture;

    return (
        <Preferences>
            <ProfileImage
                src={(profilePicture && profilePicture.src) || defaultImg}
                setContext={setContext}
                triggerToast={triggerToast}
            />
        </Preferences>
    );
}
