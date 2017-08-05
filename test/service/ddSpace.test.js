const mock = require('egg-mock');
const assert = require('assert');


describe('service/ddSpace.js', () => {

  let app;
  let ctx;

  before(function* () {
    app = mock.app();
    yield app.ready();
    ctx = app.mockContext();
  });
  afterEach(mock.restore);


  it('upload and send()', function* () {
    let mediaId = yield ctx.service.ddSpace.upload();

    assert(mediaId && mediaId.indexOf('#') === 0);

    let success = yield ctx.service.ddSpace.send(mediaId, 'manager3882', 'test.txt');

    assert(success === true);
  })

});


