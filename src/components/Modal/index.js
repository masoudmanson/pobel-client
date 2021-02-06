import style from './index.css';
import { v4 as UUID } from 'uuid';

export default function (props) {
    let uniqueId = UUID();
    let tempInterval;
    let fullscreen = (typeof props.fullscreen == 'boolean' && props.fullscreen) ? true : false;

    let modalBg = document.createElement('div');

    if(fullscreen) {
        modalBg.classList.add(style.modalBg, style.modalFullscreen);
    } else {
        modalBg.classList.add(style.modalBg);
    }

    modalBg.setAttribute('id', uniqueId);

    let modalWrapper = document.createElement('div');
    modalWrapper.className = style.modalWrapper;

    let modalClose = document.createElement('span');
    modalClose.className = style.modalClose;
    modalClose.onclick = () => {
        modalBg.dataset.interval && clearInterval(modalBg.dataset.interval);
        if(typeof props.closeBtnAction === 'function'){
            props.closeBtnAction();
        } else {
            modalBg.remove();
        }
    };
    modalWrapper.appendChild(modalClose);

    let modalTitle = document.createElement('h3');
    modalTitle.className = style.modalTitle;
    modalTitle.innerText = props.title || 'Title';
    modalWrapper.appendChild(modalTitle);

    let modalBody = document.createElement('p');
    modalBody.className = style.modalBody;
    modalBody.innerHTML = props.body || 'Modal description.';
    modalWrapper.appendChild(modalBody);

    let actionCounter = document.createElement('span');
    actionCounter.className = style.modalActionCounter;
    modalWrapper.appendChild(actionCounter);

    if(fullscreen) {
        modalWrapper.appendChild(actionCounter);
    }

    let modalBtns = document.createElement('div');
    modalBtns.className = style.modalBtnWrapper;
    props.actions && props.actions.forEach((action) => {
        let actionBtn = document.createElement('button');
        actionBtn.classList.add(style.modalBtn);
        if (Array.isArray(action.class)) {
            action.class.forEach(customClass => {
                actionBtn.classList.add(style[customClass])
            });
        }

        actionBtn.addEventListener('click', action.fn, {once: true});

        if(action.timeout > 0) {
            let tempTimeout = action.timeout;

            if(fullscreen) {
                actionBtn.innerText = action.title;
                actionCounter.innerText = Math.round(tempTimeout / 1000);
            }

            actionBtn.innerHTML = `${action.title} &nbsp; <small>${Math.round(tempTimeout / 1000)}</small>`;

            tempInterval = setInterval(() => {
                tempTimeout -= 1000;
                if(fullscreen) {
                    actionCounter.innerText = Math.round(tempTimeout / 1000);
                }

                actionBtn.innerHTML = `${action.title} &nbsp; <small>${Math.round(tempTimeout / 1000)}</small>`;

                if (tempTimeout - 1000 < 100) {
                    tempInterval && clearInterval(tempInterval);
                    action.fn && action.fn();
                }
            }, 1000);

            modalBg.dataset.interval = tempInterval;
        } else {
            actionBtn.innerText = action.title;
        }

        modalBtns.appendChild(actionBtn);
    });
    modalWrapper.appendChild(modalBtns);

    modalBg.appendChild(modalWrapper);
    document.getElementsByTagName('body')[0].appendChild(modalBg);

    return {
        uniqueId: uniqueId,
        interval: tempInterval,
        close: () => {
            tempInterval && clearInterval(tempInterval);
            modalBg.remove();
        }
    }
}
