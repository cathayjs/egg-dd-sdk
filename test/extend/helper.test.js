const mock = require('egg-mock');
const assert = require('assert');


describe('extend/helper.js', () => {

  let app;
  let ctx;

  before(function* () {
    app = mock.app();
    yield app.ready();
    ctx = app.mockContext();
  });
  afterEach(mock.restore);


  it('createDdEncrypt() encrypt string ', function* () {
    let encrypt = ctx.helper.createDdEncrypt();
    let result = encrypt.encode('success', 1500957302881, 'KOHjp9ss');
    let jsonParsed = encrypt.decode(result.encrypt, result.timeStamp, result.nonce, result.msg_signature);
    assert(jsonParsed === 'success');
  });

  it('createDdEncrypt() encrypt json ', function* () {
    let encrypt = ctx.helper.createDdEncrypt();
    let result = encrypt.encode('{"success": true}', 1500957302881, 'KOHjp9ss');
    let jsonParsed = encrypt.decode(result.encrypt, result.timeStamp, result.nonce, result.msg_signature);
    assert.deepEqual(jsonParsed, {
      success: true
    });
  });

});


