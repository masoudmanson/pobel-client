import Footer from '@components/Footer';
import Nav from '@components/Nav';
import Hero from '@components/Hero';
import style from './index.css';

export default function (props) {
    let app = document.createElement('div'),
        header;
    app.className = style.app;

    if (props && props.navOnly) {
        header = document.createElement('header');
        header.appendChild(Nav());
        app.appendChild(header);
    } else {
        let hero = app.appendChild(Hero());
    }

    if (props && props.backgroundColor) {
        header.style.backgroundColor = props.backgroundColor;
    }

    if (props && props.color) {
        header.style.color = props.color;
    }

    if (props && props.padding) {
        header.style.padding = props.padding;
    }

    let main = document.createElement('main');
    main.className = style.wrapper;

    app._main = main;
    app.appendChild(main);

    if(props && (!props.hasOwnProperty('footer') || props.footer)) {
        app.appendChild(Footer());
    }

    return app;
}
