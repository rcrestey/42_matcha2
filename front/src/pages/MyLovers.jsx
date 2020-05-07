import React from 'react';

import HistoryList from '../components/HistoryList.jsx';

export default function MyLovers() {
    return (
        <HistoryList
            title="My Lovers"
            type="likes"
            noData="Nobody has liked your profile yet"
            dataProperty="liker"
        />
    );
}
