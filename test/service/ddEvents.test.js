const mock = require('egg-mock');
const assert = require('assert');

describe('service/DdEvents.js', () => {

  let app;
  let ctx;

  beforeEach(function* () {
    app = mock.app();
    yield app.ready();
    ctx = app.mockContext();
  });
  afterEach(mock.restore);

  // it('registerEvents()', function* () {
  //   let isOk = yield ctx.service.ddEvents.registerEvents();
  //   assert(isOk);
  // });

  // it('queryEvents()', function* () {
  //   let isOk = yield ctx.service.ddEvents.queryEvents();
  //   assert(isOk);
  // });


});


