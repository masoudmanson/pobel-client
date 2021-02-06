import createStore from '@lesnock/simple-store';

const Store = new createStore();

if(localStorage.getItem('token')) {
    Store.add('token', localStorage.getItem('token'));
    Store.add('user', localStorage.getItem('user'));
    Store.add('userObject', localStorage.getItem('userObject'));
    Store.add('isLoggedIn', true);
} else {
    Store.add('token', null);
    Store.add('user', null);
    Store.add('userObject', null);
    Store.add('isLoggedIn', false);
}

export default Store;
