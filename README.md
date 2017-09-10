

# 关于

> API文档请参见：https://cathayjs.github.io/egg-dd-sdk/

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
  4. 提供统一的日志服务


> 自己参与的项目非ISV类型，未针对ISV做设计，有需求的同学可以一起参与完善。
> 
> API文档请参见：https://cathayjs.github.io/egg-dd-sdk/

## egg 配置说明

package.json
```json
{
    "dependecies": {
        "egg-dd-sdk": "0.1.4"
    }
}
```


config/config.default.js

```js
module.exports.DD_CONFIG = {
    corpId: "dingdcf94075751f540635c2f4657eb6378f",
    secret: "C-uQKbuaA1zrne3ni2fwBfifMir9h4MEQTIrRi2LoQiE68LdxIWhBqnFxKLYABWT",
    token: '123456',    // 加解密时有用到
    aesKey: "1234567890123456789012345678901234567890123",  // 加解密时有用到
    agentId: {
        'default': '116146340'
    },
    nonceStr: "123456",
    sso: {
        appId: 'dingoa9l870sdqembng3je',
        appSecret: 'h0Y1uH4w4nkToIvzJzd6VKRNbJsqevOi791B0eeOVM87GrumW4xLEGOQqjzmo9eK'
    }
};
```

config/plugin.js

```js
exports.dd = {
  enable: true,
  package: 'egg-dd-sdk',
};
```

## NEXT

此目录为所有[钉钉官方服务端开发文档](https://open-doc.dingtalk.com/docs/doc.htm?spm=a219a.7629140.0.0.8cqfMW&treeId=385&articleId=104981&docType=1)的目录结构，打钩的是实现的：

- [x] 建立连接
- [x] 免登授权
    - [x] 企业应用中调用免登
    - [x] 普通钉钉用户账号开放及免登
    - [x] 网站应用钉钉扫码登录开发指南
    - [ ] 微应用后台管理员免登
    - [ ] ISV应用中调用免登
- [x] 通讯录管理
    - [x] 人员管理
    - [x] 部门管理
    - [ ] 权限管理
    - [ ] 角色管理
- [ ] 微应用管理
- [x] 消息会话管理
    - [x] 普通会话消息
    - [ ] 群会话消息
- [x] 文件管理 
    - [x] 多媒体文件管理
    - [x] 钉盘
        - [x] 单步文件上传
        - [x] 发送文件给指定用户
        - [ ] 文件事务
        - [ ] 其他
- [x] 智能办公
    - [x] 审批
    - [ ] 考勤
    - [ ] 签到
- [ ] 外部联系人管理
- [ ] 群机器人
- [x] 服务端加密、解密
- [x] js接口API



## 关于单测

`egg-dd-sdk`虽然是egg插件，但有完善的单测机制，且与egg框架目录结构使用方式一致：

* cnpm install
* npm run dev

目前以公共19个用例，覆盖了大部分接口