const mock = require('egg-mock');
const assert = require('assert');


describe('service/Dd.js', () => {

  let app;
  let ctx;

  before(function* () {
    app = mock.app();
    yield app.ready();
    ctx = app.mockContext();
  });
  afterEach(mock.restore);


  it('_getAgentId()', function* () {
    let agentId = ctx.service.dd._getAgentId();
    assert(agentId === '116146340');
  })

  it('getToken()', function* () {
    let token = yield ctx.service.dd.getToken();
    assert(token);
  })

  it('sendMessageByDdUserId()', function* () {
    let result = yield ctx.service.dd.sendMessageByDdUserId("1012350541114092142", {
      "msgtype": "text",
      "text": {
        "content": "node dingding sdk sendMessageByDDUserId() unittest " + Math.random()
      }
    });
    assert(result === true);
  });


  it('getJsApiConfig()', function* () {
    let result = yield ctx.service.dd.getJsApiConfig(Math.random());

    assert(result.token);
    assert(result.signature);
    assert(result.timeStamp);
    assert(result.agentId);
  });


  it('getUserInfo()', function* () {
    try {
      yield ctx.service.dd.getUserInfo(Math.random());
      assert(false);
    } catch (e) {
      assert(e);
    }
  });

});


