---
title: "前端工程化之定制 Vue CLI"
date: "2020-09-22T15:12:22+08:00"
tags: ["Vue", "前端工程化"]
discripion: "定制Vue CLI，添加需要的依赖项，自行组织页面等"
keywords: ["定制化", "自定义", "Vue CLI"]
categories: ["Tech"]
slug: "custom-vue-cli"
gitinfo: true
comments: true
toc: true
---
## 前言
想来也算来有一段时间没有更博了，总是在有一些想法的时候被各种乱七八糟的事情打乱，具体说来话长了，不如这样总结吧——..职能有变..， ..有好有坏..。虽然能用来自我支配的时间变少了，但也不算毫无收获，列出几条最近做的还算系统性的工作：

1. 编写产出团队开发协作规范
2. 关于 UI 零件化的思考及简报分享
2. 抽离封装前端共用组件，发布至 [Storybook](http://eportal-guide.belstar.com.cn/)
3. 定制适用于团队的 Vue CLI

之所以说这几件事比较系统化是因为我统一把它们归在了**前端工程化**这一类别中，目的都是“统一开发模式，简化开发过程”。当然，工程化这一议程和工作并不是一蹴而就的，工程化过程中产出成果是一回事，推广整个团队遵循各 Guidelines 又是另外一回事了。索性过程中是有一些比较有意义的成果可以拿出来记录分享的，比如本文要详述的**如何定制适用于自己/团队的 Vue CLI**。

---

[Vue CLI](https://cli.vuejs.org/zh/) 一定都不陌生了，Vue 官方提供的脚手架工具，是一套包含集成、构建、插件配置、图形化等功能的完整工具集。官方脚手架的目的是更轻量更简单，追求使用的..广度..，也就是要适用更多的开发者，当面临下面问题时就稍显无力，需要开发者做更多的工作，甚至是反复的更多工作：

1. 团队对项目目录结构有严格的规范要求
2. 定制化要求比较高，如需要使用特定的 UI 框架及工具类库
3. 项目配置文件较多，如 ESLint 配置项、Apollo 配置项等
4. 项目内包含预定义的共用组件
5. 懒……

## 定制 Vue CLI
定制化的 Vue CLI 是基于 Vue CLI 的，所以开展之前应确保本地安装了 Vue CLI 并可以使用 `$ vue create <porect_name>` 命令成功创建项目。实现的原理是 [Vue CLI preset](https://cli.vuejs.org/zh/guide/plugins-and-presets.html#preset)，即在创建新项目时使用预定义的配置和要用到的插件，而这些预定义的内容支持放在 Git 上（包括 GitHub、GitLab 等），使用远程仓库中的 Preset 创建 Vue 项目时需要加入特殊的选项：

```s
# GitHub
$ vue create --preset <username>/<repo> <vue_project_name>

# GitLab 私有服务器
$ vue create --preset gitlab:<my-gitlab-server.com>:<group>/<project_name> --clone <vue_project_name>
```

### 初始化 Preset 目录结构
以 GitLab 为例，创建一个新的 Project 后 clone 到本地，第一步需要初始化项目的目录结构，一般 Preset 由以下四个部分组成，当然加上 README 更好了：

```
.
├─ template/
│   └─ ...
├─ generator.js
├─ preset.json
├─ prompts.js
└─ README.md
```

> 开发的时候需要频繁地执行创建项目的命令来测试改动，使用 Git 仓库无疑太麻烦了，Vue CLI 也支持根据本地的文件来创建项目：
>
> ```shell
> $ vue create --preset ./<my_preset> <project_name>
> ```

### 添加预定义文件
preset.json 是使用 `$ vue create` 命令时自动生成的预定义选项的 JSON 文件，MacOS 中位于 `~/.vuerc`。文件中定义的内容在命令行中不再提示，比如执行 `$ rm ~/.vuerc` 删除该文件后执行 `$ vue create hello` 会提示是否使用淘宝的 NPM 镜像提升下载速度及使用 Yarn or NPM 作为包管理工具，创建完项目后查看 .vuerc 文件的内容会显示选择的内容：

```json
{
  "useTaobaoRegistry": true,
  "packageManager": "yarn"
}
```

并且之后创建项目时采用该预定义项，不再进行提示。所以可根据自己的需求来定义需要添加哪些插件，以及一些简单的配置项：

```json
{
  "useConfigFiles": true,
  "cssPreprocessor": "sass",
  "plugins": {
    "@vue/cli-plugin-babel": {},
    "@vue/cli-plugin-router": {
      "historyMode": true
    },
    "@vue/cli-plugin-vuex": {},
    "@vue/cli-plugin-eslint": {
      "config": "prettier",
      "lintOn": [ "save", "commit" ]
    }
  }
}
```
### 定义模板文件

`template/` 目录用来定义使用脚手架创建 Vue 项目后生成的目录结构，即模板，比如我们团队的要求的目录是这样的：

```
.
├── build/              # 生成压缩包
├── public/             # 静态资源，不需要 webpack 处理
│   ├── favicon.ico
│   └── index.html
└── src/
│   ├── assets/
│   │   ├── fonts/      # 字体文件
│   │   ├── images/     # 图片文件
│   │   └── styles/     # reset 样式，及定义的常量文件等
│   ├── components/     # 共用组件
│   │   └── base/       # 全局注册组件
│   ├── layout/         # 整体布局组件
│   ├── plugins/        # 插件文件
│   ├── filters/        # 全局过滤器
│   ├── router/         # 路由及拦截器
│   ├── store/          # 管理 vuex 全局状态
│   ├── utils/          # 工具类函数
│   ├── views/          # Vue 页面
│   │   └── Home.vue
│   ├── App.vue
│   └── main.js
├── .eslintrc.js        # ESLint 配置
├── .gitignore          # Git 忽略文件配置
├── .prettierrc.js      # Prettier 代码风格配置
├── babel.config.js     # Babel 配置
├── README.md
└── vue.config.js       # Webpack 配置
```

template 目录下定义的目录和需要的目录一致即可，有几点需要注意：

1. 如果模板中没有定义 Vue CLI 本身就会生成的文件，则默认采用原来的，如 `view/` 目录下的 Home.vue 和 About.vue 等（也可以选择删除所有默认生成的文件，下面会说到）
2. 以 `.` 开头的模板文件需要将 `.` 改为 `_`，以 `_` 开头的模板文件要定义成 `__`，否则无法正确渲染[^1]
3. 空文件夹不会被正确渲染

还有一处踩的坑耗费了不少时间，因为我们项目中添加并配置了 Vuetify，需要在 main.js 中引入并注册到 Vue 实例中，但如果将整个文件替换为新的内容，会报错 router、store 等..重复定义..。经验证发现**在 preset.json 中预定义的插件，不需要在模板下的 main.js 中自行导入和注册**，只需要添加需要的内容即可，如：

```js
// 路径：template/src/main.js

import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

import vuetify from './plugins/vuetify';

new Vue({
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
```

因为 preset.json 中预定义了 vue-router 和 vuex，最终生成的 main.js 是完整的：

```js
import Vue from 'vue';
import App from './App.vue';
import store from './store';

Vue.config.productionTip = false;

import vuetify from './plugins/vuetify';
import router from './router';

new Vue({
  store,
  vuetify,
  router,
  render: h => h(App)
}).$mount('#app');
```

### 扩展依赖包
genarator.js 文件用来为项目添加其它依赖，比如 UI 框架、工具类库等等，渲染 template 模板的操作也需要在该文件内完成。

文件内需要导出一个函数，包含三个参数：

- api：[generator 实例](https://cli.vuejs.org/dev-guide/generator-api.html)，函数中可以操作该实例，比如扩展依赖、检查插件、查看版本等
- options：定制 Vue CLI 时与交互式命令行结合使用，接收答案参数
- rootOptions：预定义的所有内容，也就是 preset.json 中的所有内容，并且包含项目名称、src/main.js 中配置的说明等：

  ```js
  {
    projectName: 'my-vue',
    useConfigFiles: true,
    cssPreprocessor: 'sass',
    plugins: {
      '@vue/cli-plugin-babel': {},
      '@vue/cli-plugin-router': { historyMode: true },
      '@vue/cli-plugin-vuex': {},
      '@vue/cli-plugin-eslint': { config: 'prettier', lintOn: [Array] },
      '/Users/zander/Desktop/zander-vue-cli': { _isPreset: true, prompts: true }
    },
    'src/main.js': Set(2) { 'router', 'store' }
  }
  ```

**1. 添加依赖项**

为项目添加脚本和依赖项需要使用 generator 实例的 [extendPackage()](https://cli.vuejs.org/dev-guide/generator-api.html#extendpackage) 方法，内容和 package.json 无异，根据依赖的类型声明 NPM 包名和版本即可，创建项目时会自行安装声明的依赖项：

```js
module.exports = (api, options, rootOptions) => {
  api.extendPackage({
    scripts: {
      "serve": "vue-cli-service serve",
      "build": "vue-cli-service build",
      "lint": "vue-cli-service lint"
    },
    dependencies: {
      "vue": "^2.6.11",
      "vuetify": "^2.3.2",
      "@mdi/font": "^5.5.55"
    },
    devDependencies: {
      "@babel/core": "^7.11.4",
      "@babel/preset-env": "^7.11.0",
      "@vue/cli-service": "~4.5.0",
      "vue-cli-plugin-vuetify": "^2.0.5",
      "vuetify-loader": "^1.3.0",
      "sass": "^1.26.10",
      "sass-loader": "^8.0.2"
    }
  });
};
```

**2. 渲染模板**

使用 [render()](https://cli.vuejs.org/dev-guide/generator-api.html#render) 方法来渲染 template 中定义的模板，该方法实际使用 EJS 进行渲染，可以传入一个相对路径的字符串，会将原本的目录直接替换，也可以传入 hash 对象，文件对应文件来渲染（不能是文件夹），写多个 rander 函数的话依次执行：

```js
  api.render('./template');

  api.render({
    './.eslintrc.js': './template/_eslintrc.js',
    './.gitignore': './template/_gitignore'
  })
```

**3. 修改主文件**

使用 API 同样可以实现对主文件 main.js 内容的修改，但……实在是有些复杂呢🤪，感兴趣的可参考[官方文档](https://cli.vuejs.org/zh/dev-guide/plugin-dev.html#%E4%BF%AE%E6%94%B9%E4%B8%BB%E6%96%87%E4%BB%B6)，个人觉得还是按上面的方式在模板里更改更方便，推荐🎉。

### 交互式命令行
很多命令行操作都涉及对话的情境，比如 Git 操作、各种 CLI 操作，看起来是比较 Geek 的，其实现原理是 Node.js 的交互式命令行 [Inquirer.js](https://github.com/SBoudrias/Inquirer.js)。要想自定义 Vue CLI 的对话内容需要用到 prompts.js 文件，该文件内应导出一个与 `inquirer.prompt()` 参数相同数据结构的..数组..，数组内每一个对象都作为一个命令行中的问题[^2]：

```js
module.exports = [
  {
    type: "confirm", // 问题类型
    name: "vuex", // 存储答案的 key
    message: "是否使用 vuex 进行全局状态管理?", // 问题的内容
    default: false, // 未选择时的默认值
    choices: [
      {
        name: '是', // 选项
        value: true // 选项对应的 value
      },
      {
        name: '否', // 选项
        value: false // 选项对应的 value
      }
    ]
  }
]
```

在命令行创建项目时 Preset options 阶段会进行交互式的对话：

![prompt.png](/images/vue-cli:prompt.png "交互式命令行")

当然，完成对话后应该按照不同的答案执行不同的操作，上面 genarator.js 文件中的函数的 `options` 参数就起到作用了，可以在函数中打印 options 参数，答案以 Key-value 的形式保存在一个对象内：

```json
{ vuex: true }
```

那么就可以根据该对象结合 generator 实例的各方法来操作了：

```js
if (options.vuex) {
  api.extendPackage({ // 添加依赖
    dependencies: {
      "vuex": "^3.4.0"
    }
  })

  api.injectImports(api.entryFile, `import store from './store'`); // main.js 中导入

  api.render({'./src/store/index.js': './template/store/index.js'}); // 渲染 store 文件
}

api.render('./template/default'); // 默认渲染的内容
```

此时虽然使用 `injectImports()` 方法导入了 store 到 main.js，但还没有注册到 Vue 实例中。因为 render() 的实质是通过 EJS 来渲染，所以可以在文件中使用 EJS 的语法实现更细粒度的控制：

```js
// 路径：template/default/src/main.js
import Vue from 'vue';
import App from './App.vue';

Vue.config.productionTip = false;

import vuetify from './plugins/vuetify';

new Vue({
  vuetify,
  <%_ if (options.vuex) { _%>
  store,
  <%_ } _%>
  render: (h) => h(App),
}).$mount('#app');
```

---

其实能自定义的内容还有很多，比如二次封装 axios、添加 NPM 私服的依赖等等，这也是我还正在做的事情，🚩后续将补充到此处~

## References & Resources
1. [github.com/cklwblove/vue-cli3-template | GitHub](https://github.com/cklwblove/vue-cli3-template)
2. [如何使用 vue-cli 3 的 preset 打造基于 git repo 的前端项目模板 | SegmentFault](https://segmentfault.com/a/1190000016389996)


[^1]: 见 [Vue CLI | 文件名的边界情况](https://cli.vuejs.org/zh/dev-guide/plugin-dev.html#%E6%96%87%E4%BB%B6%E5%90%8D%E7%9A%84%E8%BE%B9%E7%95%8C%E6%83%85%E5%86%B5)说明。

[^2]: 更多选项内容见 [Inquirer.js](https://github.com/SBoudrias/Inquirer.js#objects)。