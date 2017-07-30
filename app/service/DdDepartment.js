'use strict';


module.exports = app => {

    class DdDepartment extends app.Service {
        constructor(ctx) {
            super(ctx);
        }

        // TODO 貌似没有被调用, 是否需要删除
        * getDepartment(departmentId) {

            let token = yield this.ctx.service.dd.getToken();
            let result = yield this.app.curl(`https://oapi.dingtalk.com/department/get?access_token=${token}&id=${departmentId}`, {
                dataType: 'json',
                method: 'GET'
            });
            let resultData = result.data;

            if (resultData.errcode) {
                throw new Error(JSON.stringify(resultData));
            }

            return resultData;
        }


        * getDepartments(parentId = '') {

            let token = yield this.ctx.service.dd.getToken();
            let result = yield this.app.curl(`https://oapi.dingtalk.com/department/list?access_token=${token}&id=${parentId}`, {
                dataType: 'json',
                method: 'GET'
            });

            result = result.data || {};

            return result.department;

        }


        // TODO 未被使用
        * createDepartment(departmentInfo) {

            let token = yield this.ctx.service.dd.getToken();
            let result = yield this.app.curl(`https://oapi.dingtalk.com/department/create?access_token=${token}`, {
                dataType: 'json',
                contentType: 'json',
                method: 'POST',
                data: departmentInfo
            });

            let resultData = result.data;

            if (resultData.errcode) {
                throw new Error(JSON.stringify(resultData));
            }

            return resultData;
        }


        /*************
         * https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.W4WlHX&treeId=172&articleId=104979&docType=1#s3
         * @param departmentInfo
         */
        * updateDepartment(departmentInfo) {

            let token = yield this.ctx.service.dd.getToken();
            let result = yield this.app.curl(`https://oapi.dingtalk.com/department/update?access_token=${token}`, {
                dataType: 'json',
                contentType: 'json',
                method: 'POST',
                data: departmentInfo
            });

            let resultData = result.data;

            if (resultData.errcode) {
                throw new Error(JSON.stringify(resultData));
            }

            return resultData;
        }

        // TODO 未被使用
        * deleteDepartment(departmentId) {
            let token = yield this.ctx.service.dd.getToken();

            let result = yield this.app.curl(`https://oapi.dingtalk.com/department/delete?access_token=${token}&id=${departmentId}`, {
                dataType: 'json',
                method: 'GET'
            });

            let resultData = result.data;

            if (resultData.errcode) {
                throw new Error(resultData);
            }

            return resultData;
        }


    }

    return DdDepartment;
}
