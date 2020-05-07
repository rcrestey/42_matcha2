import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import { toast } from 'react-toastify';

import UserProfileModifyEditionGroup from './UserProfileModifyEditionGroup.jsx';
import AddPictureButton from './UserProfileModifyPicturesAddPictureButton.jsx';
import Picture from './UserProfileModifyPicturesPicture.jsx';
import { API_ENDPOINT, useIsMounted } from '../constants.js';

const PicturesContainer = styled.div`
    ${tw`flex items-center justify-start overflow-x-scroll w-full`}

    min-height: 10rem;
`;

export default function UserProfileModifyPictures({
    user,
    user: { images },
    context,
    setContext,
    triggerToast,
}) {
    const [uploadStack, setUploadStack] = useState([]);
    const [readingStack, setReadingStack] = useState([]);
    const filteredPictures = useMemo(
        () =>
            images
                .filter(({ imageNumber }) => imageNumber !== 0)
                .sort(({ imageNumber: a }, { imageNumber: b }) => a - b),
        [images]
    );

    const isMounted = useIsMounted();

    useEffect(() => {
        if (!isMounted.current) return;

        for (const { temporaryUuid, uuid, imageNumber } of uploadStack) {
            setContext({
                ...context,
                user: {
                    ...user,
                    images: images.map(({ uuid: imageUuid, ...image }) => {
                        if (imageUuid === temporaryUuid) {
                            return {
                                ...image,
                                uuid,
                                imageNumber,
                            };
                        }
                        return {
                            ...image,
                            uuid: imageUuid,
                        };
                    }),
                },
            });

            setUploadStack(
                uploadStack.filter(({ uuid: taskUuid }) => taskUuid !== uuid)
            );
        }
    }, [
        uploadStack,
        setContext,
        context,
        images,
        user,
        setUploadStack,
        isMounted,
    ]);

    useEffect(() => {
        if (!isMounted.current) return;

        for (const { temporaryUuid, result, imageNumber } of readingStack) {
            setContext({
                ...context,
                user: {
                    ...user,
                    images: [
                        ...images,
                        {
                            src: result,
                            uuid: temporaryUuid,
                            imageNumber,
                        },
                    ],
                },
            });

            setReadingStack(
                readingStack.filter(
                    ({ temporaryUuid: taskUuid }) => taskUuid !== temporaryUuid
                )
            );
        }
    }, [
        context,
        setContext,
        user,
        images,
        readingStack,
        setReadingStack,
        isMounted,
    ]);

    function onFileChange({
        target: {
            files: [file],
        },
        target,
    }) {
        if (!isMounted.current) return;

        if (
            !['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].includes(
                file.type
            )
        ) {
            toast('Bad file type, try with another one !', {
                type: 'error',
            });
            return;
        }

        const temporaryUuid = images.length;

        const reader = new FileReader();

        reader.onload = ({ target: { result } }) => {
            if (!isMounted.current) return;

            setReadingStack([
                ...readingStack,
                { temporaryUuid, result, imageNumber: images.length },
            ]);
        };

        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('profile', file);

        // Reset the input value in order to permit
        // the same file to be chose consecutively several times.
        target.value = null;

        // send the file to the API
        fetch(`${API_ENDPOINT}/profile/pics`, {
            credentials: 'include',
            method: 'POST',
            header: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        })
            .then(res => res.json())
            .then(({ statusCode, image: { uuid, src, imageNumber } = {} }) => {
                triggerToast(
                    statusCode === 'DONE' ? 'The image has been added' : false
                );

                if (!isMounted.current || statusCode === 'DONE') {
                    // this was a successful uploading

                    const pictureObj = {
                        temporaryUuid,
                        uuid,
                        src,
                        imageNumber,
                    };

                    setUploadStack([...uploadStack, pictureObj]);

                    setContext(context => ({
                        ...context,
                        user: {
                            ...context.user,
                            images: [...context.user.images, pictureObj],
                        },
                    }));
                } else {
                    // an error occured
                }
            })
            .catch(() => triggerToast(false));
    }

    function onDelete(uuid) {
        return () => {
            if (!isMounted.current) return;

            setContext(context => ({
                ...context,
                user: {
                    ...user,
                    images: images.filter(
                        ({ uuid: imageUuid }) => imageUuid !== uuid
                    ),
                },
            }));

            fetch(`${API_ENDPOINT}/profile/pics`, {
                credentials: 'include',
                method: 'DELETE',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ pics: uuid }),
            })
                .then(res => res.json())
                .then(({ statusCode }) => {
                    triggerToast(
                        statusCode === 'DONE'
                            ? 'The image has been deleted'
                            : false
                    );
                })
                .catch(() => triggerToast(false));
        };
    }

    return (
        <UserProfileModifyEditionGroup title="Profile Pictures" noButton>
            <PicturesContainer>
                {filteredPictures.map(({ uuid, src }) => (
                    <Picture
                        src={src}
                        alt="One of my profile picture"
                        key={uuid}
                        onDelete={onDelete(uuid)}
                    />
                ))}

                {filteredPictures.length < 4 && (
                    <AddPictureButton onChange={onFileChange} />
                )}
            </PicturesContainer>
        </UserProfileModifyEditionGroup>
    );
}
