---
title: API Reference

language_tabs: # must be one of https://git.io/vQNgJ
  - javascript

toc_footers:
  - <a href='https://github.com/tripit/slate'>Powered by Slate</a>
  - <a href='https://github.com/cathayjs/egg-dd-sdk'>返回GITHUB</a>

includes:

search: true
---

# About

由于钉钉未提供nodejs sdk，初次用nodejs对应相应接口时比较费时费力，所以将项目中的钉钉对接接口整理出来，以`egg插件`的方式提供呈现。

本sdk的主要达到三个目的：

1. config: 钉钉相关配置的约定
2. utils: 将钉钉加解密之类的复杂方法抽象为工具类
3. service: 将与钉钉相关的API接口进行封装，以service方式提供，方便调用

另外，关于为什么基于`egg插件`，说明一下原因：

1. `egg`框架本身在企业级应用框架中的分层非常清晰，扩展机制极其灵活，配套完整，极力推荐
2. 通过`egg插件`的组织，能够非常方便的组织钉钉的配置文件管理、工具使用及service使用
  1. 提供了统一的配置管理
  2. 提供统一的工具调用方式
  3. 提供统一的service调用方式
  4. 统一的日志服务


<aside class="notice">
自己参与的项目非ISV类型，未针对ISV做设计，有需求的同学可以一起参与完善。
</aside>




# DD-CONFIG


> 在config/config.default.js中

```javascript
  exports.DD_CONFIG = {
    corpId: "dinge0e69ed313daa460",
    secret: "sH_JdRrkgRvmJ5B9_RPjAM51hgT9cXhxCl0-_kUDY5_VOuhPX_PbIoKsigoyEqLd",
    agentId: {
      'default': '103015601',
      'applyAndApprove': '84637933',
      'sso': '103015601'
    },
    aesKey: "1234567890123456789012345678901234567890abc",
    token: "abcdef",
    nonceStr: "123456",
    sso: {
      appId: "dingoakznbgimtvtwk49i1",
      appSecret: "dlDOTzrLsB5XV5aciVsgEu_76KatMgbWgsWJkxsE54fY64D22MIs2ccXkqH6k5gK"
    }
  };
```

> 注意`DD_CONFIG`关键词

钉钉通信中会涉及安全认证、加解密、签名验证等诸多操作，所以有各类key,token等用于上述过程：

字段你 | 格式 | 说明
--------- | ------- | -----------
coprId | `String` |公司唯一标识
secret| `String` |认证密钥，非常重要，妥善保管，具有极高权限|
agentId | `Sring` or `Object` | 微应用的ID
agentId(String) | `String` | 当只有一个微应用时
agentId(Object) | {key, value} = `Object` | 其中 key 为 `agentIdType`, value为对应值
aesKey | `String`(43) | AES加解密时需要的一个secretKey，长度43位，自己定义
token | `String`(6) | aes加解密及签名时用到, len=6
nonceStr| `String`(6) | aes加解密及签名时用到, len=6
sso.appId| `String`| 钉钉扫码登陆的appId
sso.appSecret| `String`| 钉钉扫码登陆的appSecret



# DD-utils

> 钉钉通信加解密:

```javascript
// step1: createInstance
let aes = this.helper.createDdEncrpt();
// step2: encode(encodeString, timestamp, nonceString);
let encoded = aes.encode('success', 1500957302881, 'KOHjp9ss');
// console.log(encoded);
// step3: decode(decodeString, timestamp, nonceString, decodeStringSignature)
let parsed = aes.decode(encoded.encrypt, encoded.timeStamp, encoded.nonce, encoded.msg_signature);
// console.log(parsed)
```


使用钉钉的部分接口，需要进行`加解密`以及`签名验证`操作，签名相对简单，但加解密涉及大量编码转换以及算法知识，在缺乏相关知识背景的情况下，很难完成。官方仅提供了PHP,JAVA SDK，自己摸索了半天才搞定了Nodejs版的部分。

我们提供了: `this.helper.createDdEncrpt()`方法

官方文档：[钉钉加解密及签名验证](https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.8b5CcM&treeId=366&articleId=104945&docType=1#s13)

另外提供了非egg版本，参见：[nodejs-dd-aes](https://github.com/cathayjs/nodejs-dd-aes)

<aside class="notice">
进行加解密，必须配置`aesKey`, `token`
</aside>

## aes.encode()

```javascript
// step2: encode(encodeString, timestamp, nonceString);
let encoded = aes.encode('success', 1500957302881, 'KOHjp9ss');
// console.log(encoded);
```


* encodeString: 要加密的原始字符串（你要发给钉钉的原始字符串）
* timestamp: 随机时间戳，毫秒时
* nonceString: 随机nonce字符，6位

## aes.decode()

```javascript
// step3: decode(decodeString, timestamp, nonceString, decodeStringSignature)
let parsed = aes.decode(encoded.encrypt, encoded.timeStamp, encoded.nonce, encoded.msg_signature);
// console.log(parsed)
```

* decodeString：解密钉钉发给你的加密字符串
* timestamp: 加密字符串配对的timestamp(钉钉会同加密字符串一起发给你)
* nonceString: 加密字符串配对的nonceString(钉钉会同加密字符串一起发给你)
* decodeStringSignature: 加密字符串配对的decodeStringSignature(钉钉会同加密字符串一起发给你)


# DD-Service API

service是SDK的核心, 对常见的 dd api 进行了封装~

<aside class="notice">
关于性能优化：所有service与钉钉通信时都有一个`accessToken`授权认证的过程，为了提高性能需要把`accessToken`缓存下来。
`egg-dd-sdk`中处理了这部分的性能优化，需要你在egg框架中启用`egg-redis`插件。如果未启用，则不进行accessToken缓存策略。
</aside>

## General Service

### `this.ctx.service.dd.getToken()`
### `this.ctx.service.dd.sendMessageByDdUserId(ddUserId, messageObj, agentIdType)`

* [钉钉官方文档-企业会话消息接口](https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7386797.0.0.rD6Zgg&treeId=172&articleId=104973&docType=1)
* [钉钉官方文档-消息类型及数据格式](https://open-doc.dingtalk.com/doc2/detail.htm?spm=a219a.7629140.0.0.HTFncJ&treeId=172&articleId=104972&docType=1)


### `this.ctx.service.dd.getJsApiConfig(originUrl, agentIdType)`

* [钉钉官方文档](https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.qw2yFM&treeId=171&articleId=104910&docType=1)

### `this.ctx.service.dd.getUserInfo(code)`

* [钉钉官方文档](https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.p1ESs4&treeId=172&articleId=104969&docType=1)


## User Service

* [钉钉官方文档](https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.6nS7Sz&treeId=172&articleId=104979&docType=1#s6)

### `this.ctx.service.ddUser.getUser(userId)`
### `this.ctx.service.ddUser.getUsers(departmentId, casade = true)`

钉钉官方api中无法递归获取部门中的员工数据，本接口封装了这部分，当`casade=true`时，递归后去，默认为true

### `this.ctx.service.ddUser.getUsersByDepartment(departmentId)`

钉钉官方api获取部门用户时，会有分页概念，本接口屏蔽了分页逻辑，默认返回返回部门下的所有员工。

### `this.ctx.service.ddUser.createUser(userInfo)`
### `this.ctx.service.ddUser.updateUser(userInfo)`
### `this.ctx.service.ddUser.deleteUser(userId)`

## Department Service

* [钉钉官方文档](https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.W4WlHX&treeId=172&articleId=104979&docType=1#s0)

### `this.ctx.service.ddDepartment.getDepartment(departmentId)`
### `this.ctx.service.ddDepartment.getDepartments(parentId)`
### `this.ctx.service.ddDepartment.updateDepartment(departmentInfo)`
### `this.ctx.service.ddDepartment.deleteDepartment(departmentId)`

## SNS Service

* [钉钉官方文档](https://open-doc.dingtalk.com/doc2/detail.htm?spm=a219a.7629140.0.0.WiN1vd&treeId=172&articleId=104968&docType=1#s0)

### `this.ctx.service.ddSns.getToken()`
### `this.ctx.service.ddSns.getPersistentCode(tmpAuthCode)`
### `this.ctx.service.ddSns.getSnsToken(persistentCodeOptions)`
### `this.ctx.service.ddSns.getUserInfo(snsToken)`
### `this.ctx.service.ddSns.getUserByPersistentCode(persistentCode)`

## Events Service

* [钉钉官方文档](https://open-doc.dingtalk.com/doc2/detail.htm?spm=a219a.7629140.0.0.WiN1vd&treeId=172&articleId=104968&docType=1#s0)

### `this.ctx.service.ddEvents.eventsregisterEvents(callbackUrl, events, isUpdate = false)`
### `this.ctx.service.ddEvents.updateEvents(events)`
### `this.ctx.service.ddEvents.deleteEvents()`
### `this.ctx.service.ddEvents.queryEvents()`

## Process Service

* [钉钉官方文档](https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.rgrrdz&treeId=355&articleId=29498&docType=2)

### `this.ctx.service.ddProcess.createProcess(options)`
### `this.ctx.service.ddProcess.listProcess()`