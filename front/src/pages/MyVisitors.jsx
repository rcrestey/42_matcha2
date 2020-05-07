import React from 'react';

import HistoryList from '../components/HistoryList.jsx';

export default function MyVisitors() {
    return (
        <HistoryList
            title="My Visitors"
            type="visits"
            noData="Nobody has visited your profile yet"
            dataProperty="visitors"
        />
    );
}
