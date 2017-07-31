

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


<aside class="notice">
自己参与的项目非ISV类型，未针对ISV做设计，有需求的同学可以一起参与完善。
</aside>

> API文档请参见：https://cathayjs.github.io/egg-dd-sdk/