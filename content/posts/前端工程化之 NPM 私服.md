---
title: "前端工程化之 npm 私服"
description: "使用 Verdaccio 快速搭建私有 npm 仓库"
date: "2021-04-28T16:30:30+08:00"
tags: ["npm", "前端工程化"]
keywords: ["私有", "npm", "组件仓库", "Verdaccio", "前端工程化"]
categories: ["Tech"]
slug: "private-npm"
gitinfo: true
comments: true
toc: true
---

工程化系列的[上篇文章](../component-based-development)讲到了组件的发布及使用，这篇文章就来看看如何..高效..搭建..易用..的**私有组件仓库**。

组件有跨项目共用的需求，也就要考虑到组件代码的存储和传播了，排除了 Bit 后满足这两点的最适宜内部组件存储的介质就是 npm 私有仓库了，它具有以下几个特质：

- 安全性：只有内网可访问，避免代码泄露
- 复用性：与 npm 公共库一样便于下载传播
- 版本管理：统一管理组件库版本，语义化版本号

再综合考虑其它因素如搭建复杂度、框架量级、业务场景，我们选择使用 [Verdaccio](https://verdaccio.org/) 来搭建公共组件仓库。

## Verdaccio 介绍
Verdaccio 是一个基于 Node.js 的轻量化私有 npm proxy registry，proxy registry 对应的便是 npm 官方的 public registry，具体概念见 [registry | npm](https://docs.npmjs.com/cli/v7/using-npm/registry)。简而言之，Verdaccio 的本质作用是管理发布上来的 npm 包，并且使之和官方包隔离，。易用性主要体现在这些地方：

- 配置方式简单
- 权限控制清晰
- 开箱即用的 Web 界面

## 搭建组件仓库

### 安装 Verdaccio
私有的组件仓库要能被其他开发人员访问，就要放在服务器上了。确保安装好 Node 环境后，全局安装 Verdaccio：

```s
$ npm install -g verdaccio
```

安装好后终端输入 `verdaccio` 即可启动服务，由于 Verdaccio 是一个 Node 服务，会随着终端关闭终止服务，可使用 PM2 管理：

```s
$ pm2 start verdaccio # 启动服务
$ pm2 list            # 查看服务列表
$ pm2 log <id>        # 查看日志
$ pm2 stop <id>       # 关闭服务
```

成功启动服务后 log 中会显示四条主要信息：

```shell
warn --- config file  - /root/.config/verdaccio/config.yaml      # 配置文件位置
warn --- Plugin successfully loaded: verdaccio-htpasswd          # 鉴权插件
warn --- Plugin successfully loaded: verdaccio-audit             # 审核依赖插件
warn --- http address - http://localhost:4873/ - verdaccio/5.0.1 # 服务入口
```

此时浏览器访问服务器的 4873 端口（云服务需确保在安全组开启该端口）可进入仓库的 Web 界面，当然了，目前还是比较简陋的。

### 配置 Verdaccio

Web 界面、插件、权限等基本配置都在启动时日志显示的配置文件中修改，编辑该文件为：

```yaml
# /root/.config/verdaccio/config.yaml

# 数据的存储位置
storage: /root/.local/share/verdaccio/storage
# 插件目录位置
plugins: ./plugins

# web 界面配置
web:
  # 网页标题
  title: Verdaccio
  favicon: https://xuezenghui.com/favicon.ico
  # web 界面语言
  i18n:
    web: zh-CN

auth:
  htpasswd:
    # 存储用户认证信息的文件地址
    file: ./htpasswd
    # 最大用户数，设为-1表示不允许自行注册
    max_users: 100

# 私有仓库没有找到包时的查找路径
uplinks:
  npmjs:
    url: https://registry.npmjs.org/

packages:
  '**':
    access: $all
    publish: $authenticated
    proxy: npmjs

server:
  keepAliveTimeout: 60

middlewares:
  audit:
    enabled: true

logs:
  - { type: stdout, format: pretty, level: http }
```

### 初始化组件仓库

接下来需要将上次封装好的组件发布到配置好的私有 npm 仓库中，具体步骤：

**1. 本地注册 Verdaccio 用户**

本地注册用户需执行 `$ npm adduser --registry <IP 地址:4873>` 并按提示输入用户名、密码和邮箱，完成后可在 Web 界面进行登陆查看仓库内容，也才能在本地发布/使用私有的 npm 包。

但我们不能允许任何人都可以注册用户，所以通常需要设置配置文件中的 `max_users` 属性为 -1 禁止自行注册，需要注册时建议使用官方工具 [Htpasswd Generator](https://hostingcanada.org/htpasswd-generator/) 创建密钥信息，由管理员添加进`htpasswd`文件中。

**2. 项目文件及配置**

先给公共组件项目创建软件包的代码仓库 `lib` 目录，创建 `lib/components.js` 文件来处理仓库中的 Vue 组件，文件内容与 `src/utils/global.js` ..基本..一致：

> 要注意的是`lib`目录里不能使用别名导入文件，比如表示 `src` 目录的 `@`，需替换成相对路径。

```js
import Vue from 'vue';
import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'

const requireComponent = require.context('../src/components', true, /\.vue$/);

requireComponent.keys().forEach(fileName => {
  const componentConfig = requireComponent(fileName);
  
  const componentName = upperFirst(camelCase(fileName.split('/').pop().replace(/\.\w+$/, '')));

  Vue.component(`Z${componentName}`, componentConfig.default || componentConfig)
});
```

将 Vuetify 配置一并导出，确保仓库中的组件与本地穿着同样的「衣服👔」：

```js
import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import '@mdi/font/css/materialdesignicons.css'
import '@/assets/sass/main.scss'

Vue.use(Vuetify);

const theme = {
  primary: '#6DA4D8',
  secondary: '#FDDB55',
  error: '#EF3A61',
  success: '#51AD5A',
  info: '#6DA4D8'
};

export const options = {
  theme: {
    themes: {
      dark: theme,
      light: theme,
    },
  },
  icons: {
    iconfont: 'mdi'
  }
}

export default new Vuetify(options);
```

创建包的入口文件 `lib/main.js`，引入样式和所有组件：

```js
import '../src/assets/sass/main.scss';
import './components';
```

然后在`package.json`文件中设置好包名`name`、版本号`version`等描述信息，添加`main`指定包的入口文件，添加`files`指定库中包含的文件目录，并修改属性`private`为`false`保证包可被发布，这部分与 npm 发布包一致，参考 [package.json | npm Docs](https://docs.npmjs.com/cli/v7/configuring-npm/package-json)。

```js
+- "private": false,
++ "main": "lib/main.js",
++ "files": [
++     "lib",
++     "src/assets",
++     "src/components"
++   ]
```

**3. 发布公共组件**

指定 register 地址发布包到私有仓库：

```s
$ npm publish --registry <IP 地址>
```

发布成功后会显示包的一些元数据：

![publish.webp](/images/private-npm:publish.webp "发布成功")

访问 Web 界面可看到包的基本信息：

![web.webp](/images/private-npm:web.webp "Web 界面")

---

当然了，组件库应该设置一定的读写权限来**控制包的使用和发布权限**，Verdaccio 中包的使用权限逻辑默认是这样的：

如果你配置了账户，那么你就能登入 Web 界面查看库中软件包的详细信息，有了包名和 registry 地址，你就能安装使用了。

权限在配置文件的`packages`下添加：

```yaml
packages:
  'my-components':
    # 使用权限
    access: $authenticated
    # 发布权限
    publish: zander
```

> 权限设为 `$all` 表示任何人对这个包有相关权限，`$authenticated`表示只有经过验证的有权限，此处发布权限设为了固定的用户，在进行 publish 操作时 Verdaccio 会根据用户注册时自动生成的`authToken`（可通过`$ npm config ls -l`命令查看）进行鉴权。

## 使用公共组件

OK，至此，NPM 私服就已经搭建完成了，而后其它项目中便可以像使用普通 npm 包一样简单地使用企业内部公共组件了，先安装组件 npm 包：

```s
$ npm install my-components --registry <IP 地址> -D
```

本案例中使用了 Vuetify 组件库，因此使用公共组件的项目中要正确显示组件样式需确保安装完整 Vuetify 的相关依赖，推荐使用 `$ vue add vuetify`。

最后，在 `src/main.js` 中引入组件：

```js
import 'my-components';
```

*Now, enjoy your components in the global Vue!*

```html
<z-btn large color="yellow">🎉🎉</z-btn>
```

## 结语
这篇文章拖了挺久的，学习和再总结的过程花费了不少时间，但工程化相关的探索似乎才刚刚开始，也如我所说，在项目迭代、人员变动等影响因素下去实际运用抽离的组件，推动团队的组件化进程才是步履维艰的。

组件管理也应有一个合理的流程，协调好 UI 设计者、组件开发者、测试者和使用者等参与人员的流程关系同样重要，我总结了一个组件定义的流程图，我们团队目前在遵循此流程：

![flow.png](/images/private-npm:flow.webp "共用组件定义流程")

另，本文涉及的代码位于我的 GitHub：

- [Xuezenghuigithub/my-storybook](https://github.com/Xuezenghuigithub/my-storybook)
