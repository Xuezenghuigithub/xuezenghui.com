---
title: "Bit"
date: "2019-11-19T20:18:00+08:00"
tags: ["Bit"]
description: "不知道能不能🔥起来的组件管理工具"
keywords: ["Bit", "组件管理", "前端组件化"]
categories: ["Tech"]
toc: true
slug: "bit"
---
## 前言
现在几乎每个前端都可以在嘴边挂着组件化、模块化，但是真正做到组件化、模块化开发的项目..寥寥无几..。比如我们接触的每个 Vue 项目中几乎都有 `components` 目录，但是其中的 Vue 组件都和这个项目有着不可切割的关系，如果某天要把这个所谓的..公共组件..用于其它项目上，就会发现——压根儿拔不动、抽不出。

究其根本，造成这个不理想的结果原因很多。代码层面上，不同项目中的 UI 设计风格不同、组件中包含特定项目的依赖（如各种 UI 框架）、组件之间存在复杂的相互依赖关系，都导致组件难以抽离；人为层面上，开发人员在组件化开发概念上不够深入、组件的拆分上做的并不合理，也让组件化的发展停滞不前，而更重要的一个原因在于**没有一个合适的用来管理组件的工具**，组件化很关键的一个因素在于组件的管理，包括组件的发布、修改、详细使用文档、demo 展示等，而现有的代码管理工具如 Git、NPM 却很难在..组件..的层面上有效管理代码。

## Bit 来了
[Bit](https://docs.bit.dev/docs/quick-start) 是一个强大的组件协作平台，它能跨项目、跨存储库地隔离并管理组件，可在众多框架及工具中使用，如 React、Vue、Angular、Node.js、[Mocha](https://mochajs.org/)、[Jest](https://jestjs.io/) 等。

**“ *Bit loves Git* ”**—— yep，这是 Bit 官方文档的原话。[Git](https://git-scm.com/) 大家再熟悉不过了，世界上最先进的 DVCS[^1]，「近朱者赤」，大概这就是 Bit 喜欢 Git 的原因了吧 hhhh～😆

Just joking ，其实是因为 Bit 的工作流和 Git ..很相似..，我们通常用 Git 来管理源文件、源代码，而 Bit 也是用来管理代码的，但不同的是 Git 不管你代码的语义结构，一股脑儿来进行管理。而 Bit 则是将代码..分组件..管理的，换句话说—— **Bit 用来管理组件**。

[^2]![workflow.png](/images/bit:workflow.svg "Bit workflow")

Bit 的工作流和 Git 怎么个类似法呢？

1. 首先，安装 Bit 后可以将本地的代码分组件发布到 Bit Server 中的 Collection 中，类比 Git 将本地仓库代码推送到远程仓库。

2. 在远程的 Bit Server 中可以预览、管理发布的组件，类比在 GitHub、GitLab 等代码管理工具上查看、管理远程仓库中的文件。

3. 可以在别的代码区安装并引入发布的组件，可跨机器使用、跨项目使用，甚至跨语言使用已发布的组件，这点和 NPM 的方式倒很类似，继续往下看你会发现 Bit 和 NPM 确是有着千丝万缕的关系。

## 安装
**使用 NPM/Yarn 安装：**

```s
$ npm install bit-bin -g
$ yarn global add bit-bin
```

**MacOS 也可使用 Homebrew 安装：**

```s
$ brew install bit
```
## 使用 Bit 管理 Vue 组件
组件，简单点说就是**可重复使用的代码段**，包含但不限于：

- React、Vue、Angular 组件
- 公共样式文件，如 CSS、SCSS 文件
- 重复使用的函数、方法

当 Bit 存储一个组件时会存储这段代码的三个元素：

**1. 源代码**

源代码是组件内容的根本，Bit 将源代码映射到组件并指定一个 `main` 文件作为组件的入口。

**2. 依赖关系图**

这是 Bit 的一个强大特性，当源代码保存为 Bit 组件时，Bit 会分析其中包含的所有依赖项（即代码中的 `import` 和 `require` 语句），然后创建一个组件的依赖关系图，这样，即使组件被抽离，它也是独立的，因为所有的依赖项都会被记录追踪。

---
<center>**两点说明**</center>

1⃣️ Bit 可追踪的依赖项只包含使用 NPM 安装的依赖和安装/使用的 Bit 组件，就是说项目中直接通过绝对/相对路径引入的本地组件..不被包含..在依赖项内，如 `import Utils from './utils.js'`，那如果组件在另一个项目中使用不就找不到引入的文件了吗🤔️？当然，Bit 从根本上避免了这种情况的产生——需要将引入的本地组件与主组件同步追踪才可发布👍。

2⃣️ 如果要发布的组件中使用了第三方 UI 框架（如 Vuetify 中特有的标签 `v-card` 等），Bit 并不会自动分析出它依赖了这个 UI 框架，而是可以直接发布，但在使用此组件的项目中需要安装对应的 UI 框架才能正确显示 Bit 组件。

---

**3. 工具与配置**

Bit 还会将组件特有的工具和配置保存下来，比如组件使用的编译器和测试工具等。

### 发布组件
**1. 初始化项目**

```s
$ bit init
```

当运行 `init` 命令时，Bit 会在项目中创建三个资源：

- `bit config`：位于 `(package.json ? package.json : bit.json)` 中，Bit 工作区配置文件，包括导入组件默认保存的文件夹、包管理工具[等配置项](https://docs.bit.dev/docs/conf-bit-json)。
- `.bit` 目录：Bit 的工作区，之后创建和导入的组件信息都位于此目录中。
- `.bitmap`：Bit 组件图，描述了组件和组成组件的文件之间的链接关系。

> 导入指使用 `bit import` 命令将远程的组件添加到工作区，而使用 NPM/Yarn 安装的 Bit 组件只是常规的包，两者有着很大的区别，详询 [Imported Components](https://docs.bit.dev/docs/workspace#imported-components)。

**2. 跟踪组件**

跟踪操作将本地项目中的一个或多个文件转换为了 Bit 组件，然后会保存上面提到的三个元素。如：`$ bit add src/components/HelloWorld.vue --id my-hello`

```s
$ bit add <file_path> --id <component_id>
```

如果一个文件内通过 `require` 或 `import` 引入了另一个文件，只需将它们一同跟踪，Bit 会自动分析他们之间的依赖关系：

```s
$ bit add src/components/father.vue src/components/son.vue --id father-son
```

也可直接跟踪一个目录下的所有组件：

```s
$ bit add src/components/* --namespace hello
```
添加 `--namespace hello` 选项意为使用 hello 作为 `src/components/` 目录下所有跟踪组件的父级目录，即生成的组件名为 `hello/filename1`、`hello/filename2`。

**3. 设置组件版本**

```s
$ bit tag --<component_id> <version>
```

执行此操作后 Bit 会锁定该组件的依赖项版本，运行编译并测试该组件（可使用 `--verbose` 选项查看组件测试结果），如果编译测试通过则会设置组件的版本并自动标记依赖于该组件的组件。如：`$ bit tag --my-hello 1.0.0`

使用 `$ bit untag <component_id> <version>` 命令可取消设置的版本号。

**4. 导出组件**

导出组件即把组件上传到远程仓库中，远程仓库分两种，一种是 Bit 提供的组件中心 [bit.dev](https://bit.dev/)，在组件中心中可以**预览**、**托管**、**组织**发布的组件，功能强大；还有一种是自己搭建的 Bit Server，下文会详细讲述。先来看如何导出到可以白嫖的 bit.dev 中：

1. 在 [bit.dev](https://bit.dev/) 中申请账号

2. 创建一个公共的或私有的集合，用以存储组件

3. 在项目中使用 `$ bit login` 登录，Bit 会自动打开浏览器进行身份验证😎

4. 发布组件：

    ```s
    $ bit export <user_name>.<collection_name>
    ```

### 查看、管理组件

始言之，「组件化一个很关键的因素在于组件的管理」，Bit 在这点上的优势就在于——**bit.dev**，在平台上可以浏览、使用所有公开的组件，有点像 [Codepen](https://codepen.io)。也可以管理自己已发布的组件，包括编辑组件文档，查看各个版本组件的代码、参数、依赖关系、安装命令等等，还可以在 Playground 中实时编辑、预览组件效果（这点太棒了，但是中文在缩略图上显示异常😡）：

![preview.png](/images/bit:preview.png "预览")

**但是**，可惜的是 bit.dev 的目标是成为用来托管组件的 SaaS[^3]，也就是说它是用来赚钱的。普通用户只可创建三个私有集合，要想一刀999级就要付费了，而且价格还不低——$200/month……

### 安装并使用组件

**1. 安装组件**

如果**将组件发布至 bit.dev**，那么使用 NPM 或者 Yarn 是在其它项目中最方便快捷安装使用 Bit 组件的方式，安装组件的命令位于 bit.dev 中组件页面的右上角。

第一步需要在 NPM 注册表中配置 `@bit`：

```s
$ npm config set @bit:registry https://node.bit.dev
```

然后就可以像 NPM/Yarn 安装第三方包一样安装 Bit 组件了：

```s
$ npm i @bit/zander.hello.my-hello
$ yarn add @bit/zander.hello.my-hello
```

使用也是同样简单：

```vue
<template>
  <v-app>
    <top-bar />
    <v-content text-center>
      <v-row class="text-center mt-10">
        <v-col cols="12">
          <my-hello msg="使用组件😉" />
          <father-test />
          <vuetify />
        </v-col>
      </v-row>
    </v-content>
  </v-app>
</template>

<script>
import TopBar from "@bit/zander.hello.top-bar";
import MyHello from "@bit/zander.hello.my-hello";
import FatherSon from "@bit/zander.hello.father-son";
import Vuetify from "@bit/zander.hello.vuetify";

export default {
  name: "App",
  components: {
    TopBar,
    MyHello,
    FatherSon,
    Vuetify
  }
};
</script>
```

![use.png](/images/bit:use.png "页面成功显示组件内容")

**2. 导入组件**

导入组件指将远程组件的所有信息下载到本地，包括组件的源代码、依赖项等，导入的文件位于配置文件 `package.json` 中 `componentsDefaultDirectory` 项定义的目录中。

> 在其它项目中要想使用发布在 Bit Server 中的组件只能..导入组件..，而不能使用 NPM or Yarn 的方式。如果是在新项目中第一次..导入.. Bit 组件需先运行 `$ bit init` 命令。

```s
$ bit import <user_name>.<collection_name>/<component_id>
```

可加入组件固定版本，如 `$ bit import zander.hello/my-hello@1.0.1`，不加则默认导入最新版本。

同样的，使用组件的方式还是引入再使用，不过不能直接引入组件的路径，引入组件的全名即可（`package.json` 中的名字）：

```js
import myHello from "@bit/zander.hello.my-hello";
```

### 更新组件
更新组件有两个角度，一种是远程的组件更新了，使用该组件的项目需要同步更新；另一种是在使用组件的项目中需要对导入的组件进行更改并上传至远程。

**1. 更新本地组件**

本地的组件要想同步远程的更新直接使用导入命令即可，组件的最新版本会被自动导入：

```s
$ bit import <component_id>
```

**2. 修改组件并更新至远程**

项目中如果修改了通过 `$ bit import` 导入的组件就需要将组件更新至远程，这样其它使用者才可同步此修改。

当修改组件后运行 `$ bit status` 命令会提示 modified components 的相关信息，此时可为组件设置新的版本：

```s
$ bit tag <component_id> <new_version>
```

然后将其重新导出到远程集合中：

```s
$ bit export <user_name>.<collection_name>
```
### 弃用或删除组件
当不使用一个组件的时候有两种选择：

**1. 弃用该组件**

弃用组件意味着 Bit 会将其标记为“已过时”，但不会影响组件正常使用。

```s
$ bit bit deprecate <user_name>.<collection>/<component_id> --remote
```

**2. 删除组件**

删除一个组件需要考虑是否有其它组件依赖此组件，所以一定要慎重操作。

```s
$ bit remove <user_name>.<collection>/<component_id> --remote
```

### Bit Server
TODO:..

### 常用命令
|Command|Function|Options|
|:-:|:-:|:--|
|[`bit init`](https://docs.bit.dev/docs/apis/cli-all#init)|初始化 Bit 环境|`--package-manager`：设置包管理工具|
|[`bit login`](https://docs.bit.dev/docs/apis/cli-all#login)|登录到远程||
|[`bit logout`](https://docs.bit.dev/docs/apis/cli-all#logout)|注销已登录账号||
|[`bit list`](https://docs.bit.dev/docs/apis/cli-all#list-1)|显示远程和本地所有组件||
|[`bit status`](https://docs.bit.dev/docs/apis/cli-all#status)|查看工作区中被跟踪组件的状态||
|[`bit add <file_path> --id <component_id>`](https://docs.bit.dev/docs/apis/cli-all#add)|追踪组件|`--id`：指定组件 ID<br>`--namespace`：设置命名空间<br>`--exclude`：排除文件|
|[`bit untrack <component_id>`](https://docs.bit.dev/docs/apis/cli-all#untag)|取消追踪组件||
|[`bit show <component_id>`](https://docs.bit.dev/docs/apis/cli-all#show)|查看组件的依赖关系||
|[`bit diff <component_id>`](https://docs.bit.dev/docs/apis/cli-all#diff)|比较更改前后组件的变化||
|[`bit log <component_id>`](https://docs.bit.dev/docs/apis/cli-all#log)|查看组件各版本信息||
|[`bit tag <component_id> <version>`](https://docs.bit.dev/docs/apis/cli-all#tag)|设置组件版本号|`--message`：版本描述<br>`--all`：为所有新增和修改的组件设置|
|[`bit untag <component_id> <version>`](https://docs.bit.dev/docs/apis/cli-all#untag)|取消设置的版本号|`--all`：取消设置的所有组件的版本号|
|[`bit export <user_name>.<collection_name>`](https://docs.bit.dev/docs/apis/cli-all#export)|导出到远程|`--eject`：导出后将本地代码替换成该组件<br>`--all`：导出所有|
|[`bit import <user_name>.<collection_name>/<component_id>`](https://docs.bit.dev/docs/apis/cli-all#import)|导入组件||
|[`bit deprecate <component_id>`](https://docs.bit.dev/docs/apis/cli-all#deprecate)|弃用组件|`--remote`：同时从远程弃用|
|[`bit remove <component_id>`](https://docs.bit.dev/docs/apis/cli-all#remove)|删除组件|`--remote`：同时从远程删除|

## 总结
首先，Bit 的确是为前端组件化、代码片段管理提供了一套不错的解决方案，如果组件都能..跨项目..地去使用，而且只需要一行 Bit 命令就可以解决，既保证了开发的高效性，也能保证组件的整体质量及可复用性。

如果前端的工作方式都切换到 Bit 模式上，那么从发布方式、规范化、标准化等方面来说就没得挑，因为你发布的组件别人要用得上、可以用、用得爽啊！所以，从这里来看 Bit 的确可以**规范前端组件标准，有效解耦前端代码**。

但是，以 Bit 目前的知名度和普及度来看，它还有很长的路要走，这也不是没有原因的：
	
1. bit.dev 不开源，自行搭建的 Bit Server 功能实在是太有限了，这点真的是太失望了🙍‍♂️……

2. Bit 没有像 GitHub、GitLab 这样的可以以项目为单位管理组织代码的机制，以至于看起来像是 Codepen 这样的交流社区。

3. 权限管理功能欠缺。

[^1]: 分布式版本控制系统，Distributed Version Control Systems。
[^2]: 图源：[https://docs.bit.dev/docs/quick-start](https://docs.bit.dev/docs/quick-start)
[^3]: Software-as-a-Service，软件即服务，一种软件应用模式。