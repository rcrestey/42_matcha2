import React, { useState, useEffect } from 'react';

import { API_ENDPOINT, useIsMounted } from '../constants';

import UserProfileModifyEditionGroup from './UserProfileModifyEditionGroup.jsx';
import Combobox from './Combobox.jsx';

export default function UserProfileModifyTags({
    user,
    user: { tags = [] },
    context,
    setContext,
    triggerToast,
}) {
    const [propositions, setPropositions] = useState([]);
    const isMounted = useIsMounted();

    useEffect(() => {
        fetch(`${API_ENDPOINT}/profile/tags`, {
            credentials: 'include',
        })
            .then(res => res.json())
            .then(propositions => {
                if (!isMounted.current) return;

                setPropositions(propositions);
            })
            .catch(() => {});
    }, [isMounted]);

    function addTag(tag) {
        fetch(`${API_ENDPOINT}/profile/tags/add`, {
            method: 'PUT',
            credentials: 'include',
            body: JSON.stringify({
                tag,
            }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(res => res.json())
            .then(({ statusCode }) => {
                triggerToast(
                    statusCode === 'DONE' ? 'The tag has been added' : false
                );
            })
            .catch(() => {
                triggerToast(false);
            });
    }

    function removeTag(tag) {
        fetch(`${API_ENDPOINT}/profile/tags/delete`, {
            method: 'DELETE',
            credentials: 'include',
            body: JSON.stringify({
                tag,
            }),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(res => res.json())
            .then(({ statusCode }) => {
                triggerToast(
                    statusCode === 'DONE' ? 'The tag has been deleted' : false
                );
            })
            .catch(() => triggerToast(false));
    }

    function setTags(tags) {
        setContext({
            ...context,
            user: {
                ...user,
                tags,
            },
        });
    }

    return (
        <UserProfileModifyEditionGroup title="Centers of interest" noButton>
            <Combobox
                label="Your centers of interest"
                items={tags}
                setItems={setTags}
                propositions={propositions}
                onAddItem={addTag}
                onDeleteItem={removeTag}
            />
        </UserProfileModifyEditionGroup>
    );
}
