'use strict';
const ddUtils = require('./utils/dd');

module.exports = app => {

  class DdUser extends app.Service {
    constructor(ctx) {
      super(ctx);
    }

    /**
     * https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.6nS7Sz&treeId=172&articleId=104979&docType=1#s6
     * @param userId
     */
    async getUser(userId) {

      this.app.logger.info('[service:ddUser:getUser] start, userId:', userId);

      let token = await this.ctx.service.dd.getToken();
      let result = await this.app.curl(`https://oapi.dingtalk.com/user/get?access_token=${token}&userid=${userId}`, {
        dataType: 'json',
        method: 'GET'
      });
      let resultData = result.data;

      /* istanbul ignore if */
      if (resultData.errcode) {
        this.app.logger.error('[service:ddUser:getUser] getUser error:', resultData)
      }

      this.app.logger.info('[service:ddUser:getUser] end');

      return resultData;
    }

    async getUsers(departmentId = "", casade = true) {

      try {
        let ddUsers = [];
        this.app.logger.info(`[service:ddUser:getUsers] before getUsers, departmentId: ${departmentId}, casade: ${casade}`);

        if (!casade) {
          ddUsers = await this.getUsersByDepartment(departmentId);
        } else {

          let departments = await this.ctx.service.ddDepartment.getDepartments(departmentId);
          departments = departments.map((department) => {
            return department.id;
          });

          if (departmentId) {
            departments.push(departmentId);
          }

          for (let departmentId of departments) {
            let subUsers = await this.getUsersByDepartment(departmentId);
            ddUsers = ddUsers.concat(subUsers);
          }
        }

        ddUsers = ddUtils.deleteRepeated(ddUsers);

        this.app.logger.info('[service:ddUser:getUsers] end, ddUsers.length:', ddUsers.length);

        return ddUsers;

      } catch (e) {

        this.ctx.app.logger.error('[service:ddUser:getUsers] error: ', e);

        throw e;
      }

    }

    async getUsersByDepartment(departmentId, offset = 0, size = 100) {

      this.app.logger.info(`[service:ddUser:getUsersByDepartment] start, departmentId: ${departmentId}, offset: ${offset}`);

      let token = await this.ctx.service.dd.getToken();
      let result = await this.app.curl(`https://oapi.dingtalk.com/user/list?offset=${offset}&size=${size}&access_token=${token}&department_id=${departmentId}`, {
        dataType: 'json',
        method: 'GET'
      });

      let resultData = result.data;

      /* istanbul ignore if */
      if (resultData.errcode) {
        this.ctx.app.logger.error('[service:ddUser:getUsersByDepartment] getUsersByDepartment', resultData);
      }

      let users = resultData.userlist || [];

      if (resultData.hasMore) {
        let more = await this.getUsersByDepartment(departmentId, offset + size, size);
        users = users.concat(more);
      }

      this.app.logger.info('[service:ddUser:getUsersByDepartment] end');

      return users;
    }


    /**********
     *
     * https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.W4WlHX&treeId=172&articleId=104979&docType=1#s9
     * @param userInfo
     */
    async createUser(userInfo) {

      this.app.logger.info('[service:ddUser:createUser] start:', userInfo);

      let token = await this.ctx.service.dd.getToken();
      let result = await this.app.curl(`https://oapi.dingtalk.com/user/create?access_token=${token}`, {
        dataType: 'json',
        contentType: 'json',
        method: 'POST',
        data: userInfo
      });

      let resultData = result.data;

      /* istanbul ignore if */
      if (resultData.errcode) {
        this.ctx.app.logger.error('[service:ddUser:createUser] createUser', resultData);
      }

      this.app.logger.info('[service:ddUser:createUser] end');

      return resultData;

    }


    /***************
     * https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.W4WlHX&treeId=172&articleId=104979&docType=1#s9
     * @param userInfo
     */
    async updateUser(userInfo) {

      this.app.logger.info('[service:ddUser:updateUser] start:', userInfo);

      let token = await this.ctx.service.dd.getToken();
      let result = await this.app.curl(`https://oapi.dingtalk.com/user/update?access_token=${token}`, {
        dataType: 'json',
        contentType: 'json',
        method: 'POST',
        data: userInfo
      });
      let resultData = result.data;

      /* istanbul ignore if */
      if (resultData.errcode) {
        this.app.logger.error('[service:ddUser:updateUser] error:', resultData);
      }

      this.app.logger.info('[service:ddUser:updateUser] end');

      return resultData;
    }

    /************
     * https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.W4WlHX&treeId=172&articleId=104979&docType=1#s9
     * @param userId
     * @param times
     * @param force
     * @returns {boolean}
     */
    async deleteUser(userId, times = 1) {

      this.app.logger.info('[service:ddUser:deleteUser] start, userId:', userId);

      let token = await this.ctx.service.dd.getToken();
      let result = await this.app.curl(`https://oapi.dingtalk.com/user/delete?access_token=${token}&userid=${userId}`, {
        dataType: 'json',
        method: 'GET'
      });
      let resultData = result.data;

      /* istanbul ignore if */
      if (resultData.errcode) {
        this.ctx.app.logger.error('[service:ddUser:deleteUser] error:', resultData, times);
        if (times < 3) {
          times++;
          await this.deleteUser(userId, times);
        } else {
          throw new Error(`[service:ddUser:deleteUser] delete dd user error ${userId}, tried 3 times`);
        }
      }

      this.app.logger.info('[service:ddUser:deleteUser] end');

      return resultData;
    }
  }

  return DdUser;
};