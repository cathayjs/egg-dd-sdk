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


    it('getDepartmentFullPathByUser()', function* () {
        const result = yield ctx.service.ddDepartment.getDepartmentFullPathByUser('manager3882');
        assert(result.length === 2 && result[0].length == 2 && result[1].length === 3);
    });
    it('getDepartmentFullPathByDepartment()', function* () {
        const result = yield ctx.service.ddDepartment.getDepartmentFullPathByDepartment(50094428);
        assert.deepEqual(result, [ 50094428, 45957469, 1 ]);
    });
    it('getDepartments()', function* () {
        const result = yield ctx.service.ddDepartment.getDepartments();
        assert(result.length > 3 && result[0].id === 1);
    });

    it('getDepartment(departmentId) check manager && group owner', function* () {
        const result1 = yield ctx.service.ddDepartment.getDepartment(1);
        assert(result1.name === 'NODE SDK');
        assert(result1.orgDeptOwner === 'manager3882');
        const result2 = yield ctx.service.ddDepartment.getDepartment(45957469);
        assert(result2.deptManagerUseridList === 'manager3882');
    });


    it('create and delete department()', function* () {
        let name = mockjs.Random.name();
        const id = yield ctx.service.ddDepartment.createDepartment({
            name: name,
            parentid: 1
        });
        assert(id);

        let deleted = yield ctx.service.ddDepartment.deleteDepartment(id);
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