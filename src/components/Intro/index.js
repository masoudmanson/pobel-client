import style from './index.css';

export default function (props) {
	let header = document.createElement('header');
	header.className = style.intro;
	return header;
}
