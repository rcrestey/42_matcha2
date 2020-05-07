import React from 'react';
import InfiniteScroll from 'react-infinite-scroller';

export default function InfiniteScrollContainer({
    fetchMore = () => {},
    hasMore = false,
    useWindow = false,
    loader = (
        <div key={-1} className="mx-auto">
            loading ...
        </div>
    ),
    children,
    className,
}) {
    return (
        <InfiniteScroll
            pageStart={0}
            loadMore={fetchMore}
            hasMore={hasMore}
            loader={loader}
            useWindow={useWindow}
            className={className}
        >
            {children}
        </InfiniteScroll>
    );
}
