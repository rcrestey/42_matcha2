import React, { useContext } from 'react';
import styled from 'styled-components';
import tw from 'tailwind.macro';

import Button from './Button.jsx';
import { AppContext } from '../app-context.js';
import { mapRoutes, RoutesEnum } from '../Routes.jsx';

const Nav = styled.nav`
    ${tw`block md:hidden flex justify-around px-2 py-3 bg-white shadow z-50`}
`;

export default function BottomBar() {
    const {
        context: { newDataConversations, newDataNotifications },
    } = useContext(AppContext);

    const icons = mapRoutes([
        RoutesEnum.HOME,
        RoutesEnum.ME,
        RoutesEnum.SEARCH,
        RoutesEnum.CHAT,
    ]);

    return (
        <Nav>
            {icons.map(({ to, icon }) => {
                let badged = false;

                if (to.includes('notifications')) {
                    badged = newDataNotifications;
                } else if (to.includes('chat')) {
                    badged = newDataConversations;
                }

                return (
                    <Button
                        flat
                        key={icon}
                        to={to}
                        icon={icon}
                        badged={badged}
                    />
                );
            })}
        </Nav>
    );
}
