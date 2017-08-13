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
         * 貌似不支持缓存，文档写的不清楚
         * @returns {string}
         */
        * getToken() {

            app.logger.info(`[service:ddSns:getToken] start`);

            let result = yield this.app.curl(`https://oapi.dingtalk.com/sns/gettoken?appid=${appId}&appsecret=${appSecret}`, {
                dataType: 'json'
            });
            let resultData = result.data;

            if (resultData.errcode) {
                app.logger.error(`[service:ddSns:getToken] error:`, resultData);
            }

            app.logger.info(`[service:ddSns:getToken] end`);

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

            app.logger.info(`[service:ddSns:getPersistentCode] start`);
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
                app.logger.error(`[service:ddSns:getPersistentCode] error: ${resultData}`);
            }
            app.logger.info(`[service:ddSns:getPersistentCode] end`);


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

            app.logger.info(`[service:ddSns:getSnsToken] start`);

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
                app.logger.error(`[service:ddSns:getSnsToken] error: `, resultData);
            }
            app.logger.info(`[service:ddSns:getSnsToken] end`);

            return resultData.sns_token;
        }

        /*******
         * 获取用户授权的个人信息
         * https://open-doc.dingtalk.com/doc2/detail.htm?spm=a219a.7629140.0.0.WiN1vd&treeId=172&articleId=104968&docType=1#s0
         * @param snsToken
         * @returns {*}
         */
        * getUserInfo(snsToken) {
            app.logger.info(`[service:ddSns:getUserInfo] start`);

            let result = yield this.app.curl(`https://oapi.dingtalk.com/sns/getuserinfo?sns_token=${snsToken}`, {
                dataType: 'json',
                method: 'GET'
            });

            let resultData = result.data;

            if (resultData.errcode) {
                app.logger.error(`[service:ddSns:getUserInfo] error: `, resultData);
            }
            app.logger.info(`[service:ddSns:getUserInfo] end`);

            return resultData.user_info;
        }

        * getUserByPersistentCode(persistentCode) {

            app.logger.info(`[service:ddSns:getUserByPersistentCode] start`);

            let snsToken = yield this.getSnsToken(persistentCode);

            let userInfo = yield this.getUserInfo(snsToken);

            app.logger.info(`[service:ddSns:getUserByPersistentCode] end`);

            return userInfo;
        }

    }

    return DdSns;
}
