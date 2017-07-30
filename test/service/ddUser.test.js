const mock = require('egg-mock');
const assert = require('assert');
const mockjs = require('mockjs');


describe('service/DdUser.js', () => {

  let app;
  let ctx;

  beforeEach(function* () {
    app = mock.app();
    yield app.ready();
    ctx = app.mockContext();

  });
  afterEach(mock.restore);

  it('getUser()', function* () {
    let result = yield ctx.service.ddUser.getUser("manager3882");
    assert(result.name === "陈强");
  });


  it('createUser()', function* () {

    let mobile = '186' + mockjs.Random.natural(10000000, 99999999);
    let inserted = yield ctx.service.ddUser.createUser({
      name: "张三",
      mobile,
      department: [1],
      extattr: {
        '花名': "月光"
      }
    });
    assert(inserted.errcode === 0);

    let result = yield ctx.service.ddUser.getUser(inserted.userid);
    assert(result.extattr['花名'] === "月光");

    let deleted = yield ctx.service.ddUser.deleteUser(inserted.userid, 0, true);
    assert(deleted.errcode === 0);
  });


  it('getUsers()', function* () {
    let result = yield ctx.service.ddUser.getUsers();
    assert(result.length === 2 && result[0].name);
  });


  // TODO AND TIPS: 只能更改未注册过的手机号码 2017-06-08 19:00:57,158 ERROR 13878 [ddUser] updateDdUser { errmsg: '更换的号码已注册过钉钉，无法使用该号码', errcode: 40021 }
  // TODO AND TIPS: name有bug, 貌似在未激活时，更新会有随机错误，但extarr, position没有问题
  it('updateUser()', function* () {
    let mobile1 = '186' + mockjs.Random.natural(10000000, 90000000);
    // let mobile2 = '186' + mockjs.Random.natural(80000000, 90000000);

    let name1 = '张三';
    let name2 = '李四';

    let userid = mockjs.Random.natural();

    let inserted = yield ctx.service.ddUser.createUser({
      name: name1,
      userid: userid,
      mobile: mobile1,
      department: [1],
      position: 'abc',
      extattr: {
        '花名': "月光"
      }
    });
    assert(inserted.errcode === 0);
    let updated = yield ctx.service.ddUser.updateUser({
      userid: userid,
      name: name2,
      extattr: {
        '花名': "流水"
      },
      position: 'up'
    });
    assert(updated.errcode === 0);

    let result = yield ctx.service.ddUser.getUser(userid);

    assert(result.extattr['花名'] === "流水");
    // assert(result['name'] === "李四");
    assert(result['position'] === "up");


    let deleted = yield ctx.service.ddUser.deleteUser(inserted.userid, 0, true);
    assert(deleted.errcode === 0);
  });


});


