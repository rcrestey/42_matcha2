import { lazy } from 'react';

const PAGES = [
    'Home',
    'SignIn',
    'SignUp',
    'PasswordResetEmailAsking',
    'PasswordResetPasswordAsking',
    'UserProfile',
    'UserProfileModify',
    'Profile',
    'NotFound',
    'MyLovers',
    'MyVisitors',
    'Search',
    'Notifications',
    'ChatList',
    'ChatConversation',
    'ChatMasterView',
];

export default PAGES.reduce((exports, name) => {
    exports[name] = lazy(() => import(`../pages/${name}.jsx`));

    return exports;
}, {});
