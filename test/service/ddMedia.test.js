const mock = require('egg-mock');
const assert = require('assert');


describe('service/ddMedia.js', () => {

  let app;
  let ctx;

  before(function* () {
    app = mock.app();
    yield app.ready();
    ctx = app.mockContext();
  });
  afterEach(mock.restore);


  it('upload and get()', function* () {

    let mediaId = yield ctx.service.ddMedia.upload();
    assert(mediaId);

    let fileBuffer = yield ctx.service.ddMedia.get(mediaId);
    assert(fileBuffer instanceof Buffer);
  })


});


