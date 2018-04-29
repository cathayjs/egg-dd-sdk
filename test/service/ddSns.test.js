const mock = require('egg-mock');
const assert = require('assert');


describe('service/DdSns.js', () => {

  let app;
  let ctx;

  beforeEach(async function () {
    app = mock.app();
    await app.ready();
    ctx = app.mockContext();

    /**********
     * 此persistentCode需要从正式环境中获取
     */
    app.mockService('ddSns', 'getPersistentCode', async function () {
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

  it('getToken()', async function () {
    let token = await ctx.service.ddSns.getToken();
    assert(token && token.length === 32);
  });

  it('getPersistentCode()', async function () {
    mock.restore();
    let persistentCode = await ctx.service.ddSns.getPersistentCode('123');
    assert(persistentCode.errcode === 40078);
  });

  return;

  it('getSnsToken()', async function () {
    let persistentCodeOptions = await ctx.service.ddSns.getPersistentCode();

    console.log(persistentCodeOptions);
    let result = await ctx.service.ddSns.getSnsToken(persistentCodeOptions);
    console.log(result)
    assert(result.length === 32);
  });

  it('getUserInfo()', async function () {
    let persistentCodeOptions = await ctx.service.ddSns.getPersistentCode();
    let snsToken = await ctx.service.ddSns.getSnsToken(persistentCodeOptions);
    let userInfo = await ctx.service.ddSns.getUserInfo(snsToken);
    assert(userInfo.dingId === "$:LWCP_v1:$a8fGlWtfe8omldkralx0eQ==");
  });

  it('getUserByPersistentCode()', async function () {
    let persistentCodeOptions = await ctx.service.ddSns.getPersistentCode();
    let userInfo = await ctx.service.ddSns.getUserByPersistentCode(persistentCodeOptions);
    assert(userInfo.dingId === "$:LWCP_v1:$a8fGlWtfe8omldkralx0eQ==");
  });



});


