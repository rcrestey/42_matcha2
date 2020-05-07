import { useState, useCallback } from 'react';
import { w3cwebsocket as WebSocketClient } from 'websocket';
import { toast } from 'react-toastify';
import { WS_ENDPOINT } from './constants';

class PubSub {
    constructor() {
        this._map = new Map();
        this._subscribers = new Map();
        this._listeners = new Set();
    }

    subscribe(key, cb, init = true) {
        const subscribers = this._subscribers.get(key) || [];

        this._subscribers.set(key, [...subscribers, cb]);

        if (init === true) {
            cb(this._map.get(key));
        }
    }

    unsubscribe(key, cb) {
        const subscribers = this._subscribers.get(key);
        if (subscribers === undefined) return;

        this._subscribers.set(
            key,
            subscribers.filter(subscriber => subscriber !== cb)
        );
    }

    listen(cb, init = true) {
        this._listeners.add(cb);

        if (init === true) {
            cb([...this._map.values()]);
        }
    }

    unlisten(cb) {
        this._listeners.delete(cb);
    }

    reset() {
        this._map.clear();
        this._subscribers.clear();
    }

    _publish(key, value) {
        this._map.set(key, value);

        this._trigger(key, value);
    }

    _trigger(key, value) {
        const subscribers = this._subscribers.get(key) || [];

        for (const subscriber of subscribers) {
            subscriber(value);
        }

        this._listeners.forEach(listener => listener([...this._map.values()]));
    }

    _delete(key) {
        this._map.delete(key);

        this._trigger(key, undefined);
    }

    _get(key) {
        return this._map.get(key);
    }
}

export const WS_MESSAGES_TYPES = {
    INIT: 'INIT',
};

export const WS_OUT_MESSAGES_TYPES = {
    NEW_MESSAGE: 'NEW_MESSAGE',
};

export const WS_RESPONSES_TYPES = {
    CONVERSATIONS: 'CONVERSATIONS',
    NEW_CONVERSATION: 'NEW_CONVERSATION',
    DELETE_CONVERSATION: 'DELETE_CONVERSATION',
    NEW_MESSAGE: 'NEW_MESSAGE',
    NEW_NOTIFICATION: 'NEW_NOTIFICATION',
};

class WS {
    constructor(pubsub, onChange, pushNotification) {
        this.ws = new WebSocketClient(WS_ENDPOINT, 'echo-protocol');
        this.pubsub = pubsub;
        this.onChange = onChange;
        this.pushNotification = pushNotification;
    }

    setup() {
        this.ws.onerror = () => {};

        this.ws.onopen = () => {
            const init = () => {
                if (this.ws.readyState !== this.ws.OPEN) {
                    setTimeout(init, 10);
                    return;
                }

                this.send({
                    type: WS_MESSAGES_TYPES.INIT,
                });
            };

            init();
        };

        this.ws.onclose = () => {};

        this.ws.onmessage = e => {
            if (typeof e.data === 'string') {
                const message = JSON.parse(e.data);

                if (
                    Object.values(WS_RESPONSES_TYPES).includes(message.type) ===
                    false
                )
                    return;

                switch (message.type) {
                    case WS_RESPONSES_TYPES.CONVERSATIONS: {
                        const conversations = (
                            message.payload.conversations || []
                        ).map(({ uuid, users = [], messages }) => ({
                            uuid,
                            users,
                            title:
                                users.reduce((title, { username }) => {
                                    if (title === null) return username;

                                    return `${title} - ${username}`;
                                }, null) || uuid,
                            messages: Array.isArray(messages) ? messages : [],
                        }));

                        for (const conversation of conversations) {
                            this.pubsub._publish(
                                conversation.uuid,
                                conversation
                            );
                        }
                        break;
                    }
                    case WS_RESPONSES_TYPES.NEW_CONVERSATION: {
                        const { uuid, users, messages } = message.payload;

                        this.onChange('conversations');

                        this.pubsub._publish(uuid, {
                            uuid,
                            users,
                            title:
                                users.reduce((title, { username }) => {
                                    if (title === null) return username;

                                    return `${title} - ${username}`;
                                }, null) || uuid,
                            messages: Array.isArray(messages) ? messages : [],
                        });

                        break;
                    }
                    case WS_RESPONSES_TYPES.DELETE_CONVERSATION: {
                        const { uuid } = message.payload;

                        this.pubsub._delete(uuid);
                        break;
                    }
                    case WS_RESPONSES_TYPES.NEW_MESSAGE: {
                        const {
                            conversationId,
                            ...messageProps
                        } = message.payload;
                        const conversation = this.pubsub._get(conversationId);

                        this.pubsub._publish(conversationId, {
                            ...conversation,
                            messages: [...conversation.messages, messageProps],
                        });

                        this.onChange('conversations');
                        break;
                    }
                    case WS_RESPONSES_TYPES.NEW_NOTIFICATION: {
                        const notification = message.payload;

                        toast(notification.message);

                        this.onChange('notifications');
                        this.pushNotification(notification);
                        break;
                    }
                    default:
                        return;
                }
            }
        };
    }

    send(msg) {
        return this.ws.send(JSON.stringify(msg));
    }

    publishMessage(conversationId, message) {
        return this.send({
            type: WS_OUT_MESSAGES_TYPES.NEW_MESSAGE,
            payload: {
                conversationId,
                message,
            },
        });
    }
}

const WS_PUBSUB = new PubSub();

export function useWS() {
    const [ws, setWS] = useState(null);

    const setupWS = useCallback((onChange, pushNotification) => {
        const websocket = new WS(WS_PUBSUB, onChange, pushNotification);
        websocket.setup();

        setWS(websocket);

        return websocket;
    }, []);

    return [ws, setupWS, WS_PUBSUB];
}

const NOTIFICATIONS_PUBSUB = new PubSub();

export function useNotifications() {
    return [NOTIFICATIONS_PUBSUB];
}
