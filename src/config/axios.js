import axios from 'axios';
import CONFIG from './index';
import Store from "../store";
import NProgress from 'nprogress';
import Toastify from "toastify-js";

const myAxios = axios.create({
    baseURL: CONFIG.baseUrl,
    headers: {
        authorization: `Bearer ${Store.get('token')}`
    },
    validateStatus: (status) => {
        return true;
    },
});

myAxios.interceptors.request.use(request => {
    NProgress.configure({
        showSpinner: false
    });
    NProgress.start();
    return request;
});

myAxios.interceptors.response.use(response => {
    NProgress.done();

    // console.log(':: Response: ', response);

    if(response.status >= 400) {
        if (response.status === 401) {
            console.log('User has been logged out! Redirecting back to login page ...');
            localStorage.removeItem('token');
            Store.update('isLoggedIn', false);
            Store.update('token', null);
            window.location.href = '/login';
        }

        // TODO: Check non admin accounts to see what happens
        if(response.data.unAuthorizedRequest) {
            console.log('User has been logged out! Redirecting back to login page ...');
            localStorage.removeItem('token');
            Store.update('isLoggedIn', false);
            Store.update('token', null);
            window.location.href = '/login';
        }

        // if(response.data.error) {
        //     Toastify({
        //         text: response.data.error.message,
        //         duartion: 50000,
        //         gravity: 'top',
        //         position: 'left',
        //         backgroundColor: 'linear-gradient(to right, #EB3349 0%, #F45C43  100%)',
        //         onClick: () => {
        //         }
        //     }).showToast();
        // }

        throw response;
    } else {
        return response;
    }
}, (error) => {
    // console.log(':: Error: ', error);

    if (error.response.status === 401) {
        console.log('User has been logged out! Redirecting back to login page ...');
        localStorage.removeItem('token');
        Store.update('isLoggedIn', false);
        Store.update('token', null);
        window.location.href = '/login';
    }

    return error;
});

export default myAxios;