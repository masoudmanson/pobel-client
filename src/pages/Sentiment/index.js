import style from './index.css';
import "toastify-js/src/toastify.css";

import yesSVG from '@assets/shapes/yes.html';
import yesAnswer from '@assets/shapes/yesAnswer.html';
import noSVG from '@assets/shapes/no.html';
import noAnswer from '@assets/shapes/noAnswer.html';
import reportSVG from '@assets/shapes/report.html';

import Store from '../../store';
import Axios from 'axios';
import Config from "../../config";
import myAxios from "../../config/axios";
import Toastify from 'toastify-js';

var questions = [],
    currentQuestion,
    globalQuestionTimer = null,
    totalSeconds = 0,
    submitBtn,
    targetLabel,
    answersLabel;

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

function skipQuestion(qId) {
    saveAnswer(null);
}

function nextQuestion(qId) {
    if (typeof questions[qId] == 'object') {
        if (questions[qId].reported) {
            nextQuestion(++qId);
        } else {
            currentQuestion = questions[qId];
            viewQuestion(currentQuestion);
        }
    } else {
        nextQuestion(0);
    }
}

function changeSubmitBtn(status) {
    if(status) {
        submitBtn.innerHTML = 'ارسال پاسخ ها';
        submitBtn.classList.add('with-answers');
        submitBtn.onclick = submitAnswers;
    } else {
        submitBtn.innerHTML = 'برو به لیست بعدی';
        submitBtn.classList.remove('with-answers');
        submitBtn.onclick = () => {
            location.reload();
        };
    }
}

function saveAnswer(answer) {
    let qId = document.getElementById('yesBtn').getAttribute('data-id');
    if (!questions[qId].reported) {
        if (answer === true) {
            document.getElementById(`q-${qId}`).classList.remove('no', 'skip');

            if (questions[qId].answer === true) {
                let tempValueAttr = Number(answersLabel.getAttribute('data-value'));
                answersLabel.innerText = (tempValueAttr - 1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                answersLabel.setAttribute('data-value', tempValueAttr - 1);
                document.getElementById(`q-${qId}`).classList.remove('completed', 'yes');
                questions[qId].answer = null;
            } else {
                let tempValueAttr = Number(answersLabel.getAttribute('data-value'));
                answersLabel.innerText = (tempValueAttr + 1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                answersLabel.setAttribute('data-value', tempValueAttr + 1);
                document.getElementById(`q-${qId}`).classList.add('completed', 'yes');
                questions[qId].answer = true;
            }
        } else if (answer === false) {
            document.getElementById(`q-${qId}`).classList.remove('yes', 'skip');

            if (questions[qId].answer === false) {
                let tempValueAttr = Number(answersLabel.getAttribute('data-value'));
                answersLabel.innerText = (tempValueAttr - 1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                answersLabel.setAttribute('data-value', tempValueAttr - 1);

                document.getElementById(`q-${qId}`).classList.remove('completed', 'no');
                questions[qId].answer = null;
            } else {
                let tempValueAttr = Number(answersLabel.getAttribute('data-value'));
                answersLabel.innerText = (tempValueAttr + 1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                answersLabel.setAttribute('data-value', tempValueAttr + 1);

                document.getElementById(`q-${qId}`).classList.add('completed', 'no');
                questions[qId].answer = false;
            }
        } else if (answer === null) {
            document.getElementById(`q-${qId}`).classList.remove('yes', 'no');
            document.getElementById(`q-${qId}`).classList.add('completed', 'skip');
            questions[qId].answer = null;
        }
    }

    changeSubmitBtn(questions.some(q => typeof(q.answer) === 'boolean'));
    nextQuestion(++qId);
}

function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(Math.random() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len in taken ? taken[len] : len;
    }
    return result;
}

function submitAnswers() {
    globalQuestionTimer && clearInterval(globalQuestionTimer);
    showModal({
        title: 'آیا ادامه می دهید؟',
        body: 'پاسخ ها با موفقیت ارسال شدند. تمایل دارید فرآیند برچسب زنی را ادامه دهید؟',
        actions: [
            {
                title: 'بله، ادامه می دهم',
                fn: () => {
                    window.location.href = '/sentiment'
                },
                timeout: 5000
            },
            {
                title: 'خیر',
                fn: () => {
                    window.location.href = '/'
                }
            }
        ],
        closeBtnAction: () => {
            window.location.href = '/'
        }
    });
    return;
    let answers = [];
    questions.forEach((q, id) => {
        if (q.answer != null) {
            if (q.answer) {
                answers.push({
                    dataSetId: q.options[0].dataSetId,
                    dataSetItemId: q.datasetItemId,
                    answerIndex: q.options[0].index,
                    durationToAnswerInSeconds: Math.round(totalSeconds/questions.length)
                });
            } else {
                answers.push({
                    dataSetId: q.options[1].dataSetId,
                    dataSetItemId: q.datasetItemId,
                    answerIndex: q.options[1].index,
                    durationToAnswerInSeconds: Math.round(totalSeconds/questions.length)
                });
            }
        }
    });

    if (answers.length) {
        myAxios.post(Config.baseUrl + Config.submitAnswers, {
                answers: answers
            }, {
                headers: {
                    authorization: `Bearer ${Store.get('token')}`
                }
            }
        ).then(result => {
            showModal({
                title: 'آیا ادامه می دهید؟',
                body: 'پاسخ ها با موفقیت ارسال شدند. تمایل دارید فرآیند برچسب زنی را ادامه دهید؟',
                actions: [
                    {
                        title: 'بله، ادامه می دهم',
                        fn: () => {
                            window.location.href = '/labeling/linear/' + questions[0].options[1].dataSetId
                        },
                        timeout: 5000
                    },
                    {
                        title: 'خیر',
                        fn: () => {
                            window.location.href = '/dataset/' + questions[0].options[1].dataSetId
                        }
                    }
                ],
                closeBtnAction: () => {
                    window.location.href = '/dataset/' + questions[0].options[1].dataSetId
                }
            });
        }).catch(err => {
            console.log('error: ', err);
            showModal({
                title: 'خطایی رخ داد!',
                body: 'مشکلی در ارسال پاسخ ها به وجود آمد. آیا می خواهید مجدد تلاش کنید؟',
                actions: [
                    {
                        title: 'تلاش مجدد',
                        fn: () => {
                            closeModal();
                            submitAnswers();
                        },
                        timeout: 5000
                    },
                    {
                        title: 'خیر',
                        fn: () => {
                            window.location.href = '/labeling/grid/' + questions[0].options[1].dataSetId
                        }
                    }
                ],
                closeBtnAction: () => {
                    window.location.href = '/dataset/' + questions[0].options[1].dataSetId
                }
            });
        });
    } else {
        Toastify({
            text: 'لیست پاسخ ها نمیتواند خالی باشد! هیچ پاسخی ثبت نشده است ...',
            duartion: 5000,
            gravity: 'top',
            position: 'left',
            backgroundColor: 'linear-gradient(to right, #EB3349 0%, #F45C43  100%)',
            onClick: () => {
                console.log('Answers can not be empty!');
            }
        }).showToast();
    }
}

function sendReport(qId, callback) {
    closeModal();
    callback && callback();
}

function viewQuestion(question) {
    if (!question.reported) {
        let questionWrapper = document.getElementsByClassName('question-text')[0];
        questionWrapper.innerHTML = '';
        let questionLabel = 'حس‌اتان نسبت به این جمله چیست؟';
        let googleQ = document.createElement('strong');
        googleQ.style.cursor = 'pointer';
        let fieldNameSpan = document.createElement('span');
        fieldNameSpan.innerText = ` (${question.source} - ${question.field})`;
        fieldNameSpan.style.fontSize = '12px';
        fieldNameSpan.style.color = '#bbb';
        let tmpLabel = document.createTextNode(questionLabel);
        googleQ.appendChild(tmpLabel);
        googleQ.appendChild(fieldNameSpan);

        // myAxios.get(Config.getDatasetItem, {
        //     params: {
        //         id: currentQuestion.datasetItemId
        //     }
        // }).then(datasetItem => {
        //     let fieldName = datasetItem.data.result.filePath;
        //     fieldName = fieldName.split('\\')[4];
        //     let tempFieldName = '';
        //     switch (fieldName) {
        //         case 'Actors':
        //             tempFieldName = 'بازیگر';
        //             fieldNameSpan.innerText = ' (بازیگر)';
        //             break;
        //
        //         case 'Singers':
        //             tempFieldName = 'خواننده';
        //             fieldNameSpan.innerText = ' (خواننده)';
        //             break;
        //
        //         case 'Politicians':
        //             tempFieldName = 'سیاستمدار';
        //             fieldNameSpan.innerText = ' (سیاست مدار)';
        //             break;
        //     }
        //
        //     googleQ.onclick = () => {
        //         window.open(`https://www.google.com/search?tbm=isch&q="${questionLabel}" ${tempFieldName}`);
        //     };
        // }).catch(err => {
        //     console.log('error', err);
        // });

        let tmp1 = document.createTextNode(`آیا تصویر زیر متعلق به `);
        let tmp2 = document.createTextNode(` است؟`);

        // questionWrapper.appendChild(tmp1);
        questionWrapper.appendChild(googleQ);
        // questionWrapper.appendChild(tmp2);

        // document.getElementsByClassName("question-image")[0].src = question.image;
        document.getElementsByClassName("question-sentence")[0].innerText = question.text;
        document.querySelectorAll(".question-list-items").forEach((elem, ind) => {
            elem.classList.remove("active");
        });
        document.getElementById(`q-${question.id}`).classList.add('active');
        document.getElementById('yesBtn').setAttribute('data-id', `${question.id}`);
        document.getElementById('noBtn').setAttribute('data-id', `${question.id}`);
        currentQuestion = question;
    }
}

export default function (props) {
    questions = getRandom(props.items, 5);
    questions.forEach((q, i) => {
        q['id'] = i;
        q['answer'] = null;
    });

    currentQuestion = questions[0];

    let container = document.createElement('div');
    container.className = "container";

    let header = document.createElement('div');
    header.classList.add('row', 'header');

    let backBtnWrapper = document.createElement('div');
    backBtnWrapper.classList.add('col-6-sm', 'back-btn-wrapper');

    let statsWrapper = document.createElement('div');
    statsWrapper.classList.add('stats-wrapper');

    let hoursLabel = document.createElement('label');
    hoursLabel.setAttribute('id', "hours");
    hoursLabel.innerText = '00';
    let minutesLabel = document.createElement('label');
    minutesLabel.setAttribute('id', "minutes");
    minutesLabel.innerText = '00';
    let secondsLabel = document.createElement('label');
    secondsLabel.setAttribute('id', "seconds");
    secondsLabel.innerText = '00';

    let timer = document.createElement('p');
    timer.className = 'timer';
    timer.appendChild(hoursLabel);
    let colon = document.createElement('span');
    colon.innerText = ':';
    timer.appendChild(colon);
    timer.appendChild(minutesLabel);
    colon = document.createElement('span');
    colon.innerText = ':';
    timer.appendChild(colon);
    timer.appendChild(secondsLabel);
    statsWrapper.appendChild(timer);

    globalQuestionTimer = setInterval(setTime, 1000);

    function setTime() {
        ++totalSeconds;
        secondsLabel.innerHTML = pad(totalSeconds % 60);
        minutesLabel.innerHTML = pad((parseInt(totalSeconds / 60) % 60));
        hoursLabel.innerHTML = pad(parseInt(totalSeconds / 3600));
    }

    function pad(val) {
        var valString = val + "";
        if (valString.length < 2) {
            return "0" + valString;
        } else {
            return valString;
        }
    }

    // Answers/Target Monitor

    let targetWrapper = document.createElement('p');
    targetWrapper.classList.add('target-counter');

    targetLabel = document.createElement('label');
    targetLabel.setAttribute('id', "targetCount");
    targetLabel.setAttribute('data-title', "هدف تعیین شده برای این مجموعه داده");
    targetLabel.innerText = '0';

    // myAxios.get(Config.getAllTargets, {
    //     params: {
    //         datasetId: props.datasetId,
    //         ownerId: Store.get('user')
    //     }
    // }).then(targets => {
    //     let answerscount = (targets.data.result.items.length) ? targets.data.result.items[0].answerCount : '0';
    //     targetLabel.innerText = `${answerscount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    //     targetLabel.setAttribute('data-value', answerscount);
    // }).catch((err) => {
    //     console.log('error', err);
    // });

    let answerscount = 6250;
    targetLabel.innerText = `${answerscount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
    targetLabel.setAttribute('data-value', answerscount);

    answersLabel = document.createElement('label');
    answersLabel.setAttribute('id', "answersCount");
    answersLabel.setAttribute('data-title', "تعداد پاسخ های شما تا این لحظه");
    answersLabel.innerText = '0';

    // myAxios.post(Config.getAnswersStats, {
    //     dataSetId: props.datasetId,
    //     UserId: Store.get('user')
    // }).then(stats => {
    //     if (stats.data.result.totalCount) {
    //         answersLabel.innerText = stats.data.result.totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    //         answersLabel.setAttribute('data-value', stats.data.result.totalCount);
    //     }
    // }).catch((err) => {
    //     console.log('error', err);
    // });

    let answersCountTemp = 235;
    answersLabel.innerText = answersCountTemp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    answersLabel.setAttribute('data-value', answersCountTemp);

    targetWrapper.appendChild(targetLabel);
    let devider = document.createElement('span');
    devider.innerText = '/';
    targetWrapper.appendChild(devider);
    targetWrapper.appendChild(answersLabel);

    statsWrapper.appendChild(targetWrapper);

    let backBtn = document.createElement('button');
    backBtn.className = style["back-btn"];
    backBtn.innerText = '🡠';
    backBtn.onclick = () => {
        window.location.href = '/';
    }

    backBtnWrapper.appendChild(statsWrapper);
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

    let mainSide = document.createElement('div');
    mainSide.className = "col-3";

    let questionHistory = document.createElement('ul');
    questionHistory.className = "question-history";

    let sideImages = [];
    questions.forEach((link, idx) => {
        let listItem = document.createElement('li');
        listItem.setAttribute('id', `q-${link.id}`);
        listItem.className = "question-list-items question-list-items-sentence";
        if (link.id == currentQuestion.id) {
            listItem.classList.add('active');
        }

        if (link.g) {
            listItem.classList.add('g');
        }

        listItem.onclick = () => viewQuestion(link);

        if (link.answer === true) {
            listItem.classList.add('completed', 'yes');
        }

        if (link.answer === false) {
            listItem.classList.add('completed', 'no');
        }

        // let tmp = document.createElement('span');
        // tmp.classList.add('question-history-sentence-icon');
        // tmp.innerText = '⚉';
        // listItem.appendChild(tmp);

        // sideImages[link.id] = tmp;
        // tmp.className = style["question-history-avatar"];
        // Axios.get(Config.baseUrl + Config.getFile + `/${link.datasetItemId}`, {
        //     responseType: 'blob',
        //     headers: {
        //         authorization: `Bearer ${Store.get('token')}`
        //     }
        // }).then(result => {
        //     let blob = new Blob([result.data], {type: 'image/jpg'});
        //     let avatar = URL.createObjectURL(blob);
        //     questions[link.id].image = avatar;
        //     sideImages[link.id].style.backgroundImage = `url("${avatar}")`;
        // }).catch(err => {
        //     console.log('error: ', err);
        // });

        let tmp = document.createElement('p');
        tmp.innerText = link.text;
        tmp.classList.add('question-history-sentence');
        listItem.appendChild(tmp);

        tmp = document.createElement('span');
        tmp.className = style["question-history-text"];

        if (link.answer === true) {
            tmp.innerHTML = `${yesSVG}`;
        }

        if (link.answer === false) {
            tmp.innerHTML = `${noSVG}`;
        }

        listItem.appendChild(tmp);

        questionHistory.appendChild(listItem);
    });

    mainSide.appendChild(questionHistory);

    let mainArticle = document.createElement('div');
    mainArticle.className = 'col-9';

    let questionWrapper = document.createElement('div');
    questionWrapper.className = style["question-wrapper"];

    let questionLabel = 'حس‌اتان نسبت به این جمله چیست؟';
    let googleQ = document.createElement('strong');

    let fieldNameSpan = document.createElement('span');
    fieldNameSpan.innerText = ` (${currentQuestion.source} - ${currentQuestion.field})`;
    fieldNameSpan.style.fontSize = '12px';
    fieldNameSpan.style.color = '#bbb';
    let tmpLabel = document.createTextNode(questionLabel);
    googleQ.appendChild(tmpLabel);
    googleQ.appendChild(fieldNameSpan);


    // myAxios.get(Config.getDatasetItem, {
    //     params: {
    //         id: currentQuestion.datasetItemId
    //     }
    // }).then(datasetItem => {
    //     let fieldName = datasetItem.data.result.filePath;
    //     fieldName = fieldName.split('\\')[4];
    //     let tempFieldName = '';
    //     switch (fieldName) {
    //         case 'Actors':
    //             tempFieldName = 'بازیگر';
    //             fieldNameSpan.innerText = ' (بازیگر)';
    //             break;
    //
    //         case 'Singers':
    //             tempFieldName = 'خواننده';
    //             fieldNameSpan.innerText = ' (خواننده)';
    //             break;
    //
    //         case 'Politicians':
    //             tempFieldName = 'سیاستمدار';
    //             fieldNameSpan.innerText = ' (سیاست مدار)';
    //             break;
    //     }
    //
    //     googleQ.onclick = () => {
    //         window.open(`https://www.google.com/search?tbm=isch&q="${questionLabel}" ${tempFieldName}`);
    //     };
    // }).catch(err => {
    //     console.log('error', err);
    // });

    tmp = document.createElement('p');
    tmp.className = "question-text";
    let tmp1 = document.createTextNode(`آیا تصویر زیر متعلق به `);
    let tmp2 = document.createTextNode(` است؟`);

    // tmp.appendChild(tmp1);
    tmp.appendChild(googleQ);
    // tmp.appendChild(tmp2);

    questionWrapper.appendChild(tmp);

    // let questionImage = document.createElement('img');
    // questionImage.className = "question-image";
    // Axios.get(Config.baseUrl + Config.getFile + `/${currentQuestion.datasetItemId}`, {
    //     responseType: 'blob',
    //     headers: {
    //         authorization: `Bearer ${Store.get('token')}`
    //     }
    // }).then(result => {
    //     let blob = new Blob([result.data], {type: 'image/jpg'});
    //     let avatar = URL.createObjectURL(blob);
    //     questionImage.src = avatar;
    // }).catch(err => {
    //     console.log('error: ', err);
    // });
    //
    let questionSentence = document.createElement('p');
    questionSentence.classList.add('question-sentence');
    questionSentence.innerText = currentQuestion.text;

    questionWrapper.appendChild(questionSentence);

    mainArticle.appendChild(questionWrapper);

    let answerWrapper = document.createElement('div');
    answerWrapper.className = "answer-wrapper";

    let yesNoType = document.createElement('div');
    yesNoType.className = "yes-no-type emoji-container";

    let yesBtn = document.createElement('button');
    yesBtn.innerHTML = `😄<br><p>خوب</p>`;
    yesBtn.setAttribute('id', 'yesBtn');
    yesBtn.setAttribute('data-id', `${currentQuestion.id}`);
    yesBtn.onclick = () => saveAnswer(true);
    yesNoType.appendChild(yesBtn);

    let skipBtn = document.createElement('button');
    skipBtn.setAttribute('id', 'skipBtn');
    skipBtn.setAttribute('data-id', `${currentQuestion.id}`);
    skipBtn.onclick = () => {
        skipQuestion(currentQuestion.id);
    }
    skipBtn.innerHTML = `🙄<br><p>هیچی</p>`;
    yesNoType.appendChild(skipBtn);

    let noBtn = document.createElement('button');
    noBtn.innerHTML = `😡<br><p>بد</p>`;
    noBtn.setAttribute('id', 'noBtn');
    noBtn.setAttribute('data-id', `${currentQuestion.id}`);
    noBtn.onclick = () => saveAnswer(false);
    yesNoType.appendChild(noBtn);

    answerWrapper.appendChild(yesNoType);
    mainArticle.appendChild(answerWrapper);

    mainDiv.appendChild(mainArticle);
    mainDiv.appendChild(mainSide);

    container.appendChild(mainDiv);

    // footer section
    let footer = document.createElement('div');
    footer.classList.add("row", "footer");

    submitBtn = document.createElement('button');
    submitBtn.className = 'answer';
    submitBtn.onclick = () => {
        location.reload();
    }
    submitBtn.innerHTML = 'برو به لیست بعدی ';
    footer.appendChild(submitBtn);

    let reportBtn = document.createElement('button');
    reportBtn.onclick = function () {
        showModal({
            title: 'گزارش خطا',
            body: `از گزارش جمله زیر اطمینان دارید؟
                    <br>
                    <br>
                    <p style="color: #999; padding-right: 10px; border-right: solid 4px #dddddd;">${currentQuestion.text}</p>
                    <br>
                    <br>`,
            actions: [
                {
                    title: 'بله، گزارش بده',
                    fn: () => {
                        sendReport(currentQuestion.id, () => {
                            questions[currentQuestion.id].answer = null;
                            questions[currentQuestion.id].reported = true;
                            let item = document.getElementById(`q-${currentQuestion.id}`);
                            item.classList.remove('completed', 'yes', 'no');
                            item.classList.add('completed', 'report');
                            nextQuestion(++currentQuestion.id);
                        });
                    }
                }, {
                    title: 'خیر',
                    fn: () => {
                        closeModal();
                    }
                }
            ]
        })
    };
    reportBtn.innerHTML = `گزارش ${reportSVG}`;
    footer.appendChild(reportBtn);

    container.appendChild(footer);

    return container;
}
