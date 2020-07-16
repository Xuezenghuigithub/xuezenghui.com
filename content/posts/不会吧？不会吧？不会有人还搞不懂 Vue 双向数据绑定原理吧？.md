---
title: "不会吧？不会吧？不会有人还搞不懂 Vue 双向数据绑定原理吧？"
date: "2020-07-14T09:04:24+08:00"
tags: ["Vue.js"]
keywords: ["Vue", "Two-way data binding"]
categories: ["Tech"]
dropCap: true
toc: true
slug: "principle-of-vue-two-way-data-binding"
---
> 我猜测这篇文章的访问量在博客 Analytics 的页面访问量榜单里应该是列位不低的，因为——我标题党了😳。

双向数据绑定一直被认为是各 MVVM 框架的核心特性，在开发中也是无时不刻都在使用。而我一直也是作为一个看客去了解别人博文中的 Vue 双向数据绑定，没有自己去深究并手动实现过（反省）。这篇文章，我将从..设计模式..、 ..技术原理..、 ..原生实现..等多个方面去解析 Vue 中的双向数据绑定，当然了，在 Vue3 发布之际，也应了解下 Vue3 下的双向数据绑定。

## 概述
在 MVVM 架构下，数据层 Model 和视图层 View 通过 View Model 层进行连接和交互，这个 ViewModel 即为连接视图和数据的桥梁，作数据和逻辑处理工作，指的正是**双向数据绑定**。

双向数据绑定实现的效果就是在更新 JavaScript 中的数据（定义的变量）时同步修改视图（DOM 节点），修改视图时也同步回数据层：

![show.gif](/images/two-way-data-binding:show.gif "双向数据绑定演示")

以一个开发者的角度应该不难想到，视图到数据方向的改动需要监听 DOM 的变化再同步赋值给 JavaScript 的变量，比如给 `<input>` 添加 `change` 或 `input` 监听事件并在事件处理函数中给变量赋值，实际这也正是 `v-model` 指令做的很重要的一件事。

另一个方向，关键词还是「监听」——监听 JavaScript 数据的变化，再去相应更新 DOM，此处的监听及处理就是 Vue 的双向数据绑定实现方式——**发布订阅模式** + **数据劫持**。

## 设计模式
发布订阅模式也称为观察者模式，是一种行为设计模式，设计意图也很明显了，允许定义一种..订阅..的机制，在对象发生一定的事件时通知观察着这个对象的其它对象。所以发布订阅模式一定存在以下三个模型对象：

- **目标对象**：被观察的对象。
- **发布者**：当目标对象发生变化时，向其他对象发出通知。
- **订阅者**：可以执行一些操作来反应发布者的通知。

真实世界中的发布订阅模式例子非常之多，比如你（订阅者）订阅了我的博客（目标对象），就毋需每次打开我的博客站点来查看是否更新了新博文，而我（发布者）会在每次发布新文章时都通过 RSS 在 RSS Feed Reader 等订阅工具上通知你。

换置到双向数据绑定中，订阅者就是一个用来操作各 DOM 节点的公共方法，需要观察数据的改动来改动自己（作出反应），数据就是被观察的目标对象，那发布者是谁呢？~~是尤大啊~~哈哈哈，其实是实现数据劫持的 `Object.defineProperty()` 方法。

## 技术原理
### Object.defineProperty()
实现数据劫持的核心方法就是 [`Object.defineProperty()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 了，它是 [ES5](http://www.ecma-international.org/ecma-262/5.1/index.html#sec-15.2.3.6) 加入的标准对象方法，作用是给一个对象添加或修改属性。我们平时添加/修改对象属性更多使用的是点语法：

```js
const obj = { name: 'Zander' };

obj.age = '18'; // 添加属性
obj.name = 'Bob'; // 修改属性
```

Object.defineProperty() 方法能让我们更细粒度地控制对象的属性，其可传入三个参数：

- **obj**：要操作的对象，Object 类型
- **prop**：要添加或修改的属性名，String 类型
- **descriptor**：属性描述符对象，Object 类型

`descriptor` 被称为属性描述符，个人觉得官方文档描述的有些难以理解，其实它就是对象属性的一个标签、一个定义，总共有两种标签类型：**数据描述符**和**存取描述符**，规定一个属性只能有一个标签，并且：

- 如果这个属性是数据描述符类型，那么它的 `descriptor` 对象不能设置 `get` 和 `set` 属性
- 如果这个属性是存取描述符类型，那么它的 `descriptor` 对象不能设置 `value` 和 `writable` 属性

`descriptor` 对象总共有这些属性：

- **configurable**：属性是否可被删除，默认为 `false`
- **enumerable**：属性是否可枚举，默认为 `false`
- **value**：属性对应的值
- **writable**：属性是否可重写，默认为 `false`
- **get**：属性的 getter 函数，用于读取属性的值
- **set**：属性的 setter 函数，用于设置属性的值

看实例：

```js
const obj = { name: 'Zander' };

// 添加具有数据描述符的属性，相当于 obj.age = 18
Object.defineProperty(obj, 'age', { 
  configurable: true, // 可删除
  enumerable: true, // 可枚举
  value: 18,
  writable: true // 可重写
})

// 添加具有存取描述符的属性
let age = 18;
Object.defineProperty(obj, 'age', {
  configurable: true,
  enumerable: true,
  get(){ return age },
  set(newVal){ age = newVal }
})
```

要着重看的是后者，具有存取描述符的属性的同样可以通过点语法来访问和重写属性的值，但是，是通过设置的 get 和 set 方法来实现的，这一点打印一下 `obj` 就可以验证：

![obj.png](/images/two-way-data-binding:obj.png "具有 get 和 set 实例方法的对象")

也就是说，无论是读取还是改动属性的值都会执行定义的方法，那……岂不是可以为所欲为了？比如在改动数据时作为发布者角色将改动通知给订阅者，数据劫持搞定？

### DocumentFragment
频繁地操作 DOM 节点会引起页面的重排及重绘，这会极大地影响页面性能，Vue 中进行模板的解析[^1]就需要操作 DOM，使用到了 [DocumentFragment](https://developer.mozilla.org/zh-CN/docs/Web/API/DocumentFragment) 文档片段接口，它相当于一个 HTML 节点的..容器..，让我们可以在处理完子节点后都先存入该容器中，最后一次性将容器内**所有的**子节点都添加或插入到真实的 DOM 中，从而将操作 DOM 的次数减少为只有一次，很大地提升了页面性能。

比如要给一个 ul 标签添加 10 个 li，你可能会这样做：

```html
<ul id="list"></ul>
```

```js
const names = ['Zander', 'Bob', 'Tom', 'Simon', 'Paul', 'Mary', 'Lisa', 'Ruth', 'Susan', 'Linda'];
const ul = document.getElementById('list');

names.forEach(name => {
  const li = document.createElement('li');
  li.innerHTML = name;
  ul.appendChild(li);
})
```

这就需要操作 DOM 多达 10 次，而使用 DocumentFragment 只需要操作一次 DOM：

```js
const names = ['Zander', 'Bob', 'Tom', 'Simon', 'Paul', 'Mary', 'Lisa', 'Ruth', 'Susan', 'Linda'];
const ul = document.getElementById('list');
const fragment = document.createDocumentFragment();

names.forEach(name => {
  const li = document.createElement('li');
  li.innerHTML = name;
  fragment.appendChild(li);
});
list.appendChild(fragment);
```

## 原生实现
### 极简实现
先不考虑设计模式种种，单单使用表单监听 + 数据劫持来实现极简的双向数据绑定：

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>Zander</title>
  </head>

  <body>
    <input type="text" id="input" />
    <p id="data"></p>
  </body>

  <script>
    const obj = {};
    const input = document.getElementById('input');
    // 数据劫持，实现数据->视图的绑定
    Object.defineProperty(obj, 'name', {
      configurable: true,
      enumerable: true,
      get() {
        return input.value;
      },
      set(newVal) {
        input.value = newVal;
        document.getElementById('data').innerHTML = newVal;
      }
    });
    // 监听输入框，实现视图->数据的绑定
    input.addEventListener('keyup', () => {
      obj.name = input.value;
    })
  </script>
</html>
```

![simple.gif](/images/two-way-data-binding:simple.gif "双向数据绑定极简实现")

### 较完整实现
从上面的极简实现可以总结一下实现双向数据绑定要注意的点：

1. 整个数据层应该是 **Object 类型**，才能对每个数据进行数据劫持（所以 Vue 组件中的 `data` 必须是个对象或函数）
2. 使用同一个数据的 DOM 节点可能是多个，也就是说目标对象和订阅者对象是**一对多**的关系

较完整的实现目标是这样的：

```html
<div id="app">
  <input type="text" v-model="name" />
  {{ name }}
</div>
```

```js
const vm = new ZVue({
  el: '#app', // 实例的挂载元素
  data: { // 数据
    name: 'Zander'
  }
});
```

综合以上，要实现双向数据绑定在编码层面我们需要：

- **Observer 观察者函数**：监听所有数据的变化，当数据变动时获取最新的值并通知给订阅者（数据劫持）
- **Watcher 订阅者函数**：当接受到观察者的通知和提供的数据后同步更新视图
- **Compile 解析器函数**：解析 DOM 元素上的 `v-model` 指令和 `{{}}` 语法

具体实现步骤：

**1. 维护一个订阅者..们..数组**

因为使用同一个数据的 DOM 节点可能是多个，所以需要维护一个订阅者..们..数组，`update()` 是订阅者的原型方法。

```js
class Dep {
  constructor(){
    this.subs = []; // 订阅者数组
  }

  /* 添加订阅者 */
  addSub(watcher){
    this.subs.push(watcher);
  }

  /* 通知订阅者 */
  notify(){
    this.subs.forEach(watcher => {
      watcher.update(); // 更新视图
    })
  }
}
```

**2. 实现 Observer 观察者函数**

```js
class Observer {
  constructor(data){
    this.observer(data);
  }

  /* data 处理 */ 
  observer(data){
    if (!data || typeof data !== 'object') return; // data 必须为 Object 类型
    for (const key in data) {
      this.defineReactive(data, key, data[key]);
      this.observer(data[key]); // 递归处理 data 中的 Object 类型
    }
  }

  /* 数据劫持 */ 
  defineReactive(obj, key, value){
    const that = this;
    const dep = new Dep(); // 每一个数据都对应一个订阅者们数组

    Object.defineProperty(obj, key, {
      configurable: true, // 可删除
      enumerable: true, // 可枚举
      get(){
        Dep.target && dep.addSub(Dep.target); // 每当 DOM 中使用该值时，添加一个订阅者
        return value;
      },
      set(newVal){
        if(newVal === value) return;
        that.observer(newVal); // 如果修改的新值是 Object 类型，递归进行数据劫持
        value = newVal;
        dep.notify(); // 通知所有订阅者数据更新了
      }
    })
  }
}
```

> 注意 `data` 必须是对象才能进行数据劫持，递归处理保证所有数据均被管理。

**3. 实现 Watcher 订阅者函数**

```js
class Watcher {
  constructor(vm, value, callback) {
    this.vm = vm; // 实例
    this.value = value; // 数据当前值
    this.callback = callback; // 调用的更新视图的方法
    this.oldValue = this.get(); // 数据的旧值
  }

  /* 获取数据旧值 */
  get() {
    Dep.target = this; // 将订阅者实例赋值给 target
    const value = compileUtils.getValue(this.vm, this.value);
    Dep.target = null;
    return value;
  
  /* 更新视图 */
  update() {
    const newVal = compileUtils.getValue(this.vm, this.value);
    const oldVal = this.oldValue;
    this.callback(newVal);
  }
}
```

**4. 实现 Compile 解析器函数**

```js
class Compile {
  constructor(el, vm) {
    this.el = this.isElementNode(el) ? el : document.querySelector(el);
    this.vm = vm;
    // 进行编译
    if (this.el) {
      // 使用文档片段存储节点
      let fragment = this.node2fragment(this.el);
      // 执行解析器函数，识别 v-model 和 {{}} 语法
      this.compile(fragment);
      // 将编译完成的节点插入到 DOM 中
      this.el.appendChild(fragment);
    }
  
  /* 判断传入的挂载元素是否是 HTML 元素 */
  isElementNode(node) {
    return node.nodeType === 1;
  
  /* 将 el 中的节点放入文档片段中 */
  node2fragment(el) {
    const fragment = document.createDocumentFragment()
    while (el.firstChild) {
      // 是子节点才插入
      fragment.appendChild(el.firstChild);
    }
    return fragment;
  
  /* 编译节点 */
  compile(fragment) {
    let childNodes = Array.from(fragment.childNodes)
    childNodes.forEach((node) => {
      if (node.nodeType === 1) {
        // 元素节点
        this.compileElement(node);
      } else if (node.nodeType === 3) {
        // 文本节点
        this.compileText(node);
      } else {
        return;
      }
    });
  
  /* 编译元素，识别 v-model  */
  compileElement(node) {
    const attrs = Array.from(node.attributes); // 获取元素绑定的所有属性
    attrs.forEach((attr) => {
      if (attr.name.includes('v-')) {
        // 判断是否为自定义的指令
        const value = attr.value; // 属性的值
        let type = attr.name.split('-')[1];
        compileUtils[type](node, this.vm, value);
      }
    });
  
  /* 编译文本，识别 {{}} */
  compileText(node) {
    const reg = /\{\{([^}]+)\}\}/g; // {{}} 正则表达式
    const value = node.textContent;
    if (reg.test(value)) {
      compileUtils['text'](node, this.vm, value);
    }
  }
}
```

**5. 编译中使用的具体方法**

```js
const compileUtils = {
  /* 获取 data 中数据对应的值 */
  getValue(vm, value) {
    value = value.split('.'); // 所有的数据都是 data 的属性
    return value.reduce((prev, next) => prev[next], vm.$data);
  }

  /* 获取编译后的文本内容 */
  getTextValue(vm, value) {
    return value.replace(/\{\{([^}]+)\}\}/g, (...arguments) =>
      this.getValue(vm, arguments[1])
    );
  }

  /* 给数据设置新值 */
  setVal(vm, value, newValue) {
    value = value.split('.');
    return value.reduce((prev, next, currentIndex) => {
      if (currentIndex === value.length - 1) {
        return (prev[next] = newValue);
      }
      return prev[next];
    }, vm.$data);
  }

  /* v-model 处理*/
  model(node, vm, value) {
    const doUpdate = this.updater.modelUpdater; // 定义更新视图的方法
    new Watcher(vm, value, (newValue) => {
      // 实例化一个观察者
      doUpdate && doUpdate(node, this.getValue(vm, value));
    });
    // 绑定 input 事件，输入值时更新数据
    node.addEventListener('input', (e) => {
      const newValue = e.target.value;
      this.setVal(vm, value, newValue);
    });
  }

  /* 文本处理 */
  text(node, vm, value) {
    const doUpdate = this.updater.textUpdater; // 定义更新视图的方法
    const pureValue = this.getTextValue(vm, value); // 获取 {{}} 内的纯值
    value.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
      // 实例化一个观察者
      new Watcher(vm, arguments[1], (newValue) => {
        doUpdate && doUpdate(node, this.getTextValue(vm, value));
      });
    });
    doUpdate && doUpdate(node, pureValue);
  }

  /* 更新 DOM */
  updater: {
    textUpdater(node, value) {
      node.textContent = value;
    },
    modelUpdater(node, value) {
      node.value = value;
    },
  },
};
```

**6. 初始化 ZVue，添加代理**

因为数据都挂载在了 `$data` 对象上，要访问需要通过 `this.$data.name` 方式访问，而要通过 `this.name` 方式访问需要添加一层代理，原理还是 `Object.defineProperty`：

```js
class ZVue {
  constructor(options) {
    this.$el = options.el;
    this.$data = options.data;
    if (this.$el) {
      new Observer(this.$data);
      this.proxyData(this.$data);
      new Compile(this.$el, this);
    }
  }

  /* 将 this.$data 上的数据代理到 this 上 */
  proxyData(data) {
    Object.keys(data).forEach((key) => {
      Object.defineProperty(this, key, {
        get() { return data[key] },
        set(newValue) {
          data[key] = newValue;
        },
      });
    });
  }
}
```

**7. 实例化，挂载数据**

```js
const vm = new ZVue({
  el: '#app',
  data: {
    name: 'Zander'
  }
});
```

![result.gif](/images/two-way-data-binding:result.gif "双向数据绑定较完整实现")

## Vue3 扩展
> "Bye Object.defineProperty!"[^2]

Vue3 在数据劫持上选择了比 Object.defineProperty() 效率更高、性能更优的 [Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)。Proxy 对象的专属功能就是属性的查找、赋值、函数调用等，实例化时需要两个参数：

- **target**：目标对象，可以是 Object、Array、Function 等类型。
- **handler**：由处理函数组成的对象，处理函数是一系列操作目标对象时触发的钩子函数。

简单使用 Proxy 实现数据劫持：

```js
const obj = {
  name: 'Zander',
  age: 18,
  hobbies: {
    sport: 'running',
    game: 'LOL'
  }
}

const proxy = new Proxy(obj, {
  get(target, propertyKey, receiver){ // 分别为需要取值的目标对象、需要获取的键值、当前 proxy 实例（可选）
    console.log(`读取了${propertyKey}属性的值`);
    return Reflect.get(target, propertyKey, receiver); // 通过函数调用实现取值，详见 MDN
  },
  set(target, propertyKey, value, receiver){ // 分别为设置属性的目标对象、属性名称、设置的值、当前 proxy 实例（可选）
    console.log(`设置了${propertyKey}属性的值`);
    Reflect.set(target, propertyKey, value, receiver);
  }
})

proxy.age; // log: 读取了age属性的值

proxy.hobbies.game = 'MineSweeper'; // log: 读取了hobbies属性的值
```

Proxy 的一些妙处：

1. Proxy 的监听目标是..整个对象..，而 Object.defineProperty() 一次只能操作..一个对象的一个属性..，要监听整个对象需要多层的迭代和递归。

2. Object.defineProperty() 无法监听..数组类型..属性的变化[^3]，但 Proxy 🉑️。

3. 可操作的钩子函数有 ..13.. 个之多。

## References & Resources

1. [Vue.js 技术揭秘 | HuangYi](https://ustbhuangyi.github.io/vue-analysis/)
2. [观察者模式 | Refactoring.Guru](https://refactoringguru.cn/design-patterns/observer)

[^1]: 将 HTML 模板转换为 [AST](https://zh.wikipedia.org/wiki/%E6%8A%BD%E8%B1%A1%E8%AA%9E%E6%B3%95%E6%A8%B9) 的过程，比如解析 Vue 中的 `{{}}` 语法。

[^2]: 见尤玉溪 Vue3.0 Updates 主题演讲 [PPT](https://docs.google.com/presentation/d/1yhPGyhQrJcpJI2ZFvBme3pGKaGNiLi709c37svivv0o/edit#slide=id.g42acc26207_0_129)。

[^3]: Vue2 中的解决方法是重写数组的操作方法，详见 [Github](https://github.com/vuejs/vue/blob/dev/src/core/observer/array.js)，但通过下标修改数组的情况仍无法监测。