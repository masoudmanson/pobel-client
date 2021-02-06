import style from './index.css';
import "toastify-js/src/toastify.css";

import yesSVG from '@assets/shapes/yes.html';
import yesAnswer from '@assets/shapes/yesAnswer.html';
import noSVG from '@assets/shapes/no.html';
import noAnswer from '@assets/shapes/noAnswer.html';
import skipSVG from '@assets/shapes/skip.html';
import reportSVG from '@assets/shapes/report.html';

import Store from '../../store';
import Axios from 'axios';
import Config from "../../config";
import myAxios from "../../config/axios";
import Toastify from 'toastify-js';

var currentQuestion;

function showModal(params) {
    let modalBg = document.createElement('div');
    modalBg.className = 'modal-bg';

    let modalWrapper = document.createElement('div');
    modalWrapper.className = 'modal-wrapper';

    let modalClose = document.createElement('span');
    modalClose.className = 'modal-close';
    modalClose.onclick = () => {
        document.getElementsByTagName('body')[0].removeChild(modalBg);
    };
    modalWrapper.appendChild(modalClose);

    let modalTitle = document.createElement('h3');
    modalTitle.className = 'modal-title';
    modalTitle.innerText = params.title || 'Title';
    modalWrapper.appendChild(modalTitle);

    let modalBody = document.createElement('p');
    modalBody.className = 'modal-body';
    modalBody.innerHTML = params.body || 'Modal description.';
    modalWrapper.appendChild(modalBody);

    let modalBtns = document.createElement('div');
    modalBtns.className = 'modal-btn-wrapper';
    params.actions && params.actions.forEach((action, idx) => {
        let actionBtn = document.createElement('button');
        actionBtn.classList.add('modal-btn');
        if (Array.isArray(action.class)) {
            actionBtn.classList.add(...action.class);
        }
        actionBtn.onclick = action.fn;
        if (action.timeout > 0) {
            let tempTimeout = action.timeout;
            actionBtn.innerText = `${action.title} (${Math.round(tempTimeout / 1000)})`;
            let tempInterval = setInterval(() => {
                actionBtn.innerText = `${action.title} (${Math.round(tempTimeout / 1000)})`;
                if (tempTimeout - 1000 <= 0) {
                    tempInterval && clearInterval(tempInterval);
                    action.fn && action.fn();
                }
                tempTimeout -= 1000;
            }, 1000);
        } else {
            actionBtn.innerText = action.title;
        }

        modalBtns.appendChild(actionBtn);
    });
    modalWrapper.appendChild(modalBtns);

    modalBg.appendChild(modalWrapper);
    document.getElementsByTagName('body')[0].appendChild(modalBg);
    modalBg.style.display = 'flex';
}

function closeModal() {
    let modal = document.getElementsByClassName('modal-bg')[0];
    document.getElementsByTagName('body')[0].removeChild(modal);
}

function submitAnswer(answer) {
    myAxios.post(Config.setGolden, {
            id: currentQuestion.id,
            isGoldenData: answer
        }
    ).then(result => {
        if(result.status === 200 && result.data.success === true) {
            window.location.href = '/goldens/' + result.data.result.datasetID
        }
    }).catch(err => {
        console.log('error: ', err);
        showModal({
            title: 'خطایی رخ داد!',
            body: 'مشکلی در ارسال پاسخ ها به وجود آمد. آیا می خواهید مجدد تلاش کنید؟',
            actions: [
                {
                    title: 'تلاش مجدد',
                    class: ['active'],
                    fn: () => {
                        closeModal();
                        submitAnswer(answer);
                    },
                    timeout: 5000
                },
                {
                    title: 'خیر',
                    class: ['no-border'],
                    fn: () => {
                        window.location.href = '/temp';
                    }
                }
            ],
            closeBtnAction: () => {
                window.location.href = '/temp'
            }
        });
    });
}

export default function (props) {
    currentQuestion = props.result.items[0];
    let container = document.createElement('div');
    container.className = "container";

    let header = document.createElement('div');
    header.classList.add('row', 'header');

    let backBtnWrapper = document.createElement('div');
    backBtnWrapper.classList.add('col-6-sm', 'back-btn-wrapper');

    let backBtn = document.createElement('button');
    backBtn.classList.add("back-btn");
    backBtn.innerText = '🡠';
    backBtn.onclick = () => {
        window.location.href = '/temp';
    }

    backBtnWrapper.appendChild(backBtn);

    let datasetName = document.createElement('div');
    datasetName.classList.add('col-6-sm', 'dataset-name');

    let tmp, parentTmp;
    tmp = document.createElement('small');
    parentTmp = document.createElement('h4');
    tmp.innerText = props.datasetDesc;
    parentTmp.innerText = props.datasetName;
    parentTmp.appendChild(tmp);

    datasetName.appendChild(parentTmp);

    header.appendChild(datasetName);
    header.appendChild(backBtnWrapper);

    container.appendChild(header);

    // main section
    let mainDiv = document.createElement('div');
    mainDiv.classList.add("row", "main");

    let mainArticle = document.createElement('div');
    mainArticle.className = 'col-12';

    let questionWrapper = document.createElement('div');
    questionWrapper.className = style["question-wrapper"];

    let questionLabel='';

    if (typeof currentQuestion.label !== 'undefined' && !!currentQuestion.label && currentQuestion.label.hasOwnProperty('name')) {
        questionLabel = currentQuestion.label.name.replace(/[0-9]/g, '').replace(/_/g, ' ');
    } else if (currentQuestion.hasOwnProperty('filePath') && currentQuestion.filePath.length) {
        questionLabel = currentQuestion.filePath.replace(/\\/g, '\\').split('\\').slice(-2)[0].replace(/[0-9]/g, '').replace(/_/g, ' ');
    }

    let googleQ = document.createElement('strong');
    googleQ.style.cursor = 'pointer';

    let fieldNameSpan = document.createElement('span');
    fieldNameSpan.innerText = ' (...)';
    let tmpLabel = document.createTextNode(questionLabel);
    googleQ.appendChild(tmpLabel);
    googleQ.appendChild(fieldNameSpan);

    let fieldName = currentQuestion.filePath;
    fieldName = fieldName.split('\\')[4];
    let tempFieldName = '';
    switch (fieldName) {
        case 'Actors':
            tempFieldName = 'بازیگر';
            fieldNameSpan.innerText = ' (بازیگر)';
            break;

        case 'Singers':
            tempFieldName = 'خواننده';
            fieldNameSpan.innerText = ' (خواننده)';
            break;

        case 'Politicians':
            tempFieldName = 'سیاستمدار';
            fieldNameSpan.innerText = ' (سیاست مدار)';
            break;
    }

    googleQ.onclick = () => {
        window.open(`https://www.google.com/search?tbm=isch&q="${questionLabel}" ${tempFieldName}`);
    };

    tmp = document.createElement('p');
    tmp.className = "question-text";

    let tmp1 = document.createTextNode(`آیا تصویر طلایی زیر متعلق به `);
    let tmp2 = document.createTextNode(` است؟`);

    tmp.appendChild(tmp1);
    tmp.appendChild(googleQ);
    tmp.appendChild(tmp2);

    questionWrapper.appendChild(tmp);

    let questionImage = document.createElement('img');
    questionImage.className = "question-image";
    myAxios.get(Config.baseUrl + Config.getFile + `/${currentQuestion.id}`, {
        responseType: 'blob'
    }).then(result => {
        let blob = new Blob([result.data], {type: 'image/jpg'});
        let avatar = URL.createObjectURL(blob);
        questionImage.src = avatar;
    }).catch(err => {
        console.log('error: ', err);
    });
    questionWrapper.appendChild(questionImage);

    mainArticle.appendChild(questionWrapper);

    let answerWrapper = document.createElement('div');
    answerWrapper.className = "answer-wrapper";

    let yesNoType = document.createElement('div');
    yesNoType.className = "yes-no-type";

    let yesBtn = document.createElement('button');
    yesBtn.innerHTML = `بلی ${yesAnswer}`;
    yesBtn.setAttribute('id', 'yesBtn');
    yesBtn.onclick = () => submitAnswer(true);
    yesNoType.appendChild(yesBtn);

    let noBtn = document.createElement('button');
    noBtn.innerHTML = `خیر ${noAnswer}`;
    noBtn.setAttribute('id', 'noBtn');
    noBtn.onclick = () => submitAnswer(false);
    yesNoType.appendChild(noBtn);

    answerWrapper.appendChild(yesNoType);
    mainArticle.appendChild(answerWrapper);

    mainDiv.appendChild(mainArticle);

    container.appendChild(mainDiv);

    return container;
}
