'use strict';

const ddUtils = require('./utils/dd');
const md5 = require('md5');
const assert = require('assert');

// TODO 从 cathay-portal-private 迁移过来，需要一点点替换
module.exports = app => {

  const ddConfig = app.config.DD_CONFIG;
  const agentIdConfig = ddConfig.agentId || {};

  class Dd extends app.Service {
    constructor(ctx) {
      super(ctx);
    }

    _getAgentId(type) {


      let agentId;

      if (typeof agentIdConfig == 'string') {
        agentId = agentIdConfig;
      } else {
        agentId = agentIdConfig.default;
      }
      if (type) {
        agentId = agentIdConfig[type];
      }
      if (!agentId) {
        app.logger.error(`agentId not exist, agentIdType: ${type}`);
      }
      return agentId;
    }

    async getToken() {

      let accessToken;
      if (app.redis) {
        accessToken = await app.redis.get('corpAccessToken');
      }

      // 更新corpAccessToken
      if (!accessToken) {
        app.logger.info(`[service:dd:getToken] start`);

        let result = await this.app.curl(`https://oapi.dingtalk.com/gettoken?corpid=${ddConfig.corpId}&corpsecret=${ddConfig.secret}`, {
          dataType: 'json'
        });
        let resultData = result.data;

        /* istanbul ignore if */
        if (resultData.errcode) {
          app.logger.error(`[service:dd:getToken] error: `, resultData);
        }

        app.logger.info(`[service:dd:getToken] end`);

        accessToken = resultData.access_token;

        if (app.redis) {
          await app.redis.set('corpAccessToken', accessToken, "ex", 5400);
        }
      }

      return accessToken;
    }

    /********
     * 企业会话消息接口
     * https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7386797.0.0.rD6Zgg&treeId=172&articleId=104973&docType=1
     * 消息类型及数据格式
     * https://open-doc.dingtalk.com/doc2/detail.htm?spm=a219a.7629140.0.0.HTFncJ&treeId=172&articleId=104972&docType=1
     * @param ddUserId
     * @param data
     * @returns {boolean}
     */
    async sendMessageByDdUserId(ddUserId, messageObj, agentIdType) {

      if (Array.isArray(ddUserId)) {
        ddUserId = ddUserId.join('|');
      }

      let token = await this.getToken();

      app.logger.info(`[service:dd:sendMessageByDdUserId] start, ddUserId:`, ddUserId);

      const result = await this.app.curl(`https://oapi.dingtalk.com/message/send?access_token=${token}`, {
        method: 'POST',
        contentType: "json",
        dataType: 'json',
        data: Object.assign({
          "touser": `${ddUserId}`,
          "agentid": this._getAgentId(agentIdType)
        }, messageObj)
      });

      const resultData = result.data;

      /* istanbul ignore if */
      if (resultData.errcode) {
        app.logger.error(`[service:dd:sendMessageByDdUserId] error: `, resultData);
      }

      app.logger.info(`[service:dd:sendMessageByDdUserId] end`);

      return !resultData.errcode;
    }

    /*********
     *
     * https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.qw2yFM&treeId=171&articleId=104910&docType=1
     * https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.ZbDFk8&treeId=172&articleId=104966&docType=1
     * TODO jsticket时间缓存优先
     * @param originUrl
     * @returns {{token: *, signature: *, nonceStr: (string|string), timeStamp: number, corpId: (string|string), agentId: *}}
     */
    async getJsApiConfig(originUrl, agentIdType) {

      assert(originUrl, '[service:dd:getJsApiConfig] getJsApiConfig originUrl is required');

      let agentId = this._getAgentId(agentIdType);

      app.logger.info(`[service:dd:getJsApiConfig] start: `, originUrl, agentId);

      const REDIS_KEY = 'EMP_jsApiConfig' + md5(originUrl);

      let jsApiConfig;

      if (app.redis) {
        jsApiConfig = await app.redis.get(REDIS_KEY);
      }

      if (!jsApiConfig) {

        let token = await this.getToken();
        let ticketResult = await this.app.curl(`https://oapi.dingtalk.com/get_jsapi_ticket?type=jsapi&access_token=${token}`, {
          dataType: 'json'
        });
        let ticketResultData = ticketResult.data;

        /* istanbul ignore if */
        if (ticketResultData.errcode) {
          app.logger.error(`[service:dd:getJsApiConfig] Error`, ticketResultData);
          throw new Error(ticketResultData);
        }

        let ticket = ticketResultData.ticket;
        app.logger.info(`[service:dd:getJsApiConfig] TICKET:  `, ticket);

        let ticketTimeout = ticketResultData.expires_in - 200; // 默认expires_in = 7200s

        let signedUrl = decodeURIComponent(originUrl);
        let timeStamp = new Date().getTime();

        // this.ctx.logger.debug(signedUrl)

        let signature = ddUtils.sign({
          nonceStr: ddConfig.nonceStr,
          timeStamp: timeStamp,
          url: signedUrl,
          ticket: ticket
        });

        jsApiConfig = {
          token: token,
          signature: signature,
          nonceStr: ddConfig.nonceStr,
          timeStamp: timeStamp,
          corpId: ddConfig.corpId,
          agentId: agentId
        };

        if (app.redis) {
          await app.redis.set(REDIS_KEY, JSON.stringify(jsApiConfig), "ex", ticketTimeout);
        }

      } else {
        jsApiConfig = JSON.parse(jsApiConfig);
      }

      app.logger.info(`[service:dd:getJsApiConfig] end: `, jsApiConfig);

      return jsApiConfig;
    }

    /************
     * https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.p1ESs4&treeId=172&articleId=104969&docType=1
     * @param code
     */
    async getUserInfo(code, userIdOnly = false) {

      app.logger.info(`[service:dd:getUserInfo] start, code:${code}, userIdonly:${userIdOnly} `);

      let token = await this.getToken();
      let userIdResult = await this.app.curl(`https://oapi.dingtalk.com/user/getuserinfo?access_token=${token}&code=${code}`, {
        dataType: 'json',
        method: 'GET'
      });
      let userIdResultData = userIdResult.data;


      /* istanbul ignore if */
      if (userIdResultData.errcode) {
        app.logger.error(`[service:dd:getUserInfo] error get userid: `, userIdResultData);
        throw new Error(userIdResultData);
      }

      let userId = userIdResult.data.userid;

      app.logger.info(`[service:dd:getUserInfo] end WITH ONLY ID, ddUserId: ${userId}`);

      if (userIdOnly) {
        return userId;
      }

      let infoResult = await this.app.curl(`https://oapi.dingtalk.com/user/get?access_token=${token}&userid=${userId}`, {
        dataType: 'json',
        method: 'GET'
      });
      let infoResultData = infoResult.data;

      /* istanbul ignore if */
      if (infoResultData.errcode) {
        app.logger.error(`[service:dd:getUserInfo] error get userInfo`, infoResultData);
        throw new Error(infoResultData);
      }

      app.logger.info(`[service:dd:getUserInfo] end:`, infoResultData);

      return infoResultData;
    }

  }

  return Dd;
}
