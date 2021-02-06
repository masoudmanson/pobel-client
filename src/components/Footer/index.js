import style from './index.css';

export default function () {
	let footer = document.createElement('footer');
	footer.className = style.footer;

	let tmp;
	(tmp = document.createElement('span')).innerText = 'Pobel';
	footer.appendChild(tmp);

	(tmp = document.createElement('i')).className = style.heart;
	footer.appendChild(tmp);

	let link = document.createElement('a');
	link.href = 'http://fanapsoft.ir';
	link.innerText = 'FanapSoft';

	(tmp = document.createElement('span')).innerText = ' by ';
	tmp.appendChild(link);
	footer.appendChild(tmp);

	return footer;
}
