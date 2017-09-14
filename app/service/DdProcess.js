'use strict';

const utility = require('utility');


module.exports = app => {

    class DdProcess extends app.Service {
        constructor(ctx) {
            super(ctx);
        }

        /**********
         * https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.rgrrdz&treeId=355&articleId=29498&docType=2
         */
        * createProcess(options) {
            let token = yield this.ctx.service.dd.getToken();

            let approvers = options.approvers;
            let cc_list = options.cc_list;

            if (Array.isArray(approvers)) {
                approvers = approvers.join(',');
            }
            if (Array.isArray(cc_list)) {
                cc_list = cc_list.join(',');
            }

            let finalData = Object.assign({
                method: 'dingtalk.smartwork.bpms.processinstance.create',
                session: token,
                timestamp: utility.YYYYMMDDHHmmss(),
                v: '2.0',
                format: 'json',
                simplify: true
            }, {
                    process_code: options.process_code,
                    originator_user_id: options.originator_user_id,
                    dept_id: options.dept_id,
                    approvers: approvers,
                    cc_list: cc_list || '',
                    cc_position: options.cc_position || 'START',
                    form_component_values: JSON.stringify(options.form_component_values)
                });

            this.app.logger.info('[service:ddProcess:createProcess] start, data:', finalData);

            // 不需要设置 contentType，HttpClient 会默认以 application/x-www-form-urlencoded 格式发送请求
            let result = yield this.app.curl('https://eco.taobao.com/router/rest', {
                dataType: 'json',
                method: 'POST',
                data: finalData
            });
            let resultData = result.data;

            if (resultData.error_response) {
                this.app.logger.error('[service:ddProcess:createProcess] error1:', resultData);
                throw new Error(JSON.stringify(resultData.error_response));
            }
            resultData = resultData.result;

            if (resultData.ding_open_errcode || !resultData.is_success) {
                this.app.logger.error('[service:ddProcess:createProcess] error2:', resultData);
                throw new Error(JSON.stringify(resultData));
            }

            this.app.logger.info('[service:ddProcess:createProcess] end');

            return resultData.process_instance_id;
        }


        /**********
         * https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.fNHF7j&treeId=355&articleId=29833&docType=2
         */
        * listProcess(options) {

            this.app.logger.info('[service:ddProcess:listProcess] start');

            let token = yield this.ctx.service.dd.getToken();

            let startTime = new Date().getTime();

            startTime -= 30 * 24 * 3600 * 1000;

            let finalData = Object.assign({
                method: 'dingtalk.smartwork.bpms.processinstance.list',
                session: token,
                timestamp: utility.YYYYMMDDHHmmss(),
                v: '2.0',
                format: 'json',
                simplify: true
            }, {
                    process_code: options.process_code,
                    start_time: startTime
                });

            // 不需要设置 contentType，HttpClient 会默认以 application/x-www-form-urlencoded 格式发送请求
            let result = yield this.app.curl('https://eco.taobao.com/router/rest', {
                dataType: 'json',
                method: 'POST',
                data: finalData
            });
            let resultData = result.data;

            if (resultData.error_response) {
                this.app.logger.error('[service:ddProcess:listProcess] error1:', resultData);
            }
            resultData = resultData.result;

            if (resultData.ding_open_errcode) {
                this.app.logger.error('[service:ddProcess:listProcess] error2:', resultData);
            }
            this.app.logger.info('[service:ddProcess:listProcess] end');

            return resultData.result.list;
        }

    }
    return DdProcess;
}
