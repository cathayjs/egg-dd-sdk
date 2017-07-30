const mock = require('egg-mock');
const assert = require('power-assert');
const mockjs = require('mockjs');


describe('service/DdDepartment.js', () => {

    let app;
    let ctx;

    before(function* () {
        app = mock.app();
        yield app.ready();
        ctx = app.mockContext();
    });
    after(mock.restore);

    it('getDepartments()', function* () {
        const result = yield ctx.service.ddDepartment.getDepartments();
        assert(result.length === 3 && result[0].id === 1);
    });

    it('getDepartment(departmentId)', function* () {
        const result = yield ctx.service.ddDepartment.getDepartment(1);
        assert(result.name === 'NODE SDK');
    });


    it('create and delete department()', function* () {
        let name = mockjs.Random.name();
        const result = yield ctx.service.ddDepartment.createDepartment({
            name: name,
            parentid: 1
        });
        assert(result.id);

        let deleted = yield ctx.service.ddDepartment.deleteDepartment(result.id);
        assert(deleted.errcode === 0);
    });


    it('updateDepartment()', function* () {
        const result = yield ctx.service.ddDepartment.getDepartments();
        const departmentId = result[1].id;

        let name = mockjs.Random.name();
        let up1 = yield ctx.service.ddDepartment.updateDepartment({
            id: departmentId,
            name: name
        });
        assert(up1.errcode === 0);
        let dep1 = yield ctx.service.ddDepartment.getDepartment(departmentId);
        assert(dep1.name === name);
    });

});