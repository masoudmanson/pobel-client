import Nav from '@components/Nav';
import style from './index.css';

export default function () {
	let header = document.createElement('header');
	header.className = style.hero;
	header.appendChild(Nav());

	let titles = document.createElement('div');
	titles.className = style.titles;
	header.appendChild(titles);

	let tmp;
	(tmp = document.createElement('h1')).innerText = 'Pobel';
	titles.appendChild(tmp);
	(tmp = document.createElement('h3')).innerText = 'POD\'s Crowdsourcing Labeling Service';
	titles.appendChild(tmp);

	let shapes = document.createElement('div');
	shapes.className = style.shapes;
	header.appendChild(shapes);

	return header;
}
