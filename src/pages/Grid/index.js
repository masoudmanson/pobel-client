import style from './index.css';
import "toastify-js/src/toastify.css";

import Store from '../../store';
import myAxios from '../../config/axios';
import Config from "../../config";
import Toastify from "toastify-js";
import Modal from '@components/Modal';

var questions = [],
    currentQuestion,
    globalQuestionTimer = null,
    totalSeconds = 0,
    submitBtn,
    targetLabel,
    answersLabel;

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

    if(answers.length) {
        myAxios.post(Config.submitAnswers, {
                answers: answers
            }
        ).then(result => {
            changeSubmitBtn(false);

            let gridDiv = document.getElementsByClassName('grid-images-list')[0];

            gridDiv.style.pointerEvents = 'none';
            gridDiv.style.opacity = 0.5;
            gridDiv.style.filter = 'blur(5px)';

            submitBtn.style.marginTop = '-270px';
            submitBtn.style.marginBottom = '300px';
            submitBtn.style.height = '44px';
            submitBtn.style.borderColor = '#666';

            gridDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                Toastify({
                    text: 'پاسخ‌ها ارسال شده‌اند. امکان تغییر وجود ندارد!<br/>به لیست بعدی بروید ...',
                    duartion: 5000,
                    gravity: 'top',
                    position: 'left',
                    backgroundColor: 'linear-gradient(to right, #EB3349 0%, #F45C43  100%)',
                    onClick: () => {
                        console.log('پاسخ‌ها ارسال شده‌اند. امکان تغییر وجود ندارد!');
                    }
                }).showToast();
            }, true);

            window.location.href = '/labeling/grid/' + questions[0].options[1].dataSetId;
        }).catch(err => {
            console.log('error: ', err);
            let errorModal = Modal({
                title: 'خطایی رخ داد!',
                body: 'مشکلی در ارسال پاسخ ها به وجود آمد. آیا می خواهید مجدد تلاش کنید؟',
                class: ['active'],
                actions: [
                    {
                        title: 'تلاش مجدد',
                        fn: () => {
                            errorModal.close();
                            submitAnswers();
                        },
                        timeout: 5000
                    },
                    {
                        title: 'خیر',
                        class: ['noBorder'],
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

function sendReport(qId, listItem, callback) {
    listItem.innerHTML = '';
    callback && callback();
}

function changeSubmitBtn(status) {
    if(status) {
        submitBtn.innerHTML = 'ارسال پاسخ ها';
        submitBtn.classList.add('with-answers');
        submitBtn.onclick = () => {
            let continueModal = Modal({
                title: 'ارسال پاسخ و ادامه',
                body: 'تمایل دارید پاسخ‌های انتخاب شده ارسال شده و فرآیند برچسب زنی ادامه یابد؟',
                fullscreen: true,
                actions: [
                    {
                        title: 'ارسال پاسخ‌ها و ادامه',
                        class: ['active'],
                        fn: () => {
                            submitAnswers();
                        },
                        timeout: 5000
                    },
                    {
                        title: 'خیر، بازگشت',
                        class: ['noBorder'],
                        fn: () => {
                            continueModal.close();
                        }
                    }
                ],
                closeBtnAction: () => {
                    continueModal.close();
                }
            });
        };
    } else {
        submitBtn.innerHTML = 'برو به لیست بعدی';
        submitBtn.classList.remove('with-answers');
        submitBtn.onclick = () => {
            location.reload();
        };
    }
}

export default function (props) {
    questions = getRandom(props.result, (props.result.length >= 9) ? 9 : props.result.length);
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

    myAxios.get(Config.getAllTargets, {
        params: {
            datasetId: props.datasetId,
            ownerId: Store.get('user'),
            order: 'DESC',
            maxResultCount: 1
        }
    }).then(target => {
        if (target.data.result.items.length) {
            myAxios.get(Config.getTargetDefinition, {
                params: {
                    id: target.data.result.items[0].targetDefinitionId,
                }
            }).then(targetDefinition => {
                let answerscount = (targetDefinition.data.result) ? targetDefinition.data.result.answerCount : '0';
                targetLabel.innerText = `${answerscount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
                targetLabel.setAttribute('data-value', answerscount);
            }).catch((err) => {
                console.log('error', err);
            });
        } else {
            document.getElementById('weekly-target-count').innerHTML = 0;

        }
    }).catch((err) => {
        console.log('error', err);
    });

    answersLabel = document.createElement('label');
    answersLabel.setAttribute('id', "answersCount");
    answersLabel.setAttribute('data-title', "تعداد پاسخ های شما تا این لحظه");
    answersLabel.innerText = '0';

    myAxios.post(Config.getAnswersStats, {
        dataSetId: props.datasetId,
        UserId: Store.get('user')
    }).then(stats => {
        if (stats.data.result.totalCount) {
            answersLabel.innerText = stats.data.result.totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            answersLabel.setAttribute('data-value', stats.data.result.totalCount);
        }
    }).catch((err) => {
        console.log('error', err);
    });

    targetWrapper.appendChild(targetLabel);
    let devider = document.createElement('span');
    devider.innerText = '/';
    targetWrapper.appendChild(devider);
    targetWrapper.appendChild(answersLabel);

    statsWrapper.appendChild(targetWrapper);

    let backBtn = document.createElement('button');
    backBtn.classList.add("back-btn");
    backBtn.innerText = '🡠';
    backBtn.onclick = () => {
        window.location.href = '/dataset/' + props.datasetId;
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

    let mainGrid = document.createElement('div');
    mainGrid.classList.add('col-12', 'grid-images-wrapper');

    let mainQuestion = document.createElement('p');
    mainQuestion.classList.add('question-text', 'static');

    let googleQ = document.createElement('strong');
    googleQ.style.cursor = 'pointer';
    googleQ.innerText = `${props.label} (${props.fieldName})`;
    googleQ.onclick = () => {
        window.open(`https://www.google.com/search?tbm=isch&q="${props.label}" ${props.fieldName}`);
    };

    let tmp1 = document.createTextNode(`تصاویر `);
    let tmp2 = document.createTextNode(` را مشخص کنید.`);

    mainQuestion.appendChild(tmp1);
    mainQuestion.appendChild(googleQ);
    mainQuestion.appendChild(tmp2);

    let gridImagesList = document.createElement('ol');
    gridImagesList.className = 'grid-images-list';
    let gridQuestionImages = [];

    questions.forEach((link, idx) => {
        let listItem = document.createElement('li');
        listItem.setAttribute('id', `q-${link.id}`);
        listItem.classList.add('grid-images-list-items');

        //TODO : remove G from questions
        if(link.g) {
            // listItem.classList.add('g');
        }

        gridQuestionImages[link.id] = listItem;
        myAxios.get(Config.baseUrl + Config.getFile + `/${link.datasetItemId}`, {
            responseType: 'blob',
            headers: {
                authorization: `Bearer ${Store.get('token')}`
            }
        }).then(result => {
            let blob = new Blob([result.data], {type: 'image/jpg'});
            let avatar = URL.createObjectURL(blob);
            questions[link.id].image = avatar;
            gridQuestionImages[link.id].style.backgroundImage = `url("${avatar}")`;
        }).catch(err => {
            console.log('error: ', err);
        });

        let listItemOverlay = document.createElement('div');
        listItemOverlay.classList.add('grid-images-overlay-bg');

        let listItemOverlayYes = document.createElement('div');
        listItemOverlayYes.classList.add("grid-images-overlay-icons", "grid-images-overlay-yes");
        listItemOverlayYes.onclick = () => {
            if (questions[idx].answer === true) {
                let tempValueAttr = Number(answersLabel.getAttribute('data-value'));
                answersLabel.innerText = (tempValueAttr - 1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                answersLabel.setAttribute('data-value', tempValueAttr - 1);

                questions[idx].answer = null;
                listItem.classList.remove('completed', 'yes', 'no');
                changeSubmitBtn(questions.some(q => typeof(q.answer) === 'boolean'));
            } else {
                let tempValueAttr = Number(answersLabel.getAttribute('data-value'));
                answersLabel.innerText = (tempValueAttr + 1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                answersLabel.setAttribute('data-value', tempValueAttr + 1);

                questions[idx].answer = true;
                listItem.classList.remove('completed', 'no');
                listItem.classList.add('completed', 'yes');
                changeSubmitBtn(true);
            }
        };

        let listItemOverlayNo = document.createElement('div');
        listItemOverlayNo.classList.add("grid-images-overlay-icons", "grid-images-overlay-no");
        listItemOverlayNo.onclick = () => {
            if (questions[idx].answer === false) {
                let tempValueAttr = Number(answersLabel.getAttribute('data-value'));
                answersLabel.innerText = (tempValueAttr - 1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                answersLabel.setAttribute('data-value', tempValueAttr - 1);

                questions[idx].answer = null;
                listItem.classList.remove('completed', 'yes', 'no');
                changeSubmitBtn(questions.some(q => typeof(q.answer) === 'boolean'));
            } else {
                let tempValueAttr = Number(answersLabel.getAttribute('data-value'));
                answersLabel.innerText = (tempValueAttr + 1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                answersLabel.setAttribute('data-value', tempValueAttr + 1);

                questions[idx].answer = false;
                listItem.classList.remove('completed', 'yes');
                listItem.classList.add('completed', 'no');
                changeSubmitBtn(true);
            }
        };

        let listItemOverlayReport = document.createElement('div');
        listItemOverlayReport.setAttribute('data-id', idx);
        listItemOverlayReport.classList.add("grid-images-overlay-icons", "grid-images-overlay-report");
        listItemOverlayReport.onclick = (e) => {
            let qId = e.target.getAttribute('data-id');
            let question = questions[qId];
            let reportModal = Modal({
                title: 'گزارش خطا',
                body: `از گزارش تصویر زیر اطمینان دارید؟
                            <br>
                            <div>
                                <img src="${question.image}"/>
                            </div>`,
                actions: [
                    {
                        title: 'بله، گزارش بده',
                        class: ['active'],
                        fn: () => {
                            sendReport(currentQuestion.id, listItem, () => {
                                reportModal.close();
                                questions[idx].answer = null;
                                listItem.classList.remove('completed', 'yes', 'no');
                                listItem.classList.add('completed', 'report');
                            });
                        }
                    }, {
                        title: 'خیر',
                        class:['noBorder'],
                        fn: () => {
                            reportModal.close();
                        }
                    }
                ]
            });
        };

        listItemOverlay.appendChild(listItemOverlayYes);
        listItemOverlay.appendChild(listItemOverlayNo);
        listItemOverlay.appendChild(listItemOverlayReport);

        listItem.appendChild(listItemOverlay);

        listItem.onmouseover = (e) => {
            listItemOverlay.style.display = 'block';
        };

        listItem.onmouseout = (e) => {
            listItemOverlay.style.display = 'none';
        };

        gridImagesList.appendChild(listItem);
    });

    mainGrid.appendChild(mainQuestion);
    mainGrid.appendChild(gridImagesList);
    mainDiv.appendChild(mainGrid);

    container.appendChild(mainDiv);

    // footer section
    let footer = document.createElement('div');
    footer.classList.add("row", "footer", "grid-footer");

    submitBtn = document.createElement('button');
    submitBtn.className = 'answer';
    submitBtn.onclick = () => {
        location.reload();
    }
    submitBtn.innerHTML = 'برو به لیست بعدی ';

    footer.appendChild(submitBtn);

    container.appendChild(footer);

    return container;
}
