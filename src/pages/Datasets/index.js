import myAxios from "../../config/axios";
import Config from "../../config";
import Store from "../../store";

function getAllDataOfDatasets(datasets) {
    datasets.forEach(v => {
        myAxios.get(Config.getAllDatasetItems, {
            params: {
                DataSetId: v.id
            }
        }).then(ds => {
            myAxios.get(Config.getAllTargets, {
                params: {
                    datasetId: v.id,
                    ownerId: Store.get('user'),
                    order: 'DESC',
                    maxResultCount: 1
                }
            }).then(target => {
                if (target.data.result.totalCount) {
                    document.getElementById(`ds-${v.id}`).classList.remove('loading');

                    if(v.labelingStatus) {
                        // document.getElementById(`ds-${v.id}`).innerHTML = `
                        //     <div class="col-6">
                        //         <a href="/labeling/linear/${v.id}" class="start-btn">خطی</a>
                        //     </div>
                        //
                        //     <div class="col-6">
                        //         <a href="/labeling/grid/${v.id}" class="start-btn">گرید</a>
                        //     </div>`;


                        document.getElementById(`ds-${v.id}`).innerHTML = `
                            <div class="col-12">
                                <a href="/labeling/grid/${v.id}" class="start-btn">شروع</a>
                            </div>`;
                    } else {
                        document.getElementById(`ds-${v.id}`).innerHTML = `
                            <div class="col-12">
                                <a href="" class="start-btn disabled">غیرفعال است</a>
                            </div>`;
                    }

                    myAxios.get(Config.getTargetDefinition, {
                        params: {
                            id: target.data.result.items[0].targetDefinitionId,
                        }
                    }).then(targetDefinition => {
                        let targetSize = (targetDefinition.data.result) ? targetDefinition.data.result.answerCount : '0';

                        myAxios.post(Config.getAnswersStats, {
                            dataSetId: v.id,
                            UserId: Store.get('user')
                        }).then(stats => {
                            let answerscount = stats.data.result.totalCount;
                            document.getElementById(`ds-ur-answers-${v.id}`).innerHTML = `<strong>${answerscount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</strong>/${targetSize.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
                        }).catch((err) => {
                            console.log('error', err);
                        });
                    }).catch((err) => {
                        console.log('error', err);
                    });
                } else {
                    document.getElementById(`ds-ur-answers-${v.id}`).innerHTML = `<strong>0</strong>/0`;

                    document.getElementById(`ds-${v.id}`).classList.remove('loading');
                    if(v.labelingStatus) {
                        document.getElementById(`ds-${v.id}`).innerHTML = `
                            <div class="col-12">
                                <a href="/dataset/${v.id}" class="start-btn">هدف‌گذاری کنید</a>
                            </div>`;
                    } else {
                        document.getElementById(`ds-${v.id}`).innerHTML = `
                            <div class="col-12">
                                <a href="" class="start-btn disabled">غیرفعال است</a>
                            </div>
                        `;
                    }
                }
            }).catch((err) => {
                console.log('error', err);
            });

            // Dataset Cover
            myAxios.get(Config.getAllDatasetItems, {
                params: {
                    DataSetId: v.id,
                    SkipCount: Math.floor(Math.random() * ds.data.result.totalCount),
                    MaxResultCount: 1
                }
            }).then(cover => {
                myAxios.get(Config.getFile + `/${cover.data.result.items[0].id}`, {
                    responseType: 'blob'
                }).then(result => {
                    let blob = new Blob([result.data], {type: 'image/jpg'});
                    let avatar = URL.createObjectURL(blob);
                    let listItem = document.getElementById(`ds-cover-${v.id}`);
                    listItem.style.backgroundImage = `url(${avatar})`;
                }).catch(err => {
                    console.log('error: ', err);
                });
            }).catch((err) => {
                console.log('error', err);
            });

            // Dataset Credit
            myAxios.get(Config.getCredit, {
                params: {
                    userId: Store.get('user'),
                    dataSetId: v.id
                }
            }).then(res => {
                let data = res.data;
                document.getElementById('ds-credit-' + v.id).innerHTML = data.result.credit.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }).catch(err => {
                console.log('error', err);
            });
        }).catch((err) => {
            console.log('error', err);
        });
    });
}

export default function (props) {
    getAllDataOfDatasets(props);

    var template = `
    <div class="container datasets-wrapper">
        <div class="row">
            <h2>دیتاست ها</h2>
            <div class="datasets-list">
                {{#items}}
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
                                <p>هدف/<strong>پاسخ</strong><br/><span id="ds-ur-answers-{{id}}">0/0</span></p>
                            </div>
                            <div class="col-6">
                                <p class="left-in-mobile">اعتبار<br/><span id="ds-credit-{{id}}">0</span> تومان</p>
                            </div>
                        </div>
                        
                        <!-- Actions -->
                        <div class="row dataset-actions-list loading" id="ds-{{id}}">
                        </div>
                    </div>
                {{/items}}
            </div>
        </div>
    </div>
`;

    return template;
}
