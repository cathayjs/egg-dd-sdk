const mock = require('egg-mock');
const assert = require('assert');


describe('service/DdSns.js', () => {

  let app;
  let ctx;

  beforeEach(function *() {
    app = mock.app();
    yield app.ready();
    ctx = app.mockContext();
    app.mockService('ddSns', 'getPersistentCode', function*() {
      return {
        persistent_code: 'hjPNYHroltJKZAfwkApLoVkSDYftD9q00F5z5x40hZupptGmjeIaT3sOwfDHLC4a',
        openid: '4XENP5LSW1UiE',
        errmsg: 'ok',
        unionid: 'ozQOkOek1sAiE',
        errcode: 0
      }
    });
  });
  afterEach(mock.restore);

  it('getSnsToken()', function*() {
    let persistentCodeOptions = yield ctx.service.ddSns.getPersistentCode();
    let result = yield ctx.service.ddSns.getSnsToken(persistentCodeOptions);
    assert(result.length === 32);
  });

  it('getUserInfo()', function*() {
    let persistentCodeOptions = yield ctx.service.ddSns.getPersistentCode();
    let snsToken = yield ctx.service.ddSns.getSnsToken(persistentCodeOptions);
    let userInfo = yield ctx.service.ddSns.getUserInfo(snsToken);
    assert(userInfo.dingId === "$:LWCP_v1:$a8fGlWtfe8omldkralx0eQ==");
  });

  it('getUserByPersistentCode()', function*() {
    let persistentCodeOptions = yield ctx.service.ddSns.getPersistentCode();
    let userInfo = yield ctx.service.ddSns.getUserByPersistentCode(persistentCodeOptions);
    assert(userInfo.dingId === "$:LWCP_v1:$a8fGlWtfe8omldkralx0eQ==");
  });

  it('getPersistentCode()', function*() {
    mock.restore();
    let persistentCode = yield ctx.service.ddSns.getPersistentCode('123');
    assert(persistentCode.errcode === 40078);
  });

});


