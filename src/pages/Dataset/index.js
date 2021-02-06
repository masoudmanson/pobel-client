import "toastify-js/src/toastify.css";
import myAxios from "../../config/axios";
import Config from "../../config";
import Store from "../../store";
import moment from "jalali-moment";
import Chart from "chart.js";
import nochart from '../../assets/images/nochart.svg';
import Toastify from "toastify-js";
import Modal from '@components/Modal';

let allAnswers = [],
    datasetId,
    datasetType,
    allAnswersOnDatabase = 0;

function loadMoreAnswers(datasetId) {
    return new Promise((resolve, reject) => {
        myAxios.get(Config.getAllAnswers, {
            params: {
                DataSetId: datasetId,
                IncludeQuestion: true,
                UserId: Store.get('user'),
                skipCount: allAnswers.length,
                MaxResultCount: Config.statics.paginationSize
            }
        }).then(datasetAnswers => {
            resolve(datasetAnswers);
        }).catch((err) => {
            reject(err);
        });
    });
}

function makeAnswersDom(answers, datasetType) {
    // datasetType = 2;
    // answers = [{
    //     id: Math.random(),
    //     answer: Math.round(Math.random() * 2),
    //     questionObject: {
    //         text: 'من این گوشی رو خریدم و واقعا از خریدم راضی ام.'
    //     }
    // }, {
    //     id: Math.random(),
    //     answer: Math.round(Math.random() * 2),
    //     questionObject: {
    //         text: 'غدای به قدری سرد بود که اصلا هیچی دیگه!'
    //     }
    // }, {
    //     id: Math.random(),
    //     answer: Math.round(Math.random() * 2),
    //     questionObject: {
    //         text: 'این هتل واقعا قابل قیاس با هتلهای ۵ستاره لوکس در ایران میباشدبا تشکر از کلیه کارکنان وارزوی ادامه وضعیت موجود در اینده'
    //     }
    // }, {
    //     id: Math.random(),
    //     answer: Math.round(Math.random() * 2),
    //     questionObject: {
    //         text: 'نسبت به دفعه پیش کباب طعم جالبی نداشت وبرنج کمی خام بود باتشکر'
    //     }
    // }];
    allAnswers = allAnswers.concat(answers);

    let output = '';

    if (datasetType === 3) {
        answers.forEach((link, idx) => {
            if (document.getElementById(`${link.id}-image`)) {
                return;
            }

            let mainAnswerItem = document.createElement('li');
            mainAnswerItem.classList.add('dataset-answers-history-items');
            mainAnswerItem.setAttribute('id', `${link.id}-image`);

            let yourAnswer = document.createElement('span');
            yourAnswer.classList.add('dataset-answers-history-items-result');
            yourAnswer.innerText = `${(link.answer) ? '⤫' : '✓'}`;

            let answerTitle = document.createElement('span');
            answerTitle.classList.add('dataset-answers-history-items-name');
            answerTitle.innerText = JSON.parse(link.questionObject).Title.replace(/[0-9]/g, '').replace(/_/g, ' ');

            mainAnswerItem.appendChild(yourAnswer);
            mainAnswerItem.appendChild(answerTitle);

            myAxios.get(Config.getFile + `/${link.dataSetItemId}`, {
                responseType: 'blob'
            }).then(result => {
                let blob = new Blob([result.data], {type: 'image/jpg'});
                let avatar = URL.createObjectURL(blob);
                let listItem = document.getElementById(link.id + '-image');
                listItem.style.backgroundImage = `url(${avatar})`;
            }).catch(err => {
                console.log('error: ', err);
            });
            document.getElementById('answers-wrapper').appendChild(mainAnswerItem);
        });
    } else if (datasetType === 2) {
        answers.forEach(answer => {
            if (document.getElementById(`${answer.id}-text`)) {
                return;
            }

            let mainAnswerItem = document.createElement('li');
            mainAnswerItem.classList.add('dataset-answers-history-items', 'dataset-answers-history-items-text');
            mainAnswerItem.setAttribute('id', `${answer.id}-text`);

            let yourAnswer = document.createElement('span');
            yourAnswer.classList.add('dataset-answers-history-items-result', 'dataset-answers-history-items-result-text');

            let answerTitle = document.createElement('span');
            answerTitle.classList.add('dataset-answers-history-items-name');

            switch (answer.answer) {
                case 0:
                    yourAnswer.innerText = `😄`;
                    answerTitle.innerText = 'حس خوب';
                    break;
                case 2:
                    yourAnswer.innerText = `🙄`;
                    answerTitle.innerText = 'حس بی طرف';
                    break;
                case 1:
                    yourAnswer.innerText = `😡`;
                    answerTitle.innerText = 'حس بد';
                    break;
            }

            let answerText = document.createElement('span');
            answerText.classList.add('dataset-answers-history-items-answer');
            answerText.innerText = answer.questionObject.text;

            mainAnswerItem.appendChild(yourAnswer);
            mainAnswerItem.appendChild(answerText);
            mainAnswerItem.appendChild(answerTitle);
            document.getElementById('answers-wrapper').appendChild(mainAnswerItem);
        });
    }
}

function generateAnswersDiv(datasetId, datasetType) {
    loadMoreAnswers(datasetId).then((datasetAnswers) => {
        let answers = datasetAnswers.data.result.items;
        allAnswersOnDatabase = datasetAnswers.data.result.totalCount;
        makeAnswersDom(answers, datasetType);
    });
};

function generateAnswersStatsDiv(datasetId) {
    myAxios.post(Config.getAnswersStats, {
        dataSetId: datasetId,
        UserId: Store.get('user')
    }).then(stats => {
        if (stats.data.result.totalCount) {
            document.getElementsByClassName('dataset-answers')[0].style.visibility = 'visible';
            document.getElementById('stats-answers').innerText = stats.data.result.totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            document.getElementById('dashboard-all-answers').innerText = stats.data.result.totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    }).catch((err) => {
        console.log('error', err);
    });
}

function generateTargetDiv(datasetId, labelingStatus) {
    myAxios.get(Config.getAllTargets, {
        params: {
            datasetId: datasetId,
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
                document.getElementById('weekly-target-count').innerHTML = answerscount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                document.getElementById(`target-${targetDefinition.data.result.id}`).classList.add('active');
            }).catch((err) => {
                console.log('error', err);
            });

            // document.getElementById('dataset-action-wrapper').innerHTML = `
            //     <a href="/labeling/linear/${datasetId}" class="start-btn">خطی</a>
            //     <a href="/labeling/grid/${datasetId}" class="start-btn">گرید</a>
            // `;
            document.getElementById('dataset-action-wrapper').innerHTML = `
                <a href="/labeling/grid/${datasetId}" class="start-btn">شروع برچسب زنی</a>
            `;
        } else if (labelingStatus) {
            document.getElementById('weekly-target-count').innerHTML = 0;
            document.getElementById('weekly-target').style.opacity = 0.2;
            let setTargetBtn = document.createElement('button');
            setTargetBtn.classList.add('set-target-btn');
            setTargetBtn.setAttribute('id', 'setTargetFromCards');
            setTargetBtn.innerText = 'هدف گذاری کنید';

            let scrollToSetTarget = () => {
                let setTargetDivOffsetTop = document.getElementById('set-target').getBoundingClientRect().top - 20;
                window.scrollTo({
                    top: setTargetDivOffsetTop,
                    block: "start",
                    behavior: "smooth"
                });
            }
            setTargetBtn.onclick = scrollToSetTarget;

            document.getElementById('set-show-target').appendChild(setTargetBtn);

            let targetToStart = document.createElement('a');
            targetToStart.classList.add('start-btn');
            targetToStart.innerText = 'برای شروع، هدف‌گذاری کنید';
            targetToStart.onclick = scrollToSetTarget;

            document.getElementById('dataset-action-wrapper').innerHTML = '';
            document.getElementById('dataset-action-wrapper').appendChild(targetToStart);

            let helpModal = Modal({
                title: 'راهنمای برچسب زنی',
                body: `<p>
                        این مجموعه داده مربوط به مشاهیر ایران می‌باشد. در هر صفحه تصاویری وجود دارد و از کاربر خواسته شده که "تصاویر مربوط به یک شخص مشهور را مشخص نماید". در صورتیکه کاربر شناختی از شخصیت مذکور نداشته باشد می‌تواند جهت آشنایی با کلیک بر روی نام وی، تصاویرش را در موتور جستجوی گوگل مشاهده کند.
                        </p>
                        
                        <p>
                        با قرار دادن نشانگر بر روی هر یک از تصاویر، سه آیکون صحیح، غلط و گزارش نمایش داده می‌شود. کاربر می‌بایست در صورت اطمینان از مطابقت هر تصویر با شخصیت عنوان شده گزینه صحیح و در صورت عدم انطباق گزینه غلط را بر روی تصویر مورد نظر درج کند. در صورت مشاهده مشکلاتی نظیر پایین بودن کیفیت تصویر، شایسته است که کاربر با درج گزینه گزارش بر روی تصویر این مورد را به راهبر سیستم اطلاع دهد.
                        </p>
                        
                        <p>
                        همچنین انتخاب نکردن هیچکدام از گزینه‌های صحیح و غلط برای یک تصویر بمعنی صرفنظر کردن از پاسخ دادن خواهد بود. از آنجا که میزان شارژ کیف پول کاربران کاملاً وابسته به صحت پاسخ‌های آنها دارد، توصیه می‌گردد در صورت عدم اطمینان، از پاسخ دادن صرفنظر شود. جهت ثبت پاسخ‌ها در هر صفحه، می‌بایست گزینه ارسال پاسخ در انتهای صفحه انتخاب گردد و سپس متناسب با تعداد آیکونهای صحیح و غلط درج شده بر روی تصاویر، مقادیر برچسب‌های ثبت شده کاربر بروز می‌گردد.
                        </p>
                        
                        <p>
                        لطفا پیش از شروع بخش <a href="/faq">سوالات متداول</a> را مشاهده نمایید.
                        </p>  `,
                actions: [
                    {
                        title: 'هدف‌گذاری کنید',
                        class: ['active'],
                        fn: () => {
                            scrollToSetTarget();
                            helpModal.close();
                        }
                    },
                    {
                        title: 'بستن',
                        class: ['noBorder'],
                        fn: () => {
                            helpModal.close();
                        }
                    }
                ],
                closeBtnAction: () => {
                    helpModal.close();
                }
            });
        } else {
            document.getElementById('weekly-target-count').innerHTML = 0;
            // document.getElementById('weekly-target').style.opacity = 0.2;
        }
    }).catch((err) => {
        console.log('error', err);
    });
}

function getDatasetCredit(datasetId) {
    myAxios.get(Config.getCredit, {
        params: {
            userId: Store.get('user'),
            dataSetId: datasetId
        }
    }).then(res => {
        let data = res.data;
        document.getElementById('stats-credit').innerHTML = data.result.credit.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        if (data.result.credit > 0) {
            let collectCredit = document.createElement('button');
            collectCredit.classList.add('set-target-btn');
            collectCredit.setAttribute('id', 'collectCreditFromDataset');
            collectCredit.innerText = 'دریافت مبلغ اعتبار';

            collectCredit.onclick = () => {
                myAxios.post(Config.collectCredit, {
                    userId: Store.get('user'),
                    dataSetId: datasetId
                }).then(credit => {
                    if(!credit.error && credit.data.result.creditAmount > 0) {
                        Toastify({
                            text: `امتیاز ${credit.data.result.creditAmount.toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ",")} به حساب پابل شما منتقل گردید.<br>برای مشاهده به <a href="/dashboard">پروفایل</a> خود مراجعه نمائید.`,
                            duration: 5000,
                            gravity: 'top',
                            position: 'left',
                            backgroundColor: 'linear-gradient(to right, #26a247 0%, #2cbf4a 100%)',
                            onClick: () => {
                            }
                        }).showToast();

                        document.getElementById('stats-credit').innerHTML = '0.00';
                    }
                }).catch(error => {
                    if(error.data.error) {
                        Toastify({
                            text: error.data.error.message,
                            duration: 5000,
                            gravity: 'top',
                            position: 'left',
                            backgroundColor: 'linear-gradient(to right, #EB3349 0%, #F45C43  100%)',
                            onClick: () => {
                            }
                        }).showToast();
                    }
                })
            };

            // TODO: hide transactions Button
            // document.getElementById('collect-credit').appendChild(collectCredit);
        }
    }).catch(err => {
        console.log('error', err);
    });
}

function generateTargetListDiv(maxSize, datasetId) {
    myAxios.get(Config.getAllTargetsDefinition, {
        params: {
            datasetId: datasetId
        }
    }).then(targets => {
        targets.data.result.items.reverse().forEach((target, index) => {
            let div = document.getElementById('define-target');

            let liItem = document.createElement('li');
            liItem.classList.add('target-list-items');
            liItem.setAttribute('id', `target-${target.id}`);

            liItem.onclick = () => {
                myAxios.post(Config.setTarget, {
                    targetDefinitionId: target.id
                }).then(target => {
                    if (target.data.result) {
                        myAxios.get(Config.getTargetDefinition, {
                            params: {
                                id: target.data.result.targetDefinitionId,
                            }
                        }).then(targetDefinition => {
                            getDatasetCredit(datasetId);

                            let targetCount = targetDefinition.data.result.answerCount;
                            document.getElementById('weekly-target-count').innerHTML = targetCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

                            var targetLists = document.getElementsByClassName('target-list-items');
                            for (let i = 0; i < targetLists.length; i++) {
                                targetLists[i].classList.remove('active');
                            }
                            document.getElementById(`target-${targetDefinition.data.result.id}`).classList.add('active');

                            document.getElementById('weekly-target').style.opacity = 1;
                            document.getElementById('setTargetFromCards') && document.getElementById('setTargetFromCards').remove();
                            // document.getElementById('dataset-action-wrapper').innerHTML = `
                            //     <a href="/labeling/linear/${datasetId}" class="start-btn">خطی</a>
                            //     <a href="/labeling/grid/${datasetId}" class="start-btn">گرید</a>
                            // `;
                            document.getElementById('dataset-action-wrapper').innerHTML = `
                                <a href="/labeling/grid/${datasetId}" class="start-btn">شروع برچسب زنی</a>
                            `;

                        }).catch((err) => {
                            console.log('error', err);
                        });
                    } else {
                        document.getElementById('weekly-target-count').innerHTML = `&lrm; / 0`;
                    }
                }).catch(err => {
                    console.log('error', err);
                });
            }

            let tmp = document.createElement('h3');
            tmp.innerText = target.answerCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

            let tmp2 = document.createElement('p');
            tmp2.innerHTML = `هدف شماره ${index + 1}`;

            liItem.appendChild(tmp2);
            liItem.appendChild(tmp);

            div.appendChild(liItem);
        });
    }).catch((err) => {
        console.log('error', err);
    });
}

function showAnswersChart(datasetId) {
    myAxios.get(Config.reportsAnswerCounts, {
        params: {
            UserId: Store.get('user'),
            DataSetId: datasetId
        }
    }).then(datasets => {
        if (datasets.data.result.length) {
            document.getElementById('dataset-history-answers-chart').innerHTML = `<canvas id="myChart"></canvas>`;

            let finalDataDates = [];
            let finalDataCounts = [];

            datasets.data.result.forEach(v => {
                finalDataDates.push(moment(v.date).locale('fa').format('DD MMMM YY'));
                finalDataCounts.push(v.count);
            });

            let fillUpDates = [];

            if (finalDataDates.length >= 1) {
                let currDate = moment(new Date(datasets.data.result[0]['date'])).startOf("day");
                let lastDate = moment(new Date(datasets.data.result[datasets.data.result.length - 1]['date'])).startOf("day");

                do {
                    fillUpDates.push(moment(currDate.clone().toDate()).locale('fa').format('DD MMMM YY'));
                } while (currDate.add(1, "days").diff(lastDate) < 0);

                if(finalDataDates.length > 1) {
                    fillUpDates.push(moment(currDate.clone().toDate()).locale('fa').format('DD MMMM YY'));
                }
            } else {
                fillUpDates.push(moment(new Date(datasets.data.result[0]['date'])).locale('fa').format('DD MMMM YY'));
            }
            let chartDates = [],
                chartCount = [];

            fillUpDates.forEach(date => {
                chartDates.push(date);
                if (finalDataDates.indexOf(date) > -1) {
                    chartCount.push(finalDataCounts[finalDataDates.indexOf(date)]);
                } else {
                    chartCount.push(0);
                }
            });

            var ctx = document.getElementById('myChart').getContext('2d');

            var myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartDates,
                    datasets: [{
                        label: 'تعداد برچسب‌ها',
                        data: chartCount,
                        backgroundColor: 'transparent',
                        borderColor: '#a02344',
                        pointBackgroundColor: 'white',
                        borderWidth: 1,
                        tension: 0.4,
                    }]
                },
                options: {
                    tooltips: {
                        backgroundColor: 'rgba(150, 20, 53, .8)',
                        titleFontFamily: '"IranSans", "Segoe UI", "Ubuntu"',
                        bodyFontFamily: '"IranSans", "Segoe UI", "Ubuntu"',
                    },
                    elements: {
                        point: {
                            // radius: 0
                        }
                    },
                    legend: {
                        display: false
                    },
                    layout: {
                        padding: {
                            left: 5,
                            right: 5,
                            top: 5,
                            bottom: 5
                        }
                    },
                    scales: {
                        xAxes: [{
                            gridLines: {
                                display: false
                            },
                            ticks: {
                                // maxTicksLimit: 7,
                                display: false,
                            }
                        }],
                        yAxes: [{
                            gridLines: {
                                display: false
                            },
                            ticks: {
                                beginAtZero: true,
                                display: false
                            }
                        }]
                    }
                }
            });
        } else {
            document.getElementById('dataset-history-answers-chart').innerHTML = `<h2><img src="${nochart}" alt=""><br>نمودار موجود نیست!</h2>`;
        }
    }).catch(err => {
        console.log('error: ', err);
    });
}

function getTransactions() {
    console.log('Get All Transactions');
    myAxios.get(Config.getAllTransactions, {
        params: {
            OwnerId: Store.get('user')
        }
    }).then(trans => {
        let data = trans.data.result.items;
        if (data.length === 0) {
            let transactionsTable = document.getElementById('transactions-table');
            transactionsTable.innerHTML = `<p class="no-transaction">تراکنشی موجود نیست!</p>`;
        } else {
            let transactionsTable = document.getElementById('transactions-table');
            data.forEach(trans => {
                myAxios.get(Config.getDataset, {
                    params: {
                        id: trans.referenceDataSetId
                    }
                }).then(result => {
                    let dataset = result.data.result;

                    let listItem = document.createElement('li');

                    let reason = document.createElement('span');
                    reason.classList.add('reason');
                    reason.innerHTML = dataset.name;

                    let description = document.createElement('span');
                    description.classList.add('description');
                    description.innerHTML = trans.reasonDescription || 'توضیحات';

                    let creditAmount = document.createElement('span');
                    creditAmount.classList.add('credit-amount');
                    creditAmount.innerHTML = `${trans.creditAmount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} <small>تومان</small>`;

                    let time = document.createElement('span');
                    time.classList.add('reason');
                    time.innerText = moment(trans.creationTime, 'YYYY/MM/DD').locale('fa').format('DD jMMMM YY');

                    listItem.appendChild(reason);
                    listItem.appendChild(description);
                    listItem.appendChild(creditAmount);
                    listItem.appendChild(time);

                    transactionsTable.appendChild(listItem);
                }).catch(err => {
                    console.log('error: ', err);
                });
            });
        }
    }).catch(err => {
        console.log('error: ', err);
    });
}

window.onscroll = function (ev) {
    if (document.getElementById('answers-wrapper')) {
        if ((window.innerHeight + window.scrollY + 1) >= document.body.offsetHeight) {
            if (allAnswersOnDatabase > allAnswers.length) {
                loadMoreAnswers(datasetId).then((datasetAnswers) => {
                    let answers = datasetAnswers.data.result.items;
                    makeAnswersDom(answers, datasetType);
                });
            }
        }
    }
};

export default function (props) {
    datasetId = props.datasetId;
    datasetType = props.datasetType;

    showAnswersChart(datasetId);
    generateAnswersDiv(datasetId, datasetType);
    generateAnswersStatsDiv(datasetId);
    generateTargetDiv(datasetId, props.labelingStatus);
    getDatasetCredit(datasetId);
    generateTargetListDiv(props.maxTargetSize, datasetId);
    getTransactions();

    var template = `
        <div class="container datasets-wrapper">
                <div class="row header">                    
                    <div class="col-6-sm dataset-list-name">
                        <h3>{{dataset.name}} <small>{{dataset.description}}</small></h3>
                    </div>
                    
                    <div class="col-6-sm back-btn-wrapper">
                    
                        {{#dataset.labelingStatus}}
                        <div id="dataset-action-wrapper">
                        </div>
                        {{/dataset.labelingStatus}} 
                       &nbsp;
                        <button class="back-btn" onclick="window.location.href='/datasets'">🡠</button>
                    </div>
                </div>
             
                <div class="row dataset-history">
                    <div class="col-6-sm">
                        <div class="dataset-history-wrapper" id="set-show-target"><small>هدف شما</small>
                            <p id="weekly-target"><small id="weekly-target-count" data-title="هدف شما"></small>/<span id="dashboard-all-answers" data-title="پاسخ‌های شما">0</span></p>
                        </div>
                        <div class="dataset-history-wrapper"><small>وضعیت تگ زنی</small><p id="stats-status">{{#dataset.labelingStatus}}فعال{{/dataset.labelingStatus}}{{^dataset.labelingStatus}}غیرفعال{{/dataset.labelingStatus}}</p></div>
                        <div class="dataset-history-wrapper" id="collect-credit"><small>امتیاز شما</small><p id="stats-credit">0</p></div>
                    </div>
                        
                    <div class="col-6-sm">
                        <div class="dataset-history-wrapper wobbling" id="wobbling-bg">
                            <small>تعداد پاسخ‌های ثبت شده</small>
                            <p id="stats-answers">0</p>
                            
                            <div class="" id="dataset-history-answers-chart"></div>
                        </div>
                    </div>
                </div>
               
                {{#dataset.isActive}}
                <div class="row user-targets-wrapper" id="set-target">
                    <div class="col-12">
                        <h3>هدف گذاری</h3>
                        <small>هدف خود برای برچسب زنی بر روی این مجموعه ی داده را مشخص کنید. توجه داشته باشید چنانچه هدف تعیین نشده باشد برچسب زنی ممکن نمی باشد و اعتبار فرآیند برچسب زنی نیز بدرستی محاسبه نمی گردد.</small>
                        <br>
                        <small>با تعیین هدف توسط فرم زیر مشخص کنید در نظر دارید چه تعداد پاسخ در این مجموعه‌ی داده ثبت کنید.</small>
                        <ol id="define-target">
                        </ol>
                    </div>
                </div>
                {{/dataset.isActive}}     
                                
                <div class="row" id="trasactions-history">
                    <div class="col-12">
                        <h3>تاریخچه‌ی تراکنش‌ها</h3>
                        <ul id="transactions-table">
                            <li class="header">
                                <span class="reason">مجموعه داده</span> 
                                <span class="description">توضیحات</span>    
                                <span class="credit-amount">مبلغ</span>    
                                <span class="time">تاریخ</span>    
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div class="row dataset-answers" style="visibility: hidden">
                    <div class="col-12">
                        <h3>پاسخ های شما: </h3>
                        <ul class="dataset-answers-history" id="answers-wrapper">
                        </ul>  
                    </div>
                </div>  
        </div>
    `;

    return template;
}
