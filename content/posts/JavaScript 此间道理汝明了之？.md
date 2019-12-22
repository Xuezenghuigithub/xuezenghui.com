---
title: "JavaScript 此间道理汝明了之？"
date: "2019-11-27T13:04:32+08:00"
tags: ["JavaScript"]
discripion: "前端开发中常遇到的错误写法总结"
keywords: ["JavaScript", "前端", "踩坑"]
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
    1. [Set 和 Map 数据结构 | ECMAScript 6 入门(阮一峰)](http://es6.ruanyifeng.com/#docs/set-map#Set)
    2. [数组的扩展 | ECMAScript 6 入门(阮一峰)](http://es6.ruanyifeng.com/#docs/array#%E6%89%A9%E5%B1%95%E8%BF%90%E7%AE%97%E7%AC%A6)

### 利用短路语法替代令人厌烦的条件语句
