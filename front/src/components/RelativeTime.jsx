import React, { useState, useEffect, useMemo } from 'react';

export default function RelativeTime({ datetime, ...props }) {
    const [date, setDate] = useState(null);

    const formatter = useMemo(() => {
        if (!('Intl' in window))
            return datetime => new Date(datetime).toString();

        if ('RelativeTimeFormat' in Intl) {
            const intl = new Intl.RelativeTimeFormat('en');

            return datetime => {
                const now = new Date();
                const date = new Date(datetime);

                const diff = +now - +date;

                const SEC_TO_MS = 1e3;
                const MIN_TO_MS = SEC_TO_MS * 60;
                const HOUR_TO_MS = MIN_TO_MS * 60;
                const DAY_TO_MS = HOUR_TO_MS * 24;

                if (diff >= DAY_TO_MS) {
                    // more than 1 day
                    const days = diff / DAY_TO_MS;

                    return intl.format(-days | 0, 'day');
                }

                if (diff >= HOUR_TO_MS) {
                    const hours = diff / HOUR_TO_MS;

                    return intl.format(-hours | 0, 'hour');
                }

                if (diff >= MIN_TO_MS) {
                    const minutes = diff / MIN_TO_MS;

                    return intl.format(-minutes | 0, 'minute');
                }

                return intl.format((-diff / SEC_TO_MS) | 0, 'second');
            };
        }

        const intl = new Intl.DateTimeFormat('en');

        return datetime => intl.format(new Date(datetime));
    }, []);

    useEffect(() => {
        const SECOND = 1e3;

        function format() {
            setDate(formatter(datetime));
        }

        const timer = setInterval(format, SECOND * 20);

        format();

        return () => {
            clearInterval(timer);
        };
    }, [datetime, formatter]);

    return <span {...props}>{date}</span>;
}
