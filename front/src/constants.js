import { useRef, useEffect } from 'react';
import { differenceInYears } from 'date-fns';

export const CLOUD_ENDPOINT = `http://${process.env.REACT_APP_CLOUD_HOST}:${process.env.REACT_APP_CLOUD_PORT}`;
export const FRONT_ENDPOINT = `http://${process.env.REACT_APP_FRONT_HOST}:${process.env.REACT_APP_FRONT_PORT}`;
export const API_ENDPOINT = `http://${process.env.REACT_APP_BACK_HOST}:${process.env.REACT_APP_BACK_PORT}`;
export const WS_ENDPOINT = `${API_ENDPOINT.replace('http', 'ws')}/`;

export const SIGN_IN_MESSAGES = new Map([
    ['DONE', 'You have been successfully authenticated 🎉'],
    ['USERNAME_INCORRECT', 'The username is incorrect'],
    ['PASSWORD_INCORRECT', 'The provided password is not correct'],
    ['INVALID_ACCOUNT', 'Please confirm your account before trying to sign in'],
    ['UNKNOWN_ERROR', 'An error occured, please try again later'],
]);

function distance(lat1, lon1, lat2, lon2, unit = 'K') {
    if (lat1 === lat2 && lon1 === lon2) {
        return 0;
    } else {
        const radlat1 = (Math.PI * lat1) / 180;
        const radlat2 = (Math.PI * lat2) / 180;
        const theta = lon1 - lon2;
        const radtheta = (Math.PI * theta) / 180;
        let dist =
            Math.sin(radlat1) * Math.sin(radlat2) +
            Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        if (dist > 1) {
            dist = 1;
        }
        dist = Math.acos(dist);
        dist = (dist * 180) / Math.PI;
        dist = dist * 60 * 1.1515;
        if (unit === 'K') {
            dist = dist * 1.609344;
        }
        if (unit === 'N') {
            dist = dist * 0.8684;
        }
        return dist;
    }
}

/**
 * fetcher(URL, { json: true, body: {  } })
 */
export function fetcher(url, init) {
    if (init.json === true) {
        init.body = JSON.stringify(init.body);
        init.headers = {
            ...init.headers,
            'Content-Type': 'application/json',
        };
    }

    return fetch(url, init);
}

export function locateAndCompare({ lat: savedLatitude, lng: savedLongitude }) {
    /**
     * The minimal distance to be considered outside of its original location.
     * It is in kilometers and will trigger a `switch to roaming mode` asking.
     */
    const DELTA = 42 | 0;

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            ({
                coords: {
                    latitude: currentLatitude,
                    longitude: currentLongitude,
                },
            }) => {
                const distanceBetweenPoints = distance(
                    savedLatitude,
                    savedLongitude,
                    currentLatitude,
                    currentLongitude
                );

                resolve({
                    canAskForRoamingMode: distanceBetweenPoints > DELTA,
                    coords: {
                        latitude: currentLatitude,
                        longitude: currentLongitude,
                    },
                });
            },
            error => {
                reject(error);
            }
        );
    });
}

export function formatAddress({ name, county, country, city }) {
    let str = '';

    if (name) {
        str += `${name}, `;
    }

    if (city || county) {
        str += `${city || county} `;
    }

    if (country) {
        str += `${country} `;
    }

    return str.trim();
}

export function useIsMounted() {
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, []);

    return isMounted;
}

export function calculateAge(birthday) {
    return differenceInYears(new Date(), birthday);
}
