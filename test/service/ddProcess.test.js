const mock = require('egg-mock');
const assert = require('assert');


describe('service/DdProcess.js', () => {

  let app;
  let ctx;

  beforeEach(function* () {
    app = mock.app();
    yield app.ready();
    ctx = app.mockContext();
  });
  afterEach(mock.restore);

  it('createProcess()', function* () {
    let processInstanceId = yield ctx.service.ddProcess.createProcess({
      process_code: 'PROC-EF6YRO35P2-UXZMQYQNS8GZV2WMIMUV3-KXYSQQ5J-U',
      originator_user_id: 'manager3882',
      dept_id: '45957469',
      approvers: ['manager3882', '0847412208841146'],
      // approvers: 'manager3882,0847412208841146',
      // approvers: '012039633556498,043811683437365276',
      form_component_values: [
        {
          name: '字段1',
          value: '单测'
        },
        {
          name: '字段2',
          value: '审批流'
        }
      ]
    });

    assert(processInstanceId);
  });


  it('listProcess()', function* () {
    let result = yield ctx.service.ddProcess.listProcess({
      process_code: 'PROC-EF6YRO35P2-UXZMQYQNS8GZV2WMIMUV3-KXYSQQ5J-U'
    });
    // console.log(JSON.stringify(result, null, 4))
    assert(result.length);
  });

});


