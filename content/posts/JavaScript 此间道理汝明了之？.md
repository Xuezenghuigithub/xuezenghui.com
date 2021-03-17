---
title: "JavaScript 此间道理汝明了之？"
date: "2019-11-27T13:04:32+08:00"
tags: ["JavaScript"]
keywords: ["JavaScript", "前端", "踩坑", "性能优化"]
categories: ["Tech"]
dropCap: true
toc: true
slug: "JavaScript-note"
gitinfo: true
comments: true
---
## 前言
了解了语法拿来就用？搜到了例子照搬不误？NoNoNo！作为21世纪的前端新势力应该树立“书写合格且优雅的规范代码”之最佳典范，高举“大前端是未来趋势”之伟大旗帜，秉持“JavaScript 是世界上最好的语言”之行业思想……以下关于 JavaScript 中各语法在各业务情境中的使用都是博主一坑一坑踩过来的🥺，一为..记录..，二为..分享..，愿我们下（qiāo）笔（xià）写（jiàn）出（pán）的都是极具可读性、可扩展性和良好健壮性的高质量代码。

> 🍽食用方法：正文中的三级标题为用法的简要，..🤔..后是该用法的原理及相关思考，..🔗..为推荐阅读的相关链接。

## 干货
### 创建空对象的正确方式—`Object.create(null)`
- 🤔：JavaScript 编程中的最佳实践，`Object.create(null)`创建的对象不会继承 Object 原型的`toString()`、`hasOwnProperty()`等方法，真正的..空对象..，干净而优雅🤤～而使用`{}`则反之。

- 🔗：
    1. [详解 Object.create(null) | 掘金](https://juejin.im/post/5acd8ced6fb9a028d444ee4e)

### 慎用`delete`来删除对象的属性
- 🤔️：JavaScript V8 引擎内部机制导致`delete`操作会先耗费大量时间去检查对象中的各个属性，从而大大影响程序的执行速度。简单的方式是直接将不需要的属性设为`undefined`，但这种方式实际只保证了属性不显示，而不是真正意义上的..删除..（会导致 [ESlint](https://eslint.bootcss.com/) 报错），Lodash 的 [pick()](https://www.lodashjs.com/docs/latest#_pickobject-props) 或 [omit()](https://lodash.com/docs/4.17.15#omit) 方法实为最优解。

- 🔗：
    1. [Slow delete of object properties in JS in V8 | Stack Overflow
](https://stackoverflow.com/questions/43594092/slow-delete-of-object-properties-in-js-in-v8/44008788)
    2. [为什么说在 JS 中要避免使用 delete | SegmentFault](https://segmentfault.com/a/1190000020081647)

### 最优雅地实现数组去重并排序
```js
arr = [...new Set(arr)].sort((a, b) => a - b);
```
- 🤔：ES6 中的`Set`数据结构类似于数组，其内所有元素的值都是唯一的，不含重复值，扩展运算符`...`将 Set 实例转为了数组，然后再用数组排序方法`sort()`进行从小到大的排序。

- 🔗：
    1. [Set 和 Map 数据结构 | ECMAScript 6 入门 - 阮一峰](http://es6.ruanyifeng.com/#docs/set-map#Set)
    2. [数组的扩展 | ECMAScript 6 入门 - 阮一峰](http://es6.ruanyifeng.com/#docs/array#%E6%89%A9%E5%B1%95%E8%BF%90%E7%AE%97%E7%AC%A6)

### 利用短路语法替代简单的条件语句
```js
if (zander === 'developer') {
  console.log('He is cool!');
}
// ⬇️
zander === 'developer' && console.log('He is cool!');
```
```js
const length = (zander || []).length;
```
- 🧐：`&&`运算保证第一个参数为 true 时才会执行后面的代码，`||`运算保证第一个参数为 false 时才会执行后面的代码。短路运算的效率略高于`if`条件语句，但只适用于简单的`if..do...`语句优化，如参数验证、设置默认值等。

- 🔗：
    1. [逻辑运算符 | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Logical_Operators)

### 高效地格式化数字
```js
const toDecimalMark = num => num.toLocaleString('en-US');

toDecimalMark(19971122.05); // '19,971,122.05'
```

- 🧐：这是一个格式化数字函数，可将数字高效地转换为逗号分隔的数字..字符串..，而不用写一堆正则去处理。`toLocaleString()` 是 ECMAScript 中的标准方法，用于返回特定语言环境下格式化后的字符串。

- 🔗：
    1. [Number.prototype.toLocaleString() | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/toLocaleString)

### 根据对象的 Value 获取对应的 Key
```js
function getKey(obj, value, compare = (a, b) => a === b) {
  return Object.keys(obj).find(element => compare(obj[element], value));
}
```

- 🧐：要通过 Value 找到 Key 是离不开遍历的，先使用 `Object.keys()` 方法返回对象可枚举属性组成的数组，数组的 `find()` 方法可在遍历时完成键值的匹配。但这只针对无相同 Value 的对象，否则只会返回匹配到的第一个 Key，如果没有匹配到的 Key 则返回 `undefined`。

- 🔗：
    1. [Object.keys() | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)
    2. [Array.prototype.find() | MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/find)

### 最平滑之滚动

```js
const scrollToTop = () => {
  const c = document.documentElement.scrollTop || document.body.scrollTop;
  if (c > 0) {
    window.requestAnimationFrame(scrollToTop);
    window.scrollTo(0, c - c / 8);
  }
}
```

- 🧐：`scrollTop` 获取了当前滚动条距离顶部的垂直距离，如果这个距离大于 0，调用神奇的 `requestAnimationFrame` API，它传入一个回调函数，让..浏览器..根据其重绘周期和屏幕帧数来执行回调、一帧一帧地更新动画，使动画更平滑，而这里的动画就是 `scrollTo`——滚动事件。（注：使用此方法需考虑[兼容性问题](https://caniuse.com/?search=requestAnimationFrame)）

- 🔗：
    1. [Element.scrollTop | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/scrollTop)
    2. [window.requestAnimationFrame | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame)
    3. [requestAnimationFrame 详解以及无线页面优化 | 前端开发博客](http://caibaojian.com/requestanimationframe.html)