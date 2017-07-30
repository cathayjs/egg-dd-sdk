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
    * getUser(userId) {

      this.app.logger.info('[ddUser] before getUser:', userId);

      let token = yield this.ctx.service.dd.getToken();
      let result = yield this.app.curl(`https://oapi.dingtalk.com/user/get?access_token=${token}&userid=${userId}`, {
        dataType: 'json',
        method: 'GET'
      });
      let resultData = result.data;

      /* istanbul ignore if */
      if (resultData.errcode) {
        this.app.logger.error('[ddUser] getUser error:', resultData)
      }

      this.app.logger.info('[ddUser] after getUser:', userId);

      return resultData;
    }

    * getUsers(departmentId = "", casade = true) {

      try {

        let ddUsers = [];

        this.app.logger.info('[ddUser] before getUsers, departmentId, casade:', departmentId, casade);

        if (!casade) {
          ddUsers = yield this.getUsersByDepartment(departmentId);
        } else {

          let departments = yield this.ctx.service.ddDepartment.getDepartments(departmentId);
          departments = departments.map((department) => {
            return department.id;
          });

          if (departmentId) {
            departments.push(departmentId);
          }

          for (let departmentId of departments) {
            let subUsers = yield this.getUsersByDepartment(departmentId);
            ddUsers = ddUsers.concat(subUsers);
          }

        }

        this.app.logger.info('[ddUser] after getUsers, departmentId, casade:', departmentId, casade);

        ddUsers = ddUtils.deleteRepeated(ddUsers);


        return ddUsers;

      } catch (e) {

        this.ctx.app.logger.error('[DD API] get Users Error', e);

        throw e;
      }

    }

    * getUsersByDepartment(departmentId, offset = 0, size = 100) {

      this.app.logger.info('[ddUser] before getUsersByDepartment, departmentId, offset:', departmentId, offset);

      let token = yield this.ctx.service.dd.getToken();
      let result = yield this.app.curl(`https://oapi.dingtalk.com/user/list?offset=${offset}&size=${size}&access_token=${token}&department_id=${departmentId}`, {
        dataType: 'json',
        method: 'GET'
      });

      let resultData = result.data;

      /* istanbul ignore if */
      if (resultData.errcode) {
        this.ctx.app.logger.error('[ddUser] getUsersByDepartment', departmentId, offset, size);
        throw new Error(`getUsersByDepartment error ${departmentId}`);
      }

      let users = resultData.userlist || [];

      if (resultData.hasMore) {
        let more = yield this.getUsersByDepartment(departmentId, offset + size, size);

        users = users.concat(more);
      }

      this.app.logger.info('[ddUser] after getUsersByDepartment, departmentId, offset:', departmentId, offset);

      return users;
    }


    /**********
     *
     * https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.W4WlHX&treeId=172&articleId=104979&docType=1#s9
     * @param userInfo
     */
    * createUser(userInfo) {

      try {
        this.app.logger.info('[ddUser] before createUser:', userInfo);

        let token = yield this.ctx.service.dd.getToken();
        let result = yield this.app.curl(`https://oapi.dingtalk.com/user/create?access_token=${token}`, {
          dataType: 'json',
          contentType: 'json',
          method: 'POST',
          data: userInfo
        });

        let resultData = result.data;

        /* istanbul ignore if */
        if (resultData.errcode) {
          this.ctx.app.logger.error('[ddUser] createUser', userInfo, resultData);
          throw new Error(`create dd user error ${userInfo.jobnumber}`);
        }

        this.app.logger.info('[ddUser] after createUser:');

        return resultData;
      } catch (e) {
  
        throw e;
      }

    }


    /***************
     * https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.W4WlHX&treeId=172&articleId=104979&docType=1#s9
     * @param userInfo
     */
    * updateUser(userInfo) {

      try {
        this.app.logger.info('[ddUser] before updateUser:', userInfo);

        let token = yield this.ctx.service.dd.getToken();
        let result = yield this.app.curl(`https://oapi.dingtalk.com/user/update?access_token=${token}`, {
          dataType: 'json',
          contentType: 'json',
          method: 'POST',
          data: userInfo
        });
        let resultData = result.data;

        /* istanbul ignore if */
        if (resultData.errcode) {
          this.app.logger.error('[ddUser] updateDdUser', resultData);
          throw new Error(`updateDdUser error ${userInfo.jobnumber}`);
        }

        this.app.logger.info('[ddUser] after updateUser');

        return resultData;

      } catch (e) {
 
        throw e;
      }

    }

    /************
     * https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.W4WlHX&treeId=172&articleId=104979&docType=1#s9
     * @param userId
     * @param times
     * @param force
     * @returns {boolean}
     */
    * deleteUser(userId, times = 1) {

      try {
        this.app.logger.info('[ddUser] before deleteUser:', userId);

        let token = yield this.ctx.service.dd.getToken();
        let result = yield this.app.curl(`https://oapi.dingtalk.com/user/delete?access_token=${token}&userid=${userId}`, {
          dataType: 'json',
          method: 'GET'
        });
        let resultData = result.data;

        /* istanbul ignore if */
        if (resultData.errcode) {
          this.ctx.app.logger.error('[ddUser] delete ddUserError', resultData, times);
          if (times < 3) {
            times++;
            this.deleteUser(userId, times);
          } else {
            throw new Error(`delete dd user error ${userId}, tried 3 times`);
          }
        }

        this.app.logger.info('[ddUser] after deleteUser:', userId);

        return resultData;

      } catch (e) {
    
        throw e;
      }

    }
  }

  return DdUser;
};