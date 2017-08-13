'use strict';


module.exports = app => {

    class DdDepartment extends app.Service {
        constructor(ctx) {
            super(ctx);
        }

        // TODO 貌似没有被调用, 是否需要删除
        * getDepartment(departmentId) {

            this.app.logger.info(`[service:ddDepartment:getDepartment] start, departmentId: ${departmentId}`);

            let token = yield this.ctx.service.dd.getToken();
            let result = yield this.app.curl(`https://oapi.dingtalk.com/department/get?access_token=${token}&id=${departmentId}`, {
                dataType: 'json',
                method: 'GET'
            });
            let resultData = result.data;

            if (resultData.errcode) {
                this.app.logger.error(`[service:ddDepartment:getDepartment] error: `, resultData);
                throw new Error(JSON.stringify(resultData));
            }
            this.app.logger.info(`[service:ddDepartment:getDepartment] end`);

            return resultData;
        }


        * getDepartments(parentId = '') {

            this.app.logger.info(`[service:ddDepartment:getDepartments] start, parentId: ${parentId}`);

            let token = yield this.ctx.service.dd.getToken();
            let result = yield this.app.curl(`https://oapi.dingtalk.com/department/list?access_token=${token}&id=${parentId}`, {
                dataType: 'json',
                method: 'GET'
            });

            let resultData = result.data || {};

            if (resultData.errcode) {
                this.app.logger.error(`[service:ddDepartment:getDepartments] error: `, resultData);
                throw new Error(JSON.stringify(resultData));
            }

            let departments = resultData.department;

            this.app.logger.info(`[service:ddDepartment:getDepartments] end`);

            return departments;

        }


        // TODO 未被使用
        * createDepartment(departmentInfo) {

            this.app.logger.info(`[service:ddDepartment:createDepartment] start, departmentInfo: `, departmentInfo);

            let token = yield this.ctx.service.dd.getToken();
            let result = yield this.app.curl(`https://oapi.dingtalk.com/department/create?access_token=${token}`, {
                dataType: 'json',
                contentType: 'json',
                method: 'POST',
                data: departmentInfo
            });

            let resultData = result.data;

            if (resultData.errcode) {
                this.app.logger.error(`[service:ddDepartment:createDepartment] error: `, resultData);
                throw new Error(JSON.stringify(resultData));
            }

            this.app.logger.info(`[service:ddDepartment:createDepartment] end`);

            return resultData;
        }


        /*************
         * https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.W4WlHX&treeId=172&articleId=104979&docType=1#s3
         * @param departmentInfo
         */
        * updateDepartment(departmentInfo) {

            this.app.logger.info(`[service:ddDepartment:updateDepartment] start, updateDepartment: `, departmentInfo);

            let token = yield this.ctx.service.dd.getToken();
            let result = yield this.app.curl(`https://oapi.dingtalk.com/department/update?access_token=${token}`, {
                dataType: 'json',
                contentType: 'json',
                method: 'POST',
                data: departmentInfo
            });

            let resultData = result.data;

            if (resultData.errcode) {
                this.app.logger.error(`[service:ddDepartment:updateDepartment] error: `, resultData);
            }

            this.app.logger.info(`[service:ddDepartment:updateDepartment] end`);

            return resultData;
        }

        // TODO 未被使用
        * deleteDepartment(departmentId) {
            let token = yield this.ctx.service.dd.getToken();

            this.app.logger.info(`[service:ddDepartment:deleteDepartment] start, departmentId: `, departmentId);

            let result = yield this.app.curl(`https://oapi.dingtalk.com/department/delete?access_token=${token}&id=${departmentId}`, {
                dataType: 'json',
                method: 'GET'
            });

            let resultData = result.data;

            if (resultData.errcode) {
                this.app.logger.error(`[service:ddDepartment:deleteDepartment] error: `, resultData);
                throw new Error(resultData);
            }
            this.app.logger.info(`[service:ddDepartment:deleteDepartment] end`);

            return resultData;
        }


    }

    return DdDepartment;
}
