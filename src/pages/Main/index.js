import myAxios from "../../config/axios";
import Config from "../../config";
import Store from "../../store";

function getAllDataOfDatasets(datasets) {
    datasets.forEach(v => {
        myAxios.get(Config.getFile + `/${v.randomItemId}`, {
            responseType: 'blob'
        }).then(result => {
            let blob = new Blob([result.data], {type: 'image/jpg'});
            let avatar = URL.createObjectURL(blob);
            let listItem = document.getElementById(`ds-cover-${v.id}`);
            listItem.style.backgroundImage = `url(${avatar})`;
        }).catch(err => {
            console.log('error: ', err);
        });
    });
}

function getScoreboard() {
    if(Store.get('isLoggedIn')) {
        myAxios.get(Config.reportsScoreboard, {
            params: {
                maxResultCount: 10
            }
        }).then(res => {
            let pobelScoreboard = document.getElementById('pobel-scoreboard');

            let data = res.data.result;
            data.forEach(v => {
                let listItem = document.createElement('li');

                let name = document.createElement('span');
                name.classList.add('scoreboard-name');
                name.innerText = `${v.name} ${v.surname}`;

                let score = document.createElement('span');
                score.classList.add('scoreboard-score');
                score.innerText = v.count;

                listItem.appendChild(name);
                listItem.appendChild(score);

                pobelScoreboard.appendChild(listItem);
            })
        }).catch(e => console.log(e));
    }
}

export default function (datasets) {
    getAllDataOfDatasets(datasets);
    getScoreboard();

    return `
        <div class="container home">
            <!-- Section 0 Pobel Intro -->
            <div class="row" id="pobel-intro">
                <div class="col-12">
                    <h1>POBEL</h1>
                    <h2 class="shadow">POBEL</h2>
                    <p>POD's Crowdsourcing Labeling Service</p>
                    <a href="/datasets" class="contribute-btn">شروع مشارکت</a>
                    <br><br><br>
                    <br><br><br>
                    <div id="go-bottom" class="animate__animated animate__bounce animate__infinite animate__slow"><span>↓</span></div>
                </div>
            </div>
        
            <!-- Section 1 Pobel Service -->
            <div class="row pobel-service" id="pobel-service">
                <div class="col-12">
                    <h3>سامانه پابل</h3>
                    <p>
                        <div id="pobel-logo">
                        </div>
                        در راستای شتاب بخشیدن به توسعه فناوریهای نوین، همسو شدن با آینده‌ای هوشمند و ایجاد اشتغال، پابل با این ماموریت بنیان گردید که بستری کارا برای تکمیل یکی از اجزای زمان‌بر و پر هزینه‌ی فرآیند یادگیری ماشین یعنی برچسب‌زنی داده‌ها را ایجاد نماید. تمرکز محوری این بستر بر نقش کلیدی انسان در کمک به ارتقاء سرعت، دقت و کیفیت داده‌های ورودی به الگوریتم‌های هوش مصنوعی است. انسانها در واقع همان کاربران سامانه می‌باشند که با مشارکت موثر در برچسب‌زنی داده‌ها می‌توانند کسب درآمد نمایند. با این وجود، نزدیک کردن رفتار ماشینها به ادراک انسانی، نیازمند آموزش دادن مجموعه عظیمی از داده‌ها است که برچسب زنی آن، مستلزم سپردن این وظیفه بر عهده‌ی جمع کثیری از کاربران می‌باشد که در اصطلاح به آن فعالیت جمع سپاری اطلاق می‌گردد. شما می‌توانید با ایفای نقش مفید در این حوزه ضمن کسب درآمد، در یادگیری بهتر و کارکردی‌تر الگوریتمهای هوش مصنوعی سهیم باشید. تحقق ماموریت پابل کاری نیست که ما به تنهایی بتوانیم آن را انجام دهیم و فقط و فقط از طریق مشارکت تعداد قابل توجهی از شما کاربران گرامی قابل تحقق است.
                    </p>
                </div>
            </div>
            
            <!-- Section 2 Datasets Preview -->
            
            <div class="row" id="pobel-preview-datasets">
                <div class="col-12">
                    <h3>مجموعه داده‌ها</h3>
                    <div class="datasets-list mini">
                        {{#datasets}}
                            <div class="col-4 col-6-sm datasets-list-items">
                                <div class="dataset-cover" id="ds-cover-{{id}}">
                                    {{#labelingStatus}}
                                    <span class="dataset-labeling-status" data-title="وضعیت برچسب زنی فعال است"></span>
                                    {{/labelingStatus}}
                                </div>
                                
                                <a class="title" href="/dataset/{{id}}" data-title="{{name}}">{{name}}</a>
                                <a class="title" href="/dataset/{{id}}"><small data-title="{{description}}">{{description}}</small></a>
                        
                                <div class="row">
                                    <div class="col-6">
                                        <p>کل آیتم‌ها</strong><br/><strong>{{itemsCount}}</strong></p>
                                    </div>
                                    <div class="col-6">
                                        <p class="left-in-mobile">وضعیت<br/><strong>{{#labelingStatus}}فعال{{/labelingStatus}}{{^labelingStatus}}غیرفعال{{/labelingStatus}}</strong></p>
                                    </div>
                                </div>
                                                               
                            </div>
                        {{/datasets}}
                    </div>
                </div>
            </div>
            
            <!-- Section 3 Labeling & Datasets -->
            <div class="row">
                <div class="col-12" id="labeling-datasets">
                    <div id="back-sq-1"></div>
                    <div id="back-sq-2"></div>
                    <h3>برچسب گذاری و مجموعه داده</h3>
                    <p>
                        سیستمها برای شناسایی و درک احساس، تصاویر و صوت نیازمند دریافت تعداد قابل‌توجهی از مصادیق هر یک از این مفاهیم بوده تا با بهره‌گیری از طریق مدلهای هوش مصنوعی، بصورت خودکار یادگیری در تشخیص را کسب نمایند. این یادگیری در صورتی مطلوب خواهد بود که مصادیق مربوطه و یا به اصطلاح داده‌های ورودی به ماشینها از کیفیت و صحت بالایی برخوردار باشند. در این راستا، برچسب گذاری به فرآیند نشانه گذاری داده ها اطلاق می‌گردد که در آن، صحت داده‌های ورودی به ماشینها، توسط هوش انسانی ارزیابی و سپس داده‌های با کیفیت بعنوان ورودی جهت یادگیری ماشینها استفاده می‌شوند. اگر چه هدف برچسب زنی صحت سنجی مصادیق عنوان شده است، اما چگونگی انجام آن بر حسب نوع مجموعه داده (نظیر تصویری، متنی، صوتی و گفتاری) متفاوت می‌باشد.
                    </p>
                    
                    <p>
                        بعنوان نمونه در مجموعه داده‌ از نوع تصویری، منظور از هر برچسب این است که مشخص شود آیا تصویر نمایش داده شده متعلق به فرد مشهور خاصی مثلاً "دکتر محمد قریب" می‌باشد یا خیر؟ پاسخ به این سوال یک برچسب برای تصویر مورد نظر می‌باشد. همچنین برای برچسب زنی یک مجموعه داده برای تحلیل احساسات، کاربر پس از مطالعه یک متن کوتاه نظیر "این فیلم برای همه سنین مناسب است"، می‌بایست استنباط مثبت یا منفی خود را از موضوع مورد بحث مشخص سازد. 
                    </p>
                </div>
            </div>
            
            <!-- Section 4 Pobel Scoreboard -->
            {{#isLoggedIn}}
            <div class="row">
                <div class="col-12">
                    <h3>فعال‌ترین کاربران</h3>
                        
                    <ol id="pobel-scoreboard">
                    </ol>
                </div>
            </div>
            {{/isLoggedIn}}
            
            <!-- Section 5 Pobel Business Model -->
            <div class="row">
                <div class="col-12">
                    <h3>فرآیند کسب درآمد در پابل</h3>
                    
                    <p>
                        فرآیند مشارکت و کسب درآمد در پابل بدین ترتیب می‌باشد که کاربران می‌توانند بطور رایگان در این سامانه ثبت نام نمایند و به مجموعه داده‌های بارگذاری شده توسط راهبر سیستم دسترسی پیدا کنند. در هریک از این مجموعه داده‌ها سوالات متعددی از نوع متنی، تصویری و صوتی وجود دارد، که کاربران، می‌بایست نسبت به برچسب زدن آن‌ها اقدام نمایند. متناسب با کمیت و کیفیت برچسب‌های ثبت شده که توسط رویکردها کنترلی بخصوصی بررسی می‌گردند، کیف پول کاربران به صورت برخط شارژ خواهد شد. 
                    </p>
                </div>
            </div>
            
            <div class="row" id="business-shape-wrapper">
                <div class="col-3 stage-wrappers" id="stage1">
                    <span>1</span>
                    <p>ثبت نام در سامانه</p>
                </div>
                <div class="col-3 stage-wrappers" id="stage2">
                    <span>2</span>
                    <p>انتخاب مجموعه داده مورد نظر</p>
                </div>
                <div class="col-3 stage-wrappers" id="stage3">
                    <span>3</span>
                    <p>برچسب زنی به تعداد هدف تعیین شده</p>
                </div>
                <div class="col-3 stage-wrappers" id="stage4">
                    <span>4</span>
                    <p>مشاهده میزان اعتبار ریالی در پروفایل کاربری</p>
                </div>
            </div>
        </div>       
    `;
}