import myAxios from "../../config/axios";
import Config from "../../config";

export default function (props) {
    return `
        <div class="contact-us-map" id="map">
            <div class="container">
                <div class="row contact-us">
                    <div class="col-6 info">
                        <h3>تماس با ما</h3>
                        <ul>
                            <li>تهران، پردیس، پارک فناوری پردیس، نوآوری 11، پلاک 114، شرکت فناوری اطلاعات و ارتباطات پاسارگاد آریان (فناپ)</li>
                            <li>کد پستی: 1654120840</li>
                            <li>شماره تماس: 7-02176250513</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>       
    `;
}