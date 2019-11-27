---
title: "踩坑 MongoDB 条件查询"
tags: ["MongoDB"]
date: "2019-10-16T00:00:00+08:00"
discripion: "踩坑 MongoDB 条件查询$gt"
keywords: ["MongoDB", "条件查询", "$gt"]
categories: ["Tech"]
dropCap: false
slug: "MongoDB-query-$gt"
---
## Bug复现

> 后台使用 Node.js + Express + Mongoose

项目中需要用到 MongoDB 的条件查询`$gt`，用法也很简单：
```js
SinglePrints.find({
     "last_day_click": {
         $gt: thisPrint // 查询大于thisPrint值的数据
     }
 }, (err, data) => {
     if (err) {
         console.log(err);
         return;
     }
     res.json({
         status: 200,
         result: data
     })
})
```
***
更新于2019/11/9，发誓..再也不写回调..后的我回来更新此处代码了🌚：
```js
router.get('/', async (req, res) => {
    let thisPrint = req.query.thisPrint;
    let result = await SinglePrints.find({
        "last_day_click": {
            $gt: thisPrint // 查询大于thisPrint值的数据
        }
    });
    return res.json({
        status: 200,
        data: result
    });
})
```
***
而且强大的地方还在于无论这里的`thisPrint`类型是`Number`还是`String`，MongDB会自动识别为`Number`类型来和数据库中的字段进行比较。

那么问题出在哪里呢？当`thisPrint`的值小于1000时，查询的结果是没有任何问题的，但如果大于1000条件筛选就会失效。
## Figure out
这种看似和筛选条件大小有关系的 bug 实则非也，而是和**数据库中需要比对的字段的类型**有关，也就是上述例子中`last_day_click`存储类型的原因。当类型为`String`时就会发生偶尔失效的状况，这就要求在存储这个字段的时候将它存为`Number`类型，即在 Mongoose 的`Schema`中将其类型定义为`Number`。