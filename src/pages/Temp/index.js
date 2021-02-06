import "toastify-js/src/toastify.css";

export default function () {
    var template = `
        <div class="container datasets-wrapper" style="margin-top: -110px;">
            <div class="row">
                <div class="row header">
                    <div class="col-12-sm back-btn-wrapper">
                        <button class="back-btn" onclick="window.location.href='/'" style="box-shadow: none"> 🡠 </button>
                    </div>                   
                </div>
                
                <div class="row">
                    <div class="col-6-sm dataset-list-name">
                        <select name="" id="chooseDataset" class="form-control select">
                            <option value="">دیتاست مورد نظر خود را انتخاب کنید.</option>
                            {{#datasets}}
                            <option value="{{id}}">{{name}}</option>
                            {{/datasets}}
                        </select>
                    </div>
                    
                    <div class="col-6-sm dataset-target-definitions">
                        <select name="" id="chooseTargetDefinition" class="form-control select">
                        </select>
                    </div>
                </div>
                
                <div class="row dataset-history" id="dataset-updater">
                    <div class="col-4-sm">
                        <label for="dataset-t">T</label>
                        <input type="number" class="form-control" value="" id="dataset-t" placeholder="T" step="0.0001" max="1" min="0">
                        
                        <label for="dataset-bonusFalse">Bonus False</label>
                        <input type="number" class="form-control" value="" id="dataset-bonusFalse" placeholder="Bonus False" step="0.0001" min="0">
                        
                        <p style="float: right; margin-right: 0px; margin-top: 17px;" id="allQuestionsCount"></p>
                    </div>
                    
                    <div class="col-4-sm">                    
                        <label for="dataset-umax">μmax</label>
                        <input type="number" class="form-control" value="" id="dataset-umax" placeholder="μmax" step="1" min="0">
                        
                        <label for="dataset-umin">μmin</label>
                        <input type="number" class="form-control" value="" id="dataset-umin" placeholder="μmin" step="1" min="0">
                        
                    </div>
                        
                    <div class="col-4-sm">
                        <label for="dataset-AnswerBudgetCountPerUser">Answer Count</label>
                        <input type="number" class="form-control" value="" id="dataset-AnswerBudgetCountPerUser" placeholder="Answer Count" step="1" min="0">
                       
                        <label for="dataset-goldenCount">Golden Answers Count</label>
                        <input type="number" class="form-control" value="" id="dataset-goldenCount" placeholder="Golden Count" step="1" min="0">
                        
                        <input type="hidden" class="form-control" id="dataset-id">
                        <button href="#" class="contribute-btn golden" id="update-dataset-goldens" style="display: none;float: left; margin-left: 10px; margin-top: 10px;" data-id="">Goldens</button>
                        <button href="#" class="contribute-btn" id="submit-dataset-update" style="float: left; margin-left: 0px; margin-top: 10px;" data-id="">اعمال</button>
                    </div>
                </div>
                
                <div class="row col-12">
                    <br>
                </div>
            </div>
        </div>
    `;

    return template;
}
