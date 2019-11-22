---
title: "组件管理工具Bit"
date: "2019-11-19T20:18:00+08:00"
tags: ["Bit"]
discripion: "组件管理工具Bit"
keywords: ["Bit", "组件管理"]
categories: ["Tech"]
dropCap: false
slug: "Bit"
gitinfo: true
---
## 对比Git你就知道Bit是什么了
**“Bit loves Git”**—— yep，这是[Bit官方文档](https://docs.bit.dev/docs/quick-start)的原话。[Git](https://git-scm.com/)大家再熟悉不过了，世界上最先进的分布式版本控制系统，且没有之一😏，“近朱者赤”，大概这就是Bit喜欢Git的原因了吧hhhh～😆

Just joking，其实是因为Bit的工作流和Git..很相似..，它也是一个**分布式管理工具**。

我们用Git来管理源文件、源代码，而Bit也是用来管理代码的，但不同的是Git不管你代码的语义结构，一股脑儿来进行管理，而Bit则是将代码..分组件..管理的，换句话说——**Bit用来管理组件**。

## 工作流

![bit_workflow.png](http://blog.xuezenghui.com/bit/bit_workflow.png "Bit Workflow")


Bit的工作流和Git怎么个类似法呢？

1. 首先，安装Bit后可以将本地的代码分组件发布到Bit Server中的Collection中，类比Git将本地仓库代码推送到远程仓库。

2. 在远程的Bit Server中可以预览、管理发布的组件，类比在GitHab、GitLub等代码管理工具上查看、管理远程仓库中的文件。

3. 可以在别的代码区直接引入发布的组件，当然，如果是团队开发，别人就可以引用你发布的组件，这点下文的案例中会说到。

***
那么这个Workflow的好处是什么呢？我们知道，现在每个前端都可以在嘴边挂着组件化、模块化，但是真正做到组件化、模块化开发的项目寥寥无几，比如我们的每个Vue项目中几乎都有components目录，但是其中的组件都和这个项目有着不可切割的关系，如果某天要把这个所谓的..公共组件..用于其它项目上就会发现——压根儿拔不动、抽不出。

但是，如果前端的工作方式都切换到Bit模式上，那么从发布方式、规范化、标准化等方面来说就没得挑，因为你发布的组件别人要用得上、可以用、用得爽啊！所以，从这里来看Bit的确可以**规范前端组件标准，有效解耦前端代码**。
***

## Vue.js中使用Bit

Bit用来管理组件，而任何的代码文件、函数、Vue组件、Angular组件、React组件、Node.js中的module都可以作为Bit组件，下面来看如何在Vue.js项目中使用Bit：

### 发布组件
1. 全局安装Bit

```s
npm install bit-bin -g
```

2. 初始化项目

```s
bit init
```

3. 跟踪组件

```s
bit add src/components/*    # 跟踪src/components目录下的所有组件
```

4. 设置组件版本

```s
bit tag --all 1.0.0  # 给跟踪的所有组件设置发布的版本号为1.0.0
```

5. 导出组件

    即发布到远程集合中，远程可以**预览**、**托管**、**组织**发布的组件，使得可以在其它项目和模块中快速发现和使用组件。


    - 在[bit.dev](https://bit.dev/)中申请账户

    - 创建一个公共的或私有的集合，用以存储组件

    - 在项目中使用`bit login`登录，Bit会自动打开浏览器进行身份验证😎

    - 导出/发布组件：
    ```s
    bit export user_name.collection_name
    ```

    - 在远程中可查看、管理发布的组件：

    ![components.png](http://blog.xuezenghui.com/bit/components.png "发布的组件")

### 使用组件

使用NPM或者Yarn是在其它项目中最方便快捷使用Bit组件的方式：

1. 配置npm的注册表

```s
npm config set '@bit:registry' https://node.bit.dev
```

2. 然后就可以像平常npm安装使用第三方包一样使用Bit组件：

```s
npm i @bit/zander.demo.zander
```

```vue
<!-- 要使用组件的项目下App.vue文件 -->
<template>
    <Zander><Zander>
</template>
<script>
import Zander from '@bit/zander.demo.zander'

export default {
  name: 'app',
  components: {
    Zander
  }
}
</script>
```

![use_components.png](http://blog.xuezenghui.com/bit/use_components.png "页面成功显示组件内容")

### 更新组件

在多人协作的项目中，使用[`bit import`](https://docs.bit.dev/docs/sourcing-components#importing-new-versions)命令可以直接在项目中更新对导入组件的更改，并在项目之间同步，当然，如果改动较大也可以选择将其发布为新的组件。

## 后记

首先，Bit的确是为前端组件化、代码片段管理提供了一套不错的解决方案，如果组件都能..跨项目..地去使用，而且只需要一行Bit命令就可以解决，既保证了开发的高效性，也能保证组件的整体质量及可复用性。

但是，Bit自2016年至今了，为何知名度如此之低，甚至在网上都搜集不到相关的资料，更别说在国内行业中的普及度了，这也不是没有原因的：
	
1. Bit不支持私有部署，也就是它学的是GitHub而不是GitLab；

2. 个人觉得Bit的组件管理、项目管理、权限管理功能还是需要有很大的提升，以至于目前用起它来好像[Codepen](https://codepen.io)这样的交流社区，而不是GitLab这样的项目开发、代码管理工具神器（但说不定哪天就有个BitLab呢？🤔）；

3. 要像普及Git一样普及Bit可能真的还有很长一段路要走。
