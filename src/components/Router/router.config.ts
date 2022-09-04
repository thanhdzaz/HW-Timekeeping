import { CheckSquareOutlined } from '@ant-design/icons';
import LoadableComponent from '../Loadable/index';

export const userRouter: any = [
    {
        path: '/user',
        name: 'user',
        title: 'User',
        component: LoadableComponent(() => import('../Layout/UserLayout')),
        isLayout: true,
        showInMenu: false,
    },
    {
        path: '/user/login',
        name: 'login',
        title: 'LogIn',
        component: LoadableComponent(() => import('scenes/Login')),
        showInMenu: false,
    },
];

export const appRouters: any = [
    {
        path: '/',
        exact: true,
        name: 'home',
        permission: '',
        title: 'Home',
        component: LoadableComponent(() => import('../Layout/AppLayout')),
        isLayout: true,
        showInMenu: false,
    },
    {
        showInMenu: false,
        name: 'u-info',
        path: '/user-info',
        title: 'Thông tin người dùng',
        component: LoadableComponent(() => import('scenes/UserInfo')),
    },
    {
        icon: CheckSquareOutlined,
        permission: '',
        showInMenu: true,
        path: '/attendance',
        name: 'attendance',
        title: 'Chấm công',
        component: LoadableComponent(() => import('scenes/Attendance')),
    },
    {
        path: '/my-timekeeping',
        name: 'my-timekeeping',
        permission: '',
        title: 'Bảng chấm công của tôi',
        showInMenu: true,
        component: LoadableComponent(() => import('scenes/MyTimekeeping')),
    },
    {
        path: '/total-timekeeping',
        name: 'total-timekeeping',
        permission: '',
        title: 'Bảng tổng hợp chấm công',
        showInMenu: true,
        component: LoadableComponent(() => import('scenes/TotalTimekeeping')),
    },
    {
        path: '/logout',
        permission: '',
        title: 'Logout',
        name: 'logout',
        showInMenu: false,
        component: LoadableComponent(() => import('../Logout')),
    },
];

let routersAndChild = appRouters;
appRouters.map((route: any) =>
{
    if (route.children?.length > 0)
    {
        routersAndChild = routersAndChild.concat(route.children);
    }
});

export const appRoutersAndChild = routersAndChild;

export const routers = [...userRouter, ...appRoutersAndChild];
