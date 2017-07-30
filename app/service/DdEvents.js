'use strict';

const utility = require('utility');


module.exports = app => {

    const DD_CONFIG = app.config.DD_CONFIG;
    // https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.RIssni&treeId=385&articleId=104975&docType=1#s2
    class DdEvents extends app.Service {
        constructor(ctx) {
            super(ctx);
        }

        /**
         * 
         * @param events
         */
        * registerEvents(callbackUrl, events = ["user_add_org", "user_modify_org", "user_leave_org"], isUpdate = false) {

            // events = ["user_add_org", "user_modify_org", "user_leave_org", "org_admin_add", "org_admin_remove", "org_dept_create", "org_dept_modify", "org_dept_remove", "org_remove", "label_user_change", "label_conf_add", "label_conf_modify", "label_conf_del", "org_change", "chat_add_member", "chat_remove_member", "chat_quit", "chat_update_owner", "chat_update_title", "chat_disband", "chat_disband_microapp", "check_in", "bpms_task_change", "bpms_instance_change"];

            this.app.logger.info('[ddUser] before registerEvent, isUpdate ', isUpdate);

            let token = yield this.ctx.service.dd.getToken();

            let url = 'https://oapi.dingtalk.com/call_back/register_call_back';
            if (isUpdate) {
                url = 'https://oapi.dingtalk.com/call_back/update_call_back';
            }

            let result = yield this.app.curl(`${url}?access_token=${token}`, {
                dataType: 'json',
                method: 'POST',
                contentType: 'json',
                data: {
                    "call_back_tag": events,
                    "token": DD_CONFIG.token,
                    "aes_key": DD_CONFIG.aesKey,
                    "url": callbackUrl || "http://www.baidu.com"
                }
            });
            let resultData = result.data;

            /* istanbul ignore if */
            if (resultData.errcode) {
                this.app.logger.error('[ddUser] registerEvent error:', resultData)
            }

            this.app.logger.info('[ddUser] after registerEvent:');

            return !resultData.errcode;
        }


        * updateEvents(events) {
            return yield this.registerEvents(events, true);
        }

        * deleteEvents() {

            this.app.logger.info('[ddUser] before deleteEvents:');

            let token = yield this.ctx.service.dd.getToken();

            let result = yield this.app.curl(`https://oapi.dingtalk.com/call_back/delete_call_back?access_token=${token}`, {
                dataType: 'json',
                method: 'GET'
            });
            let resultData = result.data;

            /* istanbul ignore if */
            if (resultData.errcode) {
                this.app.logger.error('[ddUser] deleteEvents error:', resultData);
                throw new Error(JSON.stringify(resultData, null, 4));
            }

            this.app.logger.info('[ddUser] after deleteEvents:');

            return !resultData.errcode;
        }


        * queryEvents() {

            this.app.logger.info('[ddUser] before queryEvents:');

            let token = yield this.ctx.service.dd.getToken();

            let result = yield this.app.curl(`https://oapi.dingtalk.com/call_back/get_call_back?access_token=${token}`, {
                dataType: 'json',
                method: 'GET'
            });
            let resultData = result.data;

            /* istanbul ignore if */
            if (resultData.errcode) {
                this.app.logger.error('[ddUser] queryEvents error:', resultData);
                throw new Error(JSON.stringify(resultData, null, 4));
            }

            this.app.logger.info('[ddUser] after queryEvents:');

            return resultData;
        }


    }
    return DdEvents;
}
