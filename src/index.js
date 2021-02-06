import Navaid from 'navaid';
import moment from 'jalali-moment';
import {Base64} from 'js-base64';
import App from '@components/App';

import Store from './store';
import Config from './config';
import Vivus from 'vivus';

import myAxios from "./config/axios";
import Mustache from "mustache";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import Wobble from './lib/wobble';

let main, elem;
let root = document.querySelector('#app');
let body = document.getElementsByTagName('BODY')[0];

function init() {
    Navaid('/')
        .on('/', () => {
            makeDOM({
                navOnly: true,
                backgroundColor: 'transparent',
                color: '#741457',
                padding: '20px'
            });

            myAxios.get(Config.reportsDatasets, {
                params: {
                    MaxResultCount: 3
                }
            }).then(datasets => {
                let data = datasets.data.result.items;
                data.forEach((item, index) => {
                    item.itemsCount = item.itemsCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                });

                import('@pages/Main').then(m => {
                    m = m.default || m;
                    let htmlContent = Mustache.render(m(data), {datasets: data, isLoggedIn: Store.get('isLoggedIn')});

                    main.innerHTML = htmlContent;

                    document.querySelector('#app') && document.querySelector('#app').addEventListener('mousemove', (e) => {
                        if (document.querySelector('.shadow'))
                            document.querySelector('.shadow').style.transform = `translate(${e.clientX * 0.1}px, ${e.clientY * 0.07}px)`;
                    });

                    window.onscroll = function () {
                        let scrollFromTop = (window.pageYOffset || document.documentElement.scrollTop) - (document.documentElement.clientTop || 0);

                        if (document.querySelector('#go-bottom')) {
                            if (scrollFromTop == 0) {
                                document.querySelector('#go-bottom').style.display = 'block';
                            } else if (scrollFromTop > 0) {
                                document.querySelector('#go-bottom').style.display = 'none';
                            }
                        }
                    };

                    document.querySelector('#go-bottom') && document.querySelector('#go-bottom').addEventListener('click', () => {
                        var target = document.getElementById("pobel-service");
                        animate(document.scrollingElement || document.documentElement, "scrollTop", "", 0, target.offsetTop + 90, 500, true);
                    });

                    document.querySelector('#labeling-datasets') && document.querySelector('#app').addEventListener('mousemove', (e) => {
                        let backSq1 = document.querySelector('#back-sq-1');
                        let backSq2 = document.querySelector('#back-sq-2');
                        if (backSq1) backSq1.style.transform = `translate(${e.clientX * -0.02}px, ${e.clientY * -0.02}px)`;
                        if (backSq2) backSq2.style.transform = `translate(${e.clientX * 0.04}px, ${e.clientY * 0.02}px)`;
                    });

                    if (document.querySelector('#pobel-logo')) {
                        new Vivus('pobel-logo', {duration: 200, file: '../../assets/images/logo.svg'}, () => {
                            if (document.querySelector('#pobel-logo'))
                                document.querySelector('#pobel-logo').style.transform = 'rotate(-15deg)';
                        });
                    }

                    /* Fluid */

                    (function (w) {
                        var canvas, ctx;
                        var mouse = {
                            x: 0,
                            y: 0,
                            px: 0,
                            py: 0,
                            down: false
                        };
                        var canvas_width = Math.ceil(document.documentElement.clientWidth / 100) * 100;
                        var canvas_height = Math.ceil(document.documentElement.clientHeight / 100) * 100;
                        var resolution = 100;
                        var pen_size = 100;
                        var num_cols = canvas_width / resolution;
                        var num_rows = canvas_height / resolution;
                        var speck_count = 5000;
                        var vec_cells = [];
                        var particles = [];

                        function init() {
                            canvas = document.createElement('canvas');
                            canvas.setAttribute('id', 'pobel-animated-canvas');
                            document.querySelector('#app').childNodes[0].prepend(canvas);

                            let pobelApp = document.querySelector('#app');

                            ctx = canvas.getContext("2d");
                            canvas.width = canvas_width;
                            canvas.height = canvas_height;
                            for (let i = 0; i < speck_count; i++) {
                                particles.push(new particle(Math.random() * canvas_width, Math.random() * canvas_height));
                            }
                            for (let col = 0; col < num_cols; col++) {
                                vec_cells[col] = [];
                                for (let row = 0; row < num_rows; row++) {
                                    var cell_data = new cell(col * resolution, row * resolution, resolution)
                                    vec_cells[col][row] = cell_data;
                                    vec_cells[col][row].col = col;
                                    vec_cells[col][row].row = row;
                                }
                            }
                            for (let col = 0; col < num_cols; col++) {
                                for (let row = 0; row < num_rows; row++) {
                                    var cell_data = vec_cells[col][row];
                                    var row_up = (row - 1 >= 0) ? row - 1 : num_rows - 1;
                                    var col_left = (col - 1 >= 0) ? col - 1 : num_cols - 1;
                                    var col_right = (col + 1 < num_cols) ? col + 1 : 0;
                                    var up = vec_cells[col][row_up];
                                    var left = vec_cells[col_left][row];
                                    var up_left = vec_cells[col_left][row_up];
                                    var up_right = vec_cells[col_right][row_up];
                                    cell_data.up = up;
                                    cell_data.left = left;
                                    cell_data.up_left = up_left;
                                    cell_data.up_right = up_right;
                                    up.down = vec_cells[col][row];
                                    left.right = vec_cells[col][row];
                                    up_left.down_right = vec_cells[col][row];
                                    up_right.down_left = vec_cells[col][row];
                                }
                            }
                            w.addEventListener("mousedown", mouse_down_handler);
                            w.addEventListener("touchstart", mouse_down_handler);
                            w.addEventListener("mouseup", mouse_up_handler);
                            w.addEventListener("touchend", touch_end_handler);
                            // canvas.addEventListener("mousemove", mouse_move_handler);
                            pobelApp.addEventListener("mousemove", mouse_move_handler);
                            pobelApp.addEventListener("touchmove", touch_move_handler);
                            // canvas.addEventListener("touchmove", touch_move_handler);
                            // w.onload = draw;
                            draw();
                        }

                        function update_particle() {
                            for (let i = 0; i < particles.length; i++) {
                                var p = particles[i];
                                if (p.x >= 0 && p.x < canvas_width && p.y >= 0 && p.y < canvas_height) {
                                    var col = parseInt(p.x / resolution);
                                    var row = parseInt(p.y / resolution);
                                    var cell_data = vec_cells[col][row];
                                    var ax = (p.x % resolution) / resolution;
                                    var ay = (p.y % resolution) / resolution;
                                    p.xv += (1 - ax) * cell_data.xv * 0.05;
                                    p.yv += (1 - ay) * cell_data.yv * 0.05;
                                    p.xv += ax * cell_data.right.xv * 0.05;
                                    p.yv += ax * cell_data.right.yv * 0.05;
                                    p.xv += ay * cell_data.down.xv * 0.05;
                                    p.yv += ay * cell_data.down.yv * 0.05;
                                    p.x += p.xv;
                                    p.y += p.yv;
                                    var dx = p.px - p.x;
                                    var dy = p.py - p.y;
                                    var dist = Math.sqrt(dx * dx + dy * dy);
                                    var limit = Math.random() * 0.5;
                                    if (dist > limit) {
                                        ctx.lineWidth = 1;
                                        ctx.beginPath();
                                        ctx.moveTo(p.x, p.y);
                                        ctx.lineTo(p.px, p.py);
                                        ctx.stroke();
                                    } else {
                                        ctx.beginPath();
                                        ctx.moveTo(p.x, p.y);
                                        ctx.lineTo(p.x + limit, p.y + limit);
                                        ctx.stroke();
                                    }
                                    p.px = p.x;
                                    p.py = p.y;
                                } else {
                                    p.x = p.px = Math.random() * canvas_width;
                                    p.y = p.py = Math.random() * canvas_height;
                                    p.xv = 0;
                                    p.yv = 0;
                                }
                                p.xv *= 0.5;
                                p.yv *= 0.5;
                            }
                        }

                        function draw() {
                            var mouse_xv = mouse.x - mouse.px;
                            var mouse_yv = mouse.y - mouse.py;
                            for (let i = 0; i < vec_cells.length; i++) {
                                var cell_datas = vec_cells[i];
                                for (let j = 0; j < cell_datas.length; j++) {
                                    var cell_data = cell_datas[j];
                                    if (mouse.down) {
                                        change_cell_velocity(cell_data, mouse_xv, mouse_yv, pen_size);
                                    }
                                    update_pressure(cell_data);
                                }
                            }
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            ctx.strokeStyle = "#ff639c";
                            update_particle();
                            for (let i = 0; i < vec_cells.length; i++) {
                                var cell_datas = vec_cells[i];
                                for (let j = 0; j < cell_datas.length; j++) {
                                    var cell_data = cell_datas[j];
                                    update_velocity(cell_data);
                                }
                            }
                            mouse.px = mouse.x;
                            mouse.py = mouse.y;

                            requestAnimationFrame(draw);
                        }

                        function change_cell_velocity(cell_data, mvelX, mvelY, pen_size) {
                            var dx = cell_data.x - mouse.x;
                            var dy = cell_data.y - mouse.y;
                            var dist = Math.sqrt(dy * dy + dx * dx);
                            if (dist < pen_size) {
                                if (dist < 4) {
                                    dist = pen_size;
                                }
                                var power = pen_size / dist;
                                cell_data.xv += mvelX * power * 0.4;
                                cell_data.yv += mvelY * power * 0.4;
                            }
                        }

                        function update_pressure(cell_data) {
                            var pressure_x = (cell_data.up_left.xv * 0.5 //Divided in half because it's diagonal
                                + cell_data.left.xv + cell_data.down_left.xv * 0.5 //Same
                                - cell_data.up_right.xv * 0.5 //Same
                                - cell_data.right.xv - cell_data.down_right.xv * 0.5 //Same
                            );
                            var pressure_y = (cell_data.up_left.yv * 0.5 + cell_data.up.yv + cell_data.up_right.yv * 0.5 - cell_data.down_left.yv * 0.5 - cell_data.down.yv - cell_data.down_right.yv * 0.5);
                            cell_data.pressure = (pressure_x + pressure_y) * 0.25;
                        }

                        function update_velocity(cell_data) {
                            cell_data.xv += (cell_data.up_left.pressure * 0.5 + cell_data.left.pressure + cell_data.down_left.pressure * 0.5 - cell_data.up_right.pressure * 0.5 - cell_data.right.pressure - cell_data.down_right.pressure * 0.5) * 0.25;
                            //This does the same for the Y axis.
                            cell_data.yv += (cell_data.up_left.pressure * 0.5 + cell_data.up.pressure + cell_data.up_right.pressure * 0.5 - cell_data.down_left.pressure * 0.5 - cell_data.down.pressure - cell_data.down_right.pressure * 0.5) * 0.25;

                            cell_data.xv *= .97;
                            cell_data.yv *= .97;
                        }

                        //This function is used to create a cell object.
                        function cell(x, y, res) {
                            //This stores the position to place the cell on the canvas
                            this.x = x;
                            this.y = y;
                            //This is the width and height of the cell
                            this.r = res;
                            //These are the attributes that will hold the row and column values
                            this.col = 0;
                            this.row = 0;
                            //This stores the cell's velocity
                            this.xv = 0;
                            this.yv = 0;
                            this.pressure = 0;
                        }

                        function particle(x, y) {
                            this.x = this.px = x;
                            this.y = this.py = y;
                            this.xv = this.yv = 0;
                        }

                        function mouse_down_handler(e) {
                            e.preventDefault();
                            mouse.down = true;
                        }

                        function mouse_up_handler() {
                            mouse.down = false;
                        }

                        function touch_end_handler(e) {
                            if (!e.touches) mouse.down = false;
                        }

                        function mouse_move_handler(e) {
                            // mouse.down = true;
                            mouse.px = mouse.x;
                            mouse.py = mouse.y;
                            mouse.x = e.offsetX + 235 || e.layerX;
                            mouse.y = e.offsetY + 230 || e.layerY;
                        }

                        function touch_move_handler(e) {
                            mouse.px = mouse.x;
                            mouse.py = mouse.y;
                            var rect = canvas.getBoundingClientRect();
                            mouse.x = e.touches[0].pageX - rect.left;
                            mouse.y = e.touches[0].pageY - rect.top;
                        }

                        w.Fluid = {
                            initialize: init
                        }
                    }(window));
                    window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
                    Fluid.initialize();

                    /* Fluid */

                });
            }).catch(err => {
                console.log('error: ', err);
            });
        })
        .on('/login', () => {
            window.location.href = Config.baseUrl + Config.loginUrlDev;
        })
        .on('/loggedIn/:user', props => {
            const urlParams = new URLSearchParams(window.location.search);
            const token = Base64.decode(urlParams.get('token'));

            Store.update('isLoggedIn', true);
            Store.update('token', token);
            Store.update('user', props.user);

            localStorage.setItem('token', token);
            localStorage.setItem('user', props.user);

            window.location.href = '/datasets';
        })
        .on('/faq', () => {
            makeDOM();

            import('@pages/FAQ').then(m => {
                m = m.default || m;
                let htmlContent = Mustache.render(m(), {});

                main.innerHTML = htmlContent;

                // document.getElementById('faq-accordion').addEventListener('mousemove', e => {
                //     let marks = document.getElementsByClassName('mark');
                //
                //     for (let i = 0; i < marks.length; i++) {
                //         marks.item(i).style.transform = `translate(${(Math.round(Math.random()) * 2 - 1) * Math.ceil(Math.random() * 5)}px, ${(Math.round(Math.random()) * 2 - 1) * Math.ceil(Math.random() * 5)}px)`;
                //     }
                // });

                var accordionLists = document.getElementsByClassName('title');

                for (let i = 0; i < accordionLists.length; i++) {
                    accordionLists[i].addEventListener("click", function (e) {
                        if (!this.parentNode.classList.contains('active')) {
                            this.parentNode.classList.add('active');
                            this.parentNode.querySelector('.body').style.height = "auto";

                            var height = this.parentNode.querySelector('.body').clientHeight + 20 + "px";
                            this.parentNode.querySelector('.body').style.height = "0px";

                            setTimeout(() => {
                                this.parentNode.querySelector('.body').style.height = height;
                                this.parentNode.querySelector('.body').style.padding = '10px 10px 10px 0';
                            }, 0);
                        } else {
                            this.parentNode.querySelector('.body').style.height = "0px";
                            this.parentNode.querySelector('.body').style.padding = "0px 10px 0px 0px";
                            this.parentNode.addEventListener('transitionend', () => {
                                this.parentNode.classList.remove('active');
                            }, {once: true});
                        }
                    })
                }
            });
        })
        .on('/contact', () => {
            makeDOM({
                navOnly: true,
                footer: false
            });
            import('@pages/ContactUs').then(m => {
                m = m.default || m;
                let htmlContent = Mustache.render(m(), {});

                main.innerHTML = htmlContent;

                let myMap = new L.Map('map', {
                    key: Config.mapApiKey,
                    maptype: 'standard-day',
                    poi: true,
                    marker: 'red',
                    traffic: false,
                    center: [35.728195, 51.8300000],
                    zoom: 17
                });

                let marker = L.marker([35.728150, 51.82659380]).addTo(myMap);
                marker.bindPopup('<b>فناپ سافت</b>');
            });
        })
        .on('/dashboard', () => loadDashboard())
        .on('/datasets', () => loadDatasets())
        .on('/dataset/:id', o => loadDataset(o))
        .on('/contribute', (o) => {
            let types = ['linear', 'grid'];
            myAxios.get(Config.getAllDatasets, {}).then(res => {
                let datasets = res.data.result.items.filter((dataset) => {
                    return dataset.isActive;
                });

                let dataset = datasets[Math.floor(Math.random() * datasets.length)].id;
                window.location.href = `/labeling/${types[Math.floor(Math.random() * types.length)]}/${dataset}`;
            }).catch(err => {
                console.log('error: ', err);
            });
        })
        .on('/labeling/:type/:dataset', o => startDatasetLabeling(o))
        .on('/question/:dataset/:datasetItem', o => startLabeling(o))
        .on('/question', o => showQuestion(o))
        .on('/questions/:dataset', o => showQuestions(o))
        .on('/item/:id', o => getFileItem(o))
        .on('/credit', () => getWalletCredit())
        .on('/target/set', () => setTarget())
        .on('/target/:id', (o) => getTarget(o))
        .on('/targets', () => getAllTargets())
        .on('/balance', (o) => getBalance(o))
        .on('/answers/all', () => getAllAnswers())
        .on('/user/:id', (o) => getUserProfile(o))
        .on('/users/all', () => getAllUsers())
        .on('/users/roles', () => getUserRoles())
        .on('/logout', () => {
            Store.update('isLoggedIn', false);
            Store.update('token', null);
            Store.update('user', null);
            Store.update('userObject', null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userObject');
            window.location.href = '/';
        })
        .on('/temp', () => {
            makeDOM();
            var updateDataset = {};
            myAxios.get(Config.getAllDatasets, {}).then(datasets => {
                let data = datasets.data;

                data.result.items.forEach((item, index) => {
                    item.answerBudgetCountPerUser = item.answerBudgetCountPerUser.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                });

                import('@pages/Temp').then(m => {
                        m = m.default || m;
                        let htmlContent = Mustache.render(m({
                            user: 7
                        }), {datasets: data.result.items});

                        let allAnswersCount = function (datasetId) {
                            myAxios.get(Config.getAllDatasetItems, {
                                params: {
                                    DataSetId: datasetId
                                }
                            }).then(allCount => {
                                document.getElementById('allQuestionsCount').innerText = `کل آیتم‌ها: ${allCount.data.result.totalCount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
                            }).catch((err) => {
                                console.log('error', err);
                            });
                        }

                        main.innerHTML = htmlContent;

                        document.getElementById('chooseDataset').addEventListener('change', (e) => {
                            allAnswersCount(e.target.value);
                            document.getElementById('chooseTargetDefinition').innerHTML = '';
                            document.getElementById('dataset-id').value = '';
                            document.getElementById('dataset-t').value = '';
                            document.getElementById('dataset-umin').value = '';
                            document.getElementById('dataset-umax').value = '';
                            document.getElementById('dataset-bonusFalse').value = '';
                            document.getElementById('dataset-goldenCount').value = '';
                            document.getElementById('dataset-AnswerBudgetCountPerUser').value = '';

                            let updateDatasetGoldens =document.getElementById('update-dataset-goldens');
                            updateDatasetGoldens.style.display= 'block';
                            updateDatasetGoldens.onclick = () => {
                                window.location.href = '/goldens/' + e.target.value;
                            };

                            if (e.target.value) {
                                myAxios.get(Config.getDataset, {
                                    params: {
                                        id: e.target.value
                                    }
                                }).then(datasets => {
                                    let data = datasets.data.result;

                                    myAxios.get(Config.getAllTargetsDefinition, {
                                        params: {
                                            datasetId: data.id
                                        }
                                    }).then(targetDefinitions => {
                                        let data = targetDefinitions.data.result.items;
                                        let targetDefinitionsSelect = document.getElementById('chooseTargetDefinition');

                                        let option = document.createElement('option');
                                        option.value = null;
                                        option.innerText = `تارگت مورد نظر را انتخاب کنید.`;
                                        targetDefinitionsSelect.appendChild(option);

                                        data.forEach(v => {
                                            let option = document.createElement('option');
                                            option.value = v.id;
                                            option.innerText = `تارگت: ${v.answerCount} تایی`;
                                            targetDefinitionsSelect.appendChild(option);
                                        });
                                    }).catch(e => {
                                        console.log(e);
                                    });
                                }).catch(err => {
                                    console.log('error: ', err);
                                });
                            }
                        });

                        document.getElementById('chooseTargetDefinition').addEventListener('change', (e) => {
                            if (e.target.value) {
                                myAxios.get(Config.getTargetDefinition, {
                                    params: {
                                        id: e.target.value
                                    }
                                }).then(target => {
                                    let data = target.data.result;
                                    updateDataset = data;

                                    document.getElementById('dataset-id').value = data.id;
                                    document.getElementById('dataset-t').value = data.t;
                                    document.getElementById('dataset-umin').value = data.uMin;
                                    document.getElementById('dataset-umax').value = data.uMax;
                                    document.getElementById('dataset-bonusFalse').value = data.bonusFalse;
                                    document.getElementById('dataset-goldenCount').value = data.goldenCount;
                                    document.getElementById('dataset-AnswerBudgetCountPerUser').value = data.answerCount;
                                }).catch(err => {
                                    console.log('error: ', err);
                                });
                            }
                        });

                        document.getElementById('submit-dataset-update').addEventListener('click', () => {
                            updateDataset.t = document.getElementById('dataset-t').value * 1;
                            updateDataset.uMin = document.getElementById('dataset-umin').value * 1;
                            updateDataset.uMax = document.getElementById('dataset-umax').value * 1;
                            updateDataset.answerCount = document.getElementById('dataset-AnswerBudgetCountPerUser').value * 1;
                            updateDataset.bonusFalse = document.getElementById('dataset-bonusFalse').value * 1;
                            updateDataset.goldenCount = document.getElementById('dataset-goldenCount').value * 1;

                            myAxios.put(Config.updateTargetDefinition, updateDataset).then(res => {
                                if (res.status === 200 && res.statusText === "OK") {
                                    Toastify({
                                        text: 'دیتاست با موفقیت بروز شد.',
                                        duartion: 5000,
                                        gravity: 'top',
                                        position: 'left',
                                        backgroundColor: 'linear-gradient(to right, #26a247 0%, #2cbf4a 100%)',
                                        onClick: () => {
                                        }
                                    }).showToast();
                                    let elem = document.getElementById('chooseDataset');
                                    var event = new Event('change');
                                    elem.dispatchEvent(event);
                                }
                            }).catch(err => {
                                console.log('error', err);

                                Toastify({
                                    text: 'مشکلی در بروزرسانی رخ داد!',
                                    duartion: 5000,
                                    gravity: 'top',
                                    position: 'left',
                                    backgroundColor: 'linear-gradient(to right, #EB3349 0%, #F45C43  100%)',
                                    onClick: () => {
                                    }
                                }).showToast();
                            });
                        });
                    }
                );
            }).catch(err => {
                console.log('error: ', err);
            });
        })
        .on('/sentiment', (props) => {
            let dataset = {
                name: 'دیتاست سنتیمنت',
                description: 'جملات نیازمند برچسب زده شدن'
            };
            let {name, description} = dataset;

            let data = {
                "items": [
                    {
                        "id": 0,
                        "text": "از نظر کیفی عالی",
                        "field": "خرده فروشی",
                        "source": "دیجی کالا"
                    },
                    {
                        "id": 1,
                        "text": "بسیار با کیفیت",
                        "field": "خرده فروشی",
                        "source": "دیجی کالا"
                    },
                    {
                        "id": 2,
                        "text": "به جز لنز بهبود بارز بعدی را می توان در نمایشگر دید",
                        "field": "خرده فروشی",
                        "source": "دیجی کالا"
                    },
                    {
                        "id": 3,
                        "text": "يک اشکال بزرگ اين گوشي اينه که دوربينش زوم نداره!",
                        "field": "خرده فروشی",
                        "source": "دیجی کالا"
                    },
                    {
                        "id": 4,
                        "text": "چیز برگر شیلا رو واقعا دوست میدارم",
                        "field": "سفارش غذا",
                        "source": "اسنپ فود"
                    },
                    {
                        "id": 5,
                        "text": "در کل کارت راه میندازه بد نی مرد یا حتی زن یکی داشته باشه",
                        "field": "خرده فروشی",
                        "source": "دیجی کالا"
                    },
                    {
                        "id": 6,
                        "text": "تحویل به موقع پیک مودب",
                        "field": "سفارش غذا",
                        "source": "اسنپ فود"
                    },
                    {
                        "id": 7,
                        "text": "اولین بار سنم در حد راهنمایی بود این کتاب رو خوندم. احتمالا چاپ زمان شاه. آخه یادمه عکس روش یه دوشیزه آبوت بدون روسری بود. خیلی با شخصیت داستان حال کرده بودم. دختری محکم و سخت کوش و تا حدی شوخ. بعدها که کارتونش شروع شد ازش خیلی بدم اومد. آبوت توی کارتون دیگه در حد منگول بود. یه دختر بی دست و پای مسخره. به عقیده من شخصیت رو خراب کرده بودن. هیچوقت دیگه کارتونش رو ننشستم که ببینم.",
                        "field": "کتاب فروشی",
                        "source": "خانه کتاب"
                    },
                    {
                        "id": 8,
                        "text": "طرحش خیلی قشنگه و بعد چسبوندن خیلی قشنگ میشه",
                        "field": "خرده فروشی",
                        "source": "دیجی کالا"
                    },
                    {
                        "id": 9,
                        "text": "آقا نظرات پایینی رو نخونید و حدس بزنید",
                        "field": "کتاب فروشی",
                        "source": "خانه کتاب"
                    },
                    {
                        "id": 10,
                        "text": "من تو پیشنهاد ویژه خریدم که به نظرم ارزش این قیمت را هم ندارد ....سایز اون خیلی کوچک هست در حد بچه های ابتدایی.....کیفیت دوختش هم خوب نیست.....من برای همسرم سفارش دادم ولی چون کوچک بود مجبورم خودم استفاده کنم",
                        "field": "خرده فروشی",
                        "source": "دیجی کالا"
                    },
                    {
                        "id": 11,
                        "text": "پولتون رو دور میریزید \nوقتی رمش ۱ باشه حافظه اش ۸ باشه \nحتی 4G نیست\"",
                        "field": "خرده فروشی",
                        "source": "دیجی کالا"
                    },
                    {
                        "id": 12,
                        "text": "ممنون از دیجیکالا برای برگشت کالا.... انتظار داشتم یک باتری مناسب مجدد برای من ارسال بشه که نشد!\nبه 50% می رسید گوشیم خاموش میشد.\nباز هم ممنون از دیجیکالا.",
                        "field": "خرده فروشی",
                        "source": "دیجی کالا"
                    },
                    {
                        "id": 13,
                        "text": "ممنون محمد اقا حالا کدوم بهتره قیمت هر کدوم چنده خودت کدمو داری ازش راضی هستی؟",
                        "field": "خرده فروشی",
                        "source": "دیجی کالا"
                    },
                    {
                        "id": 14,
                        "text": "مانند سایر دوربین های مشابه ، Ixus 240 HS همچنین دارای یک دوربین عکس نشانه ای است که اساساً در حالت اتوماتیک کار می کند.",
                        "field": "خرده فروشی",
                        "source": "دیجی کالا"
                    },
                    {
                        "id": 15,
                        "text": "عالیه❤❤❤",
                        "field": "خرده فروشی",
                        "source": "دیجی کالا"
                    },
                    {
                        "id": 16,
                        "text": "ساندویچ خیلی خوشمزه بود، واقعا نصف ساندویچ بود که احساس کردم سیر شدم، مرسی",
                        "field": "سفارش غذا",
                        "source": "اسنپ فود"
                    },
                    {
                        "id": 17,
                        "text": "نسبت به دفعه پیش کباب طعم جالبی نداشت وبرنج کمی خام بود باتشکر",
                        "field": "سفارش غذا",
                        "source": "اسنپ فود"
                    },
                    {
                        "id": 18,
                        "text": "غذای سرد به من تحویل داده اند",
                        "field": "سفارش غذا",
                        "source": "اسنپ فود"
                    },
                    {
                        "id": 19,
                        "text": "سفارش با دوووو ساعت تاااااخیر رسید افتضاااااااح تو گرمای تابستون غذای یخ دادن بسته بندی افتضاح هرچی روغن بود ریخته بود داخل نایلکس بسته بندی سوخاری پاره شده بود سوخاری ریخته بود بیرون پیتزا هم که کلا سفت و لاستیک و یخ بووود و پیک یه عذر خواهی کوچک هم نکرد از طرف رستوووران در یک کلام ضعیف ضعیف ضعیف",
                        "field": "سفارش غذا",
                        "source": "اسنپ فود"
                    },
                    {
                        "id": 20,
                        "text": "این هتل واقعا قابل قیاس با هتلهای ۵ستاره لوکس در ایران میباشدبا تشکر از کلیه کارکنان وارزوی ادامه وضعیت موجود در اینده",
                        "field": "گردشگری",
                        "source": "هتل و رستوران"
                    }
                ]
            };

            data.datasetId = props.dataset;
            data.datasetName = name;
            data.datasetDesc = description;

            import('@pages/Sentiment').then(m => {
                body.className = "questions";
                body.style = "display: flex; align-items: center;height: 100%;";
                document.documentElement.style.height = '100%';
                draw(m, data, body)
            });
        })
        .on('/session', () => {
            myAxios.get(Config.getCurrentSession, {}).then(session => {
                console.log(session);
            }).catch(err => console.log(err));
        })
        .on('/goldens/:dataset', (props) => currectGoldens(props))
        .listen();

    Store.listen('token', (value, oldValue) => {
        if (value !== oldValue) {
            console.log(`Token has changed to ${value}!`);
        }
    });
}

function makeDOM(props) {
    elem = App(props);
    main = elem._main;
    let prev = root.firstElementChild;

    if (prev) {
        root.replaceChild(elem, prev);
    } else {
        root.appendChild(elem);
    }

    let oldCanvas = document.getElementById('pobel-animated-canvas');
    if (oldCanvas)
        document.documentElement.removeChild(oldCanvas);
}

function draw(m, props, element = main) {
    if (!element) {
        makeDOM();
        element = main;
    }

    m = m.default || m;
    props = props || {};

    element.innerHTML = '';
    if (element.firstElementChild) {
        element.removeChild(element.firstElementChild);
    }
    element.appendChild(m(props));
}

function getRandomLabel(datasetId, count = 1) {
    return new Promise((resolve, reject) => {
        myAxios.get(Config.baseUrl + Config.getRandomLabel, {
            params: {
                datasetId: datasetId,
                count: count
            },
            headers: {
                authorization: `Bearer ${Store.get('token')}`
            }
        }).then(labels => {
            let data = labels.data;
            resolve(data);
        }).catch(err => {
            console.log('error: ', err);

            Toastify({
                text: err.data.error.message,
                duration: 5000,
                gravity: 'top',
                position: 'left',
                backgroundColor: 'linear-gradient(to right, #EB3349 0%, #F45C43  100%)',
                onClick: () => {
                    window.location.href = '/dataset/' + props.dataset;
                }
            }).showToast();
            reject(err);
        });
    });
}

function currectGoldens(props) {
    myAxios.get(Config.getDataset, {
        params: {
            Id: props.dataset
        }
    }).then(result => {
        let dataset = result.data.result;
        let {name, description} = dataset;

        myAxios.get(Config.getAllDatasetItems, {
            params: {
                dataSetId: props.dataset,
                isGoldenData: true,
                onlyNonDecidedGoldens: true,
                maxResultCount: 1
            }
        }).then(result => {
            if(!result.data.result.items.length) {
                window.location.href = '/temp';
                return;
            }

            let data = result.data;

            data.datasetId = props.dataset;
            data.datasetName = name;
            data.datasetDesc = description;

            import('@pages/Golden').then(m => {
                body.className = "questions goldens";
                body.style = "display: flex; align-items: center;height: 100%;";
                document.documentElement.style.height = '100%';
                draw(m, data, body)
            });
        }).catch(err => {
            console.log('error: ', err);
        });

    }).catch(err => {
        console.log('error: ', err);
    });
}

function getWalletCredit() {
    myAxios.get(Config.getCredit, {
        params: {
            userId: Store.get('user'),
            datasetId: '10b16b1a-5945-422f-c83b-08d8695976c6'
        }
    }).then(credit => {
        let data = credit.data;
        console.log('Wallet Credit is: ', data);
    }).catch(err => {
        console.log('error: ', err);
    });
}

function setTarget() {
    myAxios.post(Config.baseUrl + Config.setTarget, {
            answerCount: 10
        },
        {
            headers: {
                authorization: `Bearer ${Store.get('token')}`
            }
        }).then(target => {
        let data = target.data;
    }).catch(err => {
        console.log('error: ', err);
    });
}

function getTarget(props) {
    myAxios.get(Config.baseUrl + Config.getTarget, {
        params: {
            Id: props.id
        },
        headers: {
            authorization: `Bearer ${Store.get('token')}`
        }
    }).then(target => {
        let data = target.data;
    }).catch(err => {
        console.log('error: ', err);
    });
}

function getAllTargets() {
    myAxios.get(Config.baseUrl + Config.getAllTargets, {
        headers: {
            authorization: `Bearer ${Store.get('token')}`
        }
    }).then(target => {
        let data = target.data;
    }).catch(err => {
        console.log('error: ', err);
    });
}

function getBalance(props) {
    console.log('Get Balance');
    myAxios.get(Config.baseUrl + Config.getBalance, {
        params: {
            ownerId: Store.get('user')
        },
        headers: {
            authorization: `Bearer ${Store.get('token')}`
        }
    }).then(target => {
        let data = target.data;
        console.log('Account Balance is: ', data);
    }).catch(err => {
        console.log('error: ', err);
    });
}

function getAllAnswers() {
    myAxios.get(Config.baseUrl + Config.getAllAnswers, {
        params: {
            datasetId: '4df650d8-9904-4f4a-6428-08d8530f3b9a',
            userId: '7',
            //     from: ,
            //     to: ,
            //     sorting: 'asc'
        },
        headers: {
            authorization: `Bearer ${Store.get('token')}`
        }
    }).then(answers => {
        let data = answers.data;
        console.log('Transactions are: ', data);
    }).catch(err => {
        console.log('error: ', err);
    });
}

function getAllUsers() {
    console.log('Get All Users');
    myAxios.get(Config.baseUrl + Config.getAllUsers, {
        headers: {
            authorization: `Bearer ${Store.get('token')}`
        }
    }).then(users => {
        let data = users.data;
        console.log('Users are: ', data);
    }).catch(err => {
        console.log('error: ', err);
    });
}

function getUserProfile(props) {
    myAxios.get(Config.baseUrl + Config.getUser, {
        params: {
            id: props.id
        },
        headers: {
            authorization: `Bearer ${Store.get('token')}`
        }
    }).then(user => {
        let data = user.data;
    }).catch(err => {
        console.log('error: ', err);
    });
}

function getUserRoles() {
    myAxios.get(Config.baseUrl + Config.getUserRoles, {
        headers: {
            authorization: `Bearer ${Store.get('token')}`
        }
    }).then(roles => {
        let data = roles.data;
    }).catch(err => {
        console.log('error: ', err);
    });
}

function loadDatasets() {
    makeDOM();

    myAxios.get(Config.getAllDatasets, {}).then(datasets => {
        let data = datasets.data;

        data.result.items.forEach((item, index) => {
            item.answerBudgetCountPerUser = item.answerBudgetCountPerUser.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        });

        import('@pages/Datasets').then(m => {
                m = m.default || m;
                let htmlContent = Mustache.render(m(data.result.items), data.result);
                main.innerHTML = htmlContent;

                // (function (w) {
                //     var canvas, ctx;
                //     var mouse = {
                //         x: 0,
                //         y: 0,
                //         px: 0,
                //         py: 0,
                //         down: false
                //     };
                //     var canvas_width = Math.ceil(document.querySelector('header').clientWidth / 100) * 100;
                //     var canvas_height = Math.ceil(document.querySelector('header').clientHeight / 100) * 100;
                //
                //     var resolution = 100;
                //     var pen_size = 100;
                //     var num_cols = canvas_width / resolution;
                //     var num_rows = canvas_height / resolution;
                //     var speck_count = 5000;
                //     var vec_cells = [];
                //     var particles = [];
                //
                //     function init() {
                //         canvas = document.createElement('canvas');
                //         canvas.setAttribute('id', 'pobel-animated-canvas');
                //         document.querySelector('#app').childNodes[0].prepend(canvas);
                //
                //         let pobelApp = document.querySelector('#app');
                //
                //         ctx = canvas.getContext("2d");
                //         canvas.width = canvas_width;
                //         canvas.height = canvas_height;
                //         for (let i = 0; i < speck_count; i++) {
                //             particles.push(new particle(Math.random() * canvas_width, Math.random() * canvas_height));
                //         }
                //         for (let col = 0; col < num_cols; col++) {
                //             vec_cells[col] = [];
                //             for (let row = 0; row < num_rows; row++) {
                //                 var cell_data = new cell(col * resolution, row * resolution, resolution)
                //                 vec_cells[col][row] = cell_data;
                //                 vec_cells[col][row].col = col;
                //                 vec_cells[col][row].row = row;
                //             }
                //         }
                //         for (let col = 0; col < num_cols; col++) {
                //             for (let row = 0; row < num_rows; row++) {
                //                 var cell_data = vec_cells[col][row];
                //                 var row_up = (row - 1 >= 0) ? row - 1 : num_rows - 1;
                //                 var col_left = (col - 1 >= 0) ? col - 1 : num_cols - 1;
                //                 var col_right = (col + 1 < num_cols) ? col + 1 : 0;
                //                 var up = vec_cells[col][row_up];
                //                 var left = vec_cells[col_left][row];
                //                 var up_left = vec_cells[col_left][row_up];
                //                 var up_right = vec_cells[col_right][row_up];
                //                 cell_data.up = up;
                //                 cell_data.left = left;
                //                 cell_data.up_left = up_left;
                //                 cell_data.up_right = up_right;
                //                 up.down = vec_cells[col][row];
                //                 left.right = vec_cells[col][row];
                //                 up_left.down_right = vec_cells[col][row];
                //                 up_right.down_left = vec_cells[col][row];
                //             }
                //         }
                //         w.addEventListener("mousedown", mouse_down_handler);
                //         w.addEventListener("touchstart", mouse_down_handler);
                //         w.addEventListener("mouseup", mouse_up_handler);
                //         w.addEventListener("touchend", touch_end_handler);
                //         // canvas.addEventListener("mousemove", mouse_move_handler);
                //         pobelApp.addEventListener("mousemove", mouse_move_handler);
                //         pobelApp.addEventListener("touchmove", touch_move_handler);
                //         // canvas.addEventListener("touchmove", touch_move_handler);
                //         // w.onload = draw;
                //         draw();
                //     }
                //
                //     function update_particle() {
                //         for (let i = 0; i < particles.length; i++) {
                //             var p = particles[i];
                //             if (p.x >= 0 && p.x < canvas_width && p.y >= 0 && p.y < canvas_height) {
                //                 var col = parseInt(p.x / resolution);
                //                 var row = parseInt(p.y / resolution);
                //                 var cell_data = vec_cells[col][row];
                //                 var ax = (p.x % resolution) / resolution;
                //                 var ay = (p.y % resolution) / resolution;
                //                 p.xv += (1 - ax) * cell_data.xv * 0.05;
                //                 p.yv += (1 - ay) * cell_data.yv * 0.05;
                //                 p.xv += ax * cell_data.right.xv * 0.05;
                //                 p.yv += ax * cell_data.right.yv * 0.05;
                //                 p.xv += ay * cell_data.down.xv * 0.05;
                //                 p.yv += ay * cell_data.down.yv * 0.05;
                //                 p.x += p.xv;
                //                 p.y += p.yv;
                //                 var dx = p.px - p.x;
                //                 var dy = p.py - p.y;
                //                 var dist = Math.sqrt(dx * dx + dy * dy);
                //                 var limit = Math.random() * 0.5;
                //                 if (dist > limit) {
                //                     ctx.lineWidth = 1;
                //                     ctx.beginPath();
                //                     ctx.moveTo(p.x, p.y);
                //                     ctx.lineTo(p.px, p.py);
                //                     ctx.stroke();
                //                 } else {
                //                     ctx.beginPath();
                //                     ctx.moveTo(p.x, p.y);
                //                     ctx.lineTo(p.x + limit, p.y + limit);
                //                     ctx.stroke();
                //                 }
                //                 p.px = p.x;
                //                 p.py = p.y;
                //             } else {
                //                 p.x = p.px = Math.random() * canvas_width;
                //                 p.y = p.py = Math.random() * canvas_height;
                //                 p.xv = 0;
                //                 p.yv = 0;
                //             }
                //             p.xv *= 0.5;
                //             p.yv *= 0.5;
                //         }
                //     }
                //
                //     function draw() {
                //         var mouse_xv = mouse.x - mouse.px;
                //         var mouse_yv = mouse.y - mouse.py;
                //         for (let i = 0; i < vec_cells.length; i++) {
                //             var cell_datas = vec_cells[i];
                //             for (let j = 0; j < cell_datas.length; j++) {
                //                 var cell_data = cell_datas[j];
                //                 if (mouse.down) {
                //                     change_cell_velocity(cell_data, mouse_xv, mouse_yv, pen_size);
                //                 }
                //                 update_pressure(cell_data);
                //             }
                //         }
                //         ctx.clearRect(0, 0, canvas.width, canvas.height);
                //         ctx.strokeStyle = "#ff639c";
                //         update_particle();
                //         for (let i = 0; i < vec_cells.length; i++) {
                //             var cell_datas = vec_cells[i];
                //             for (let j = 0; j < cell_datas.length; j++) {
                //                 var cell_data = cell_datas[j];
                //                 update_velocity(cell_data);
                //             }
                //         }
                //         mouse.px = mouse.x;
                //         mouse.py = mouse.y;
                //
                //         requestAnimationFrame(draw);
                //     }
                //
                //     function change_cell_velocity(cell_data, mvelX, mvelY, pen_size) {
                //         var dx = cell_data.x - mouse.x;
                //         var dy = cell_data.y - mouse.y;
                //         var dist = Math.sqrt(dy * dy + dx * dx);
                //         if (dist < pen_size) {
                //             if (dist < 4) {
                //                 dist = pen_size;
                //             }
                //             var power = pen_size / dist;
                //             cell_data.xv += mvelX * power * 0.4;
                //             cell_data.yv += mvelY * power * 0.4;
                //         }
                //     }
                //
                //     function update_pressure(cell_data) {
                //         var pressure_x = (cell_data.up_left.xv * 0.5 //Divided in half because it's diagonal
                //             + cell_data.left.xv + cell_data.down_left.xv * 0.5 //Same
                //             - cell_data.up_right.xv * 0.5 //Same
                //             - cell_data.right.xv - cell_data.down_right.xv * 0.5 //Same
                //         );
                //         var pressure_y = (cell_data.up_left.yv * 0.5 + cell_data.up.yv + cell_data.up_right.yv * 0.5 - cell_data.down_left.yv * 0.5 - cell_data.down.yv - cell_data.down_right.yv * 0.5);
                //         cell_data.pressure = (pressure_x + pressure_y) * 0.25;
                //     }
                //
                //     function update_velocity(cell_data) {
                //         cell_data.xv += (cell_data.up_left.pressure * 0.5 + cell_data.left.pressure + cell_data.down_left.pressure * 0.5 - cell_data.up_right.pressure * 0.5 - cell_data.right.pressure - cell_data.down_right.pressure * 0.5) * 0.25;
                //         //This does the same for the Y axis.
                //         cell_data.yv += (cell_data.up_left.pressure * 0.5 + cell_data.up.pressure + cell_data.up_right.pressure * 0.5 - cell_data.down_left.pressure * 0.5 - cell_data.down.pressure - cell_data.down_right.pressure * 0.5) * 0.25;
                //
                //         cell_data.xv *= .97;
                //         cell_data.yv *= .97;
                //     }
                //
                //     //This function is used to create a cell object.
                //     function cell(x, y, res) {
                //         //This stores the position to place the cell on the canvas
                //         this.x = x;
                //         this.y = y;
                //         //This is the width and height of the cell
                //         this.r = res;
                //         //These are the attributes that will hold the row and column values
                //         this.col = 0;
                //         this.row = 0;
                //         //This stores the cell's velocity
                //         this.xv = 0;
                //         this.yv = 0;
                //         this.pressure = 0;
                //     }
                //
                //     function particle(x, y) {
                //         this.x = this.px = x;
                //         this.y = this.py = y;
                //         this.xv = this.yv = 0;
                //     }
                //
                //     function mouse_down_handler(e) {
                //         e.preventDefault();
                //         mouse.down = true;
                //     }
                //
                //     function mouse_up_handler() {
                //         mouse.down = false;
                //     }
                //
                //     function touch_end_handler(e) {
                //         if (!e.touches) mouse.down = false;
                //     }
                //
                //     function mouse_move_handler(e) {
                //         // mouse.down = true;
                //         mouse.px = mouse.x;
                //         mouse.py = mouse.y;
                //         mouse.x = e.offsetX + 235 || e.layerX;
                //         mouse.y = e.offsetY + 230 || e.layerY;
                //     }
                //
                //     function touch_move_handler(e) {
                //         mouse.px = mouse.x;
                //         mouse.py = mouse.y;
                //         var rect = canvas.getBoundingClientRect();
                //         mouse.x = e.touches[0].pageX - rect.left;
                //         mouse.y = e.touches[0].pageY - rect.top;
                //     }
                //
                //     w.Fluid = {
                //         initialize: init
                //     }
                // }(window));
                // window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
                // Fluid.initialize();
            }
        );
    }).catch(err => {
        console.log('error: ', err);
    });
}

function loadDashboard() {
    makeDOM();

    myAxios.get(Config.getUser, {
        params: {
            id: Store.get('user')
        }
    }).then(result => {
        let user = result.data.result;
        user.creationTime = moment(user.creationTime, 'YYYY/MM/DD').locale('fa').format('YYYY/MM/DD');
        localStorage.setItem('userObject', JSON.stringify(user));
        Store.update('userObject', user);
        if (document.getElementById('user-name'))
            document.getElementById('user-name').innerText = user.name;
        import('@pages/Dashboard').then(m => {
                m = m.default || m;
                let htmlContent = Mustache.render(m({
                    user: user
                }), {user: user});

                main.innerHTML = htmlContent;
            }
        );
    }).catch(err => {
        console.log('error: ', err);
    });
}

function loadDataset(props) {
    makeDOM();

    myAxios.get(Config.getDataset, {
        params: {
            Id: props.id
        }
    }).then(result => {
        let dataset = result.data.result;

        let datasetId = dataset.id;
        dataset.creationTime = moment(dataset.creationTime, 'YYYY/MM/DD').locale('fa').format('YYYY/MM/DD');

        import('@pages/Dataset').then(m => {
                m = m.default || m;
                let htmlContent = Mustache.render(m({
                    datasetId: datasetId,
                    maxTargetSize: dataset.answerBudgetCountPerUser,
                    datasetType: dataset.type,
                    labelingStatus: dataset.labelingStatus
                }), {dataset: dataset});

                main.innerHTML = htmlContent;

                const wobble = new Wobble(document.getElementById('wobbling-bg'), `white`);

                function loop() {
                    wobble.c.clearRect(0, 0, wobble.canvas.width, wobble.canvas.height);
                    wobble.update();
                    window.requestAnimationFrame(loop);
                }

                loop();
            }
        );
    }).catch(err => {
        console.log('error: ', err);
    });
}

function getFileItem(props) {
    makeDOM();

    myAxios.get(Config.baseUrl + Config.getFile + `/${props.id}`, {
        responseType: 'blob',
        headers: {
            authorization: `Bearer ${Store.get('token')}`
        }
    }).then(result => {
        let blob = new Blob([result.data], {type: 'image/jpg'});
        let image = document.createElement('img');
        image.src = URL.createObjectURL(blob);
        main.appendChild(image);
        return image;
    }).catch(err => {
        console.log('error: ', err);
    });
}

function startDatasetLabeling(props) {
    myAxios.get(Config.getDataset, {
        params: {
            Id: props.dataset
        }
    }).then(result => {
        let dataset = result.data.result;
        let {name, description} = dataset;

        if (props.type == 'linear') {
            myAxios.get(Config.getQuestions, {
                params: {
                    DataSetId: props.dataset,
                    Count: 7
                }
            }).then(result => {
                let data = result.data;

                data.datasetId = props.dataset;
                data.datasetName = name;
                data.datasetDesc = description;

                import('@pages/Question').then(m => {
                    body.className = "questions";
                    body.style = "display: flex; align-items: center;height: 100%;";
                    document.documentElement.style.height = '100%';
                    draw(m, data, body)
                });
            }).catch(err => {
                console.log('error: ', err);
                Toastify({
                    text: err.data.error.message,
                    duration: 5000,
                    gravity: 'top',
                    position: 'left',
                    backgroundColor: 'linear-gradient(to right, #EB3349 0%, #F45C43  100%)',
                    onClick: () => {
                        window.location.href = '/dataset/' + props.dataset;
                    }
                }).showToast();
            });
        } else if (props.type == 'grid') {
            getRandomLabel(props.dataset, 1).then((label) => {
                myAxios.get(Config.getQuestions, {
                    params: {
                        DataSetId: props.dataset,
                        Count: 9,
                        LabelId: label.result[0].id,

                    }
                }).then(result => {
                    let data = result.data;
                    myAxios.get(Config.getDatasetItem, {
                        params: {
                            id: data.result[0].datasetItemId
                        }
                    }).then(datasetItem => {
                        let fieldName = datasetItem.data.result.filePath;
                        fieldName = fieldName.split('\\')[4];
                        switch (fieldName) {
                            case 'Actors':
                                data.fieldName = 'بازیگر';
                                break;

                            case 'Singers':
                                data.fieldName = 'خواننده';
                                break;

                            case 'Politicians':
                                data.fieldName = 'سیاست مدار';
                                break;
                        }

                        data.label = label.result[0].name.replace(/[0-9]/g, '').replace(/_/g, ' ');
                        data.datasetId = props.dataset;
                        data.datasetName = name;
                        data.datasetDesc = description;

                        import('@pages/Grid').then(m => {
                            body.className = "questions";
                            body.style = "display: flex; align-items: center;height: 100%;";
                            document.documentElement.style.height = '100%';
                            draw(m, data, body);
                        });
                    }).catch(err => {
                        console.log('error', err)
                    });
                }).catch(err => {
                    console.log('error: ', err);

                    Toastify({
                        text: err.data.error.message,
                        duration: 5000,
                        gravity: 'top',
                        position: 'left',
                        backgroundColor: 'linear-gradient(to right, #EB3349 0%, #F45C43  100%)',
                        onClick: () => {
                            window.location.href = '/dataset/' + props.dataset;
                        }
                    }).showToast();
                });
            }).catch((err) => {
                console.log('error:', err);
            });
        }
    }).catch(err => {
        console.log('error: ', err);
    });
}

function showQuestion(props) {
    myAxios.get(Config.baseUrl + Config.getQuestion, {
        params: {
            DataSetId: props.dataset,
            DataSetItemId: props.datasetItem
        },
        headers: {
            authorization: `Bearer ${Store.get('token')}`
        }
    }).then(result => {
        let data = result.data;
        import('@pages/Question').then(m => {
            body.className = "questions";
            body.style = "display: flex; align-items: center;";
            draw(m, data, body)
        });
    }).catch(err => {
        console.log('error: ', err);
    });
}

function showQuestions(props) {
    myAxios.get(Config.baseUrl + Config.getQuestions, {
        params: {
            DataSetId: props.dataset,
            Count: 10
        },
        headers: {
            authorization: `Bearer ${Store.get('token')}`
        }
    }).then(result => {
        let data = result.data;
        import('@pages/Question').then(m => {
            body.className = "questions";
            body.style = "display: flex; align-items: center;";
            draw(m, data, body)
        });
    }).catch(err => {
        console.log('error: ', err);
    });
}

function animate(elem, style, unit, from, to, time, prop) {
    if (!elem) {
        return;
    }
    var start = new Date().getTime(),
        timer = setInterval(function () {
            var step = Math.min(1, (new Date().getTime() - start) / time);
            if (prop) {
                elem[style] = (from + step * (to - from)) + unit;
            } else {
                elem.style[style] = (from + step * (to - from)) + unit;
            }
            if (step === 1) {
                clearInterval(timer);
            }
        }, 25);
    if (prop) {
        elem[style] = from + unit;
    } else {
        elem.style[style] = from + unit;
    }
}

init();

if (process.env.NODE_ENV === 'development' && module.hot) {
    module.hot.accept('@components/App', New => {
        New = require('@components/App').default;
        root.removeChild(elem);
        elem = root.appendChild(New());
        main = elem._main;
    });
} else if (process.env.NODE_ENV === 'production') {
    console.log('🙈 🙉 🙊');
}
