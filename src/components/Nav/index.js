import style from './index.css';
import Store from '../../store';

export default function () {
	let nav = document.createElement('nav');
	nav.className = style.nav;

	let ul, li, link;

	// Left Menu
	ul = document.createElement('ul');
	ul.className = style.links;

	li = document.createElement('li');
	(link = document.createElement('a')).href = '/';
	link.innerText = 'صفحه اصلی';
	li.appendChild(link);
	ul.appendChild(li);

    // if(Store.get('isLoggedIn')) {
    //     li = document.createElement('li');
    //     (link = document.createElement('a')).href = '/contribute';
    //     link.innerText = 'مشارکت';
    //     li.appendChild(link);
    //     ul.appendChild(li);
    // }

    if(Store.get('isLoggedIn')) {
        li = document.createElement('li');
        (link = document.createElement('a')).href = '/datasets';
        link.innerText = 'مشارکت';
        li.appendChild(link);
        ul.appendChild(li);
    }

	li = document.createElement('li');
	(link = document.createElement('a')).href = '/faq';
	link.innerText = 'سوالات متداول';
	li.appendChild(link);
	ul.appendChild(li);

	li = document.createElement('li');
	(link = document.createElement('a')).href = '/contact';
	link.innerText = 'تماس با ما';
	li.appendChild(link);
	ul.appendChild(li);

	nav.appendChild(ul);

	// Right Menu
	ul = document.createElement('ul');

	if(Store.get('isLoggedIn')) {
		li = document.createElement('li');
		(link = document.createElement('a')).href = '/dashboard';
		if(localStorage.getItem("userObject")) {
			try	{
				let user = JSON.parse(localStorage.getItem("userObject"));
				link.innerHTML = `سلام <span id="user-name">${user.name}</span>`;
			} catch(err) {
				console.log('error', err);
				link.innerHTML = `سلام`;
			}
		} else {
			link.innerHTML = `سلام`;
		}

		li.appendChild(link);
		ul.appendChild(li);

		li = document.createElement('li');
		(link = document.createElement('a')).href = '/logout';
		link.innerText = 'خروج';
		li.appendChild(link);
		ul.appendChild(li);
	} else {
		li = document.createElement('li');
		(link = document.createElement('a')).href = '/login';
		link.innerText = 'ورود';
		li.appendChild(link);
		ul.appendChild(li);
	}

	nav.appendChild(ul);

	addEventListener('scroll', () => {
		let bool = window.pageYOffset > 0;
		nav.classList.toggle(style.stuck, bool);
	}, { passive:true });

	return nav;
}
