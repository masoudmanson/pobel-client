import style from './index.css';
import myAxios from "../../config/axios";
import Config from "../../config";
import Store from "../../store";
import moment from "jalali-moment";
import Mustache from "mustache";
import Wobble from "../../lib/wobble";
import Toastify from "toastify-js";

var allAnswers = 0;

function getAccountBalance() {
    myAxios.get(Config.getBalance, {
        params: {
            ownerId: Store.get('user')
        }
    }).then(balance => {
        let data = balance.data;
        console.log('Account Balance is: ', data);

        document.getElementById('wallet-credit').innerHTML = data.result.total.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '<small> تومان</small>';

        let cashoutBtn = document.createElement('button');
        cashoutBtn.classList.add('set-target-btn');
        cashoutBtn.setAttribute('id', 'cashout-btn');
        cashoutBtn.innerText = 'انتقال به کیف پول';

        cashoutBtn.onclick = () => {
            console.log('انتقال اعتبار به کیف پول پاد در حال پیاده سازی می باشد!');

            Toastify({
                text: 'در حال حاضر امکان انتقال به کیف پول ممکن نمی باشد!',
                duration: 5000,
                gravity: 'top',
                position: 'left',
                backgroundColor: 'linear-gradient(to right, #EB3349 0%, #F45C43  100%)',
                onClick: () => {
                }
            }).showToast();
        };

        // TODO : Hide transfer button
        // document.getElementById('cash-out-wrapper').appendChild(cashoutBtn);

    }).catch(err => {
        console.log('error: ', err);
    });
}

function getAllAnswers() {
    myAxios.get(Config.getAllAnswers, {
        params: {
            UserId: Store.get('user')
        }
    }).then(stats => {
        allAnswers = stats.data.result.totalCount;
        document.getElementById('stats-answers').innerText = allAnswers.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }).catch((err) => {
        console.log('error', err);
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

export default function () {
    getAccountBalance();
    getAllAnswers();
    getTransactions();

    var template = `
        <div class="container datasets-wrapper">
            <div class="row">
                <div class="row header">
                    <div class="col-12-sm dataset-list-name">
                        <h3>خوش آمدید<small>{{user.fullName}}</small></h3>
                    </div>
                </div>
                
                <div class="row dataset-history">
                    <div class="col-6-sm">
                        <div class="dataset-history-wrapper"><small>نام کاربری: </small><p id="stats-all">{{user.userName}}</p></div>
                        <div class="dataset-history-wrapper"><small>وضعیت اکانت: </small><p id="stats-status">{{#user.isActive}}فعال{{/user.isActive}}{{^user.isActive}}غیرفعال{{/user.isActive}}</p></div>
                    </div>
                        
                    <div class="col-6-sm">
                        <div class="dataset-history-wrapper"><small>تعداد پاسخ های ثبت شده: </small><p id="stats-answers">0</p></div>
                        <div class="dataset-history-wrapper" id="cash-out-wrapper"><small>اعتبار کیف پول: </small><p id="wallet-credit">0 <small>ریال</small></p></div>
                    </div>
                </div>
                
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
            </div>
        </div>
    `;

    return template;
}
