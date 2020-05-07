import React, { useMemo } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';
import FeatherIcon from 'feather-icons-react';
import { Link } from 'react-router-dom';

const Container = styled.div`
    ${tw`flex justify-center items-center w-full`}

    & > * {
        ${tw`mx-2`}
    }
`;

const liked = tw`bg-pink-500`;
const notLiked = tw`bg-white text-pink-500`;

const Button = styled.button`
    ${tw`flex justify-center items-center h-12 w-12 shadow-lg rounded-full bg-blue-800 text-white`}

    transition: color 150ms, background-color 150ms;

    &:hover,
    &:focus {
        ${tw`outline-none`}
    }

    &:disabled {
        ${tw`bg-gray-300 text-gray-700`}
    }

    ${({ ignore, liked: state }) => !ignore && (state ? liked : notLiked)}
`;

const ButtonNav = styled(Button)``;

export default function ProfileCardFloatingButton({
    edit = false,
    likeStatus = 'VIRGIN',
    disabled = false,
    onLike,
    onDismiss,
    hideDismiss = false,
}) {
    const title = useMemo(() => {
        if (disabled === true) return 'Add a profile picture to like';

        switch (likeStatus) {
            case 'HAS_LIKED_US':
                return 'Liked us';
            case 'LIKED_IT':
                return 'Already liked';
            case 'MATCH':
                return 'you matched !';
            default:
                return 'Like';
        }
    }, [disabled, likeStatus]);

    const to = edit ? '/me/edit' : null;
    const liked = likeStatus !== 'VIRGIN';
    const Icon = <FeatherIcon icon={edit === true ? 'edit-2' : 'heart'} />;

    const likeButton =
        edit === true ? (
            <ButtonNav as={Link} to={to}>
                {Icon}
            </ButtonNav>
        ) : (
            <Button
                name={liked ? 'unlike-profile' : 'like-profile'}
                disabled={disabled}
                liked={liked}
                onClick={onLike}
                title={title}
            >
                {Icon}
            </Button>
        );

    return (
        <Container className={edit === true ? 'mb-6' : ''}>
            {likeButton}

            {edit === false && !hideDismiss && (
                <Button
                    name="dismiss"
                    onClick={onDismiss}
                    title="Dismiss this profile"
                    ignore
                >
                    <FeatherIcon icon="thumbs-down" />
                </Button>
            )}
        </Container>
    );
}
