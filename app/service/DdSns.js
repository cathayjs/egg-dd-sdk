'use strict';

module.exports = app => {

    const DD_CONFIG = app.config.DD_CONFIG;
    const { appId, appSecret } = DD_CONFIG.sso || {};

    /***
     * 扫码appId , appSecret生成地址：http://open-dev.dingtalk.com/#/loginAndShareApp
     * @type {string}
     */

    class DdSns extends app.Service {
        constructor(ctx) {
            super(ctx);
        }

        /*******
         * 获取钉钉开放应用的ACCESS_TOKEN
         * https://open-doc.dingtalk.com/doc2/detail.htm?spm=a219a.7629140.0.0.WiN1vd&treeId=172&articleId=104968&docType=1#s0
         * @returns {string}
         */
        * getToken() {

            app.logger.info(`DdSns: before getToken to Dingding`);

            let result = yield this.app.curl(`https://oapi.dingtalk.com/sns/gettoken?appid=${appId}&appsecret=${appSecret}`, {
                dataType: 'json'
            });
            let resultData = result.data;

            if (resultData.errcode) {
                app.logger.error(`DdSns: getToken error:`, resultData);
                throw new Error(JSON.stringify(resultData));
            }

            app.logger.info(`DdSns: end getToken to Dingding`);

            return resultData.access_token;

        }

        /********
         * 获取用户授权的持久授权码:
         * https://open-doc.dingtalk.com/doc2/detail.htm?spm=a219a.7629140.0.0.WiN1vd&treeId=172&articleId=104968&docType=1#s0
         * @param tmpAuthCode
         * @returns {*}
         */

        * getPersistentCode(tmpAuthCode) {

            let token = yield this.getToken();

            app.logger.info(`DdSns: before getPersistentCode to Dingding`);


            const result = yield this.app.curl(`https://oapi.dingtalk.com/sns/get_persistent_code?access_token=${token}`, {
                method: 'POST',
                contentType: "json",
                dataType: 'json',
                data: {
                    "tmp_auth_code": `${tmpAuthCode}`
                }
            });

            const resultData = result.data;

            if (resultData.errcode) {
                app.logger.error(`DdSns: getPersistentCode error: ${resultData}`);
            }
            app.logger.info(`DdSns: end getPersistentCode to Dingding`);


            return resultData;
        }

        /*****
         * 获取用户授权的SNS_TOKEN
         * https://open-doc.dingtalk.com/doc2/detail.htm?spm=a219a.7629140.0.0.WiN1vd&treeId=172&articleId=104968&docType=1#s0
         * @param persistentCodeOptions
         * @returns {*}
         */
        * getSnsToken(persistentCodeOptions) {

            let token = yield this.getToken();

            app.logger.info(`DdSns: before getSnsToken to Dingding`);

            let result = yield this.app.curl(`https://oapi.dingtalk.com/sns/get_sns_token?access_token=${token}`, {
                method: 'POST',
                contentType: "json",
                dataType: 'json',
                data: {
                    openid: persistentCodeOptions.openid,
                    persistent_code: persistentCodeOptions.persistent_code
                }
            });

            let resultData = result.data;

            if (resultData.errcode) {
                app.logger.error(`DdSns: getSnsToken error: `, resultData);
            }
            app.logger.info(`DdSns: end getSnsToken to Dingding`);

            return resultData.sns_token;
        }

        /*******
         * 获取用户授权的个人信息
         * https://open-doc.dingtalk.com/doc2/detail.htm?spm=a219a.7629140.0.0.WiN1vd&treeId=172&articleId=104968&docType=1#s0
         * @param snsToken
         * @returns {*}
         */
        * getUserInfo(snsToken) {

            app.logger.info(`DdSns: before getUserInfo to Dingding`);
            let result = yield this.app.curl(`https://oapi.dingtalk.com/sns/getuserinfo?sns_token=${snsToken}`, {
                dataType: 'json',
                method: 'GET'
            });

            let resultData = result.data;

            if (resultData.errcode) {
                app.logger.error(`DdSns: getUserInfo error: ${resultData}`, JSON.stringify(resultData));
            }
            app.logger.info(`DdSns: end getUserInfo to Dingding`);

            return resultData.user_info;
        }

        * getUserByPersistentCode(persistentCode) {

            app.logger.info(`DdSns: before getUserByPersistentCode to Dingding`);

            let snsToken = yield this.getSnsToken(persistentCode);

            let userInfo = yield this.getUserInfo(snsToken);

            app.logger.info(`DdSns: end getUserByPersitentCode to Dingding`);

            return userInfo;
        }

    }

    return DdSns;
}
