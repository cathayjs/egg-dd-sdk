'use strict';
const fs = require('fs');
const FormStream = require('formstream');

module.exports = app => {

    /***
 * 所有盯盘相关接口参见：https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.8ltWef&treeId=385&articleId=104970&docType=1
 * @type {string}
 */


    class DdSpace extends app.Service {
        constructor(ctx) {
            super(ctx);
        }

        * upload(filePath = __filename) {

            let token = yield this.ctx.service.dd.getToken();
            let agentId = this.ctx.service.dd._getAgentId();

            const form = new FormStream();

            let stateResult = fs.statSync(filePath);
            let filesize = stateResult.size;

            form.file('media', filePath);

            app.logger.info(`DdSpace: before upload media to space Dingding`);
            let result = yield this.app.curl(`https://oapi.dingtalk.com/file/upload/single?access_token=${token}&agent_id=${agentId}&file_size=${filesize}`, {
                dataType: 'json',
                headers: form.headers(),
                stream: form,
                method: 'POST'
            });

            let resultData = result.data;

            if (resultData.errcode) {
                app.logger.error(`DdSpace:  upload media to space error: `, resultData);
                throw new Error(JSON.stringify(resultData));
            }
            app.logger.info(`DdSpace: end  upload media to space to Dingding`);

            return resultData.media_id;
        }


        * send(mediaId, userId, fileName) {
            let token = yield this.ctx.service.dd.getToken();
            let agentId = this.ctx.service.dd._getAgentId();

            mediaId = encodeURIComponent(mediaId);
            fileName = encodeURIComponent(fileName);

            app.logger.info(`DdSpace: before send media to user to Dingding`);
            let result = yield this.app.curl(`https://oapi.dingtalk.com/cspace/add_to_single_chat?access_token=${token}&agent_id=${agentId}&userid=${userId}&media_id=${mediaId}&file_name=${fileName}`, {
                method: 'POST',
                dataType: 'json'
            });

            let resultData = result.data;

            if (resultData.errcode) {
                app.logger.error(`DdSpace: send media to user error:`, resultData);
                throw new Error(JSON.stringify(resultData));
            }

            app.logger.info(`DdSpace: end send media to user to Dingding`);

            return true;
        }


        /****
         * 未测试
         */
        * send2space(mediaId, userId, fileName) {
            let token = yield this.ctx.service.dd.getToken();
            let agentId = this.ctx.service.dd._getAgentId();

            mediaId = encodeURIComponent(mediaId);
            fileName = encodeURIComponent(fileName);

            app.logger.info(`DdSpace: before send media to user to Dingding`);
            let result = yield this.app.curl(`https://oapi.dingtalk.com/cspace/add?access_token=${token}&agent_id=${agentId}&code=CODE&media_id=MEDIA_ID&space_id=SPACE_ID&folder_id=FOLDER_ID&name=NAME&overwrite=OVERWRITE`, {
                method: 'POST'
            });

            let resultData = result.data;

            if (resultData.errcode) {
                app.logger.error(`DdSpace: send media to user error:`, resultData);
            }
            app.logger.info(`DdSpace: end send media to user to Dingding`);

            return resultData;
        }

    }

    return DdSpace;
}


