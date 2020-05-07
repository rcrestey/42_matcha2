import React, { useContext, useMemo } from 'react';

import { AppContext } from '../app-context.js';
import { calculateAge } from '../constants.js';
import ProfileCard from './ProfileCard.jsx';

export default function MyProfile(props) {
    const {
        context: {
            user: { images, birthday, ...informations },
        },
    } = useContext(AppContext);

    const age = useMemo(() => {
        if (birthday === null) return null;

        return calculateAge(new Date(birthday));
    }, [birthday]);

    return (
        <ProfileCard pictures={images} {...informations} {...props} age={age} />
    );
}
