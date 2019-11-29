---
title: "GraphQL"
date: "2019-11-28T13:04:32+08:00"
tags: ["GraphQL"]
discripion: "GraphQL学习笔记"
keywords: ["GraphQL"]
categories: ["Tech"]
dropCap: true
toc: true
slug: "GraphQL"
gitinfo: true
---

## 前言
<center>**“一种用于API的查询语言。”**</center>

---

🌚看到 [GraphQL 官网](https://graphql.cn/)的这句介绍大概人人都是一脸懵逼的，写过 API、用过数据库查询语言，还就没见过..用于 API 的查询语言..。大概是因为我们平常所见的大多都是 [RESTful API](http://www.ruanyifeng.com/blog/2011/09/restful.html)，而大量 B/S 模式的应用程序也让我们只倾向于「客户端发送请求获取数据，服务端处理请求返回数据」、客户端与服务端交互的方式只能利用 [HTTP 协议](https://zh.wikipedia.org/wiki/%E8%B6%85%E6%96%87%E6%9C%AC%E4%BC%A0%E8%BE%93%E5%8D%8F%E8%AE%AE#HTTP/2)中 GET、POST、PUT、DELETE 等 HTTP 动词的传统认知。

而 GraphQL 正是要打破这种认知的技术。在 GraphQL 中，客户端可以..不多不少..地获得其想要的数据，因为 GraphQL 中控制返回数据的是客户端，而不是 RESTful API 中完全取决于服务端（前端出人头地的时候到了😂）。其次，前端与后端交互的方式也由 HTTP 动词转变为 GraphQL 提供的 [Query](https://graphql.cn/learn/queries/) 和 [Mutation](https://graphql.cn/learn/queries/#mutations)。

![graphql_address.png](http://blog.xuezenghui.com/GraphQL/graphql_address.png "GraphQL 在应用中所处的位置")

## 使用方法

---

开始之前先推荐一个开放 API——美国太空探索技术公司 [spaceX](https://www.spacex.com/) 提供的[开源 REST API](https://github.com/r-spacex/SpaceX-API)，应有尽有的数据，详细完整的文档，还支持一键导入 Postman😏。
<img src="http://blog.xuezenghui.com/GraphQL/spaceX.jpeg" width=400>

---

## 服务端使用——Node.js

### 初始化

1. 使用`express 项目名`搭建脚手架

2. 安装使用GraphQL需要的依赖项：

```
npm install graphql express-graphql axios

```

> 此处安装axios是为了直接发送请求获取数据，也可选择使用Postman中的GraphQL测试

3. 在`app.js`文件中设置路由，表示所有的客户端请求都由GraphQL的requst handler处理

```javascript
const graphqlHTTP = require('express-graphql');
const schema = require('./schema');

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}));
```

> graphqlHTTP是grapql的http服务，用于处理graphql的查询请求，它接收一个options参数，其中schema是一个 GraphQLSchema实例，graphiql设置为true可以在浏览器中直接对graphQL进行调试。

4. 新建`schema.js`文件，定义两个数据模型：LaunchType（发射）和 RocketType（火箭）

```js
const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLBoolean, GraphQLList, GraphQLSchema } = require('graphql');

const LaunchType = new GraphQLObjectType({
  name: 'Launch',
  fields: () => ({
    flight_number: { type: GraphQLInt },
    mission_name: { type: GraphQLString },
    launch_date_local: { type: GraphQLString },
    launch_success: { type: GraphQLBoolean },
    rocket: { type: RocketType },
  })
});

const RocketType = new GraphQLObjectType({
  name: 'Rocket',
  fields: () => ({
    rocket_id: { type: GraphQLString },
    rocket_name: { type: GraphQLString },
    rocket_type: { type: GraphQLString }
  })
});
```

> schema中的数据类型要使用GraphQL提供的类型系统中的类型，不能使用javascript中的数据类型

5. 使用axios发送请求获取spaceX官方API的数据

```js
const axios = require('axios');

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    launches: {
      type: new GraphQLList(LaunchType),
      resolve(parent, args) {
        return axios.get('https://api.spacexdata.com/v3/launches').then(res => res.data);
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery
});
```

> RootQuery是所有查询的入口，用于处理并返回数据

### 使用GraphiQL查看效果

项目文件夹下`npm start`，浏览器中输入[ http://localhost:5000/graphql ](http://localhost:5000/graphql)(需要在/bin文件夹下的`www`文件中指定端口号)启动GraphiQL

- 查询所有的`flight_number`:

<img src="pics/graphql/graphql_demo1.png" width=750>

- 查询想要的更多数据：

<img src="pics/graphql/graphql_demo2.png" width=750>

### 指定参数实现单条数据查询

`schema.js`：

```js
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        ...
        launch: { // 新的schema
            type: LaunchType,
            args: { // 添加参数
                flight_number: {
                    type: GraphQLInt
                }
            },
            resolve(parent, args) {
                return axios.get(`https://api.spacexdata.com/v3/launches/${args.flight_number}`).then(res => res.data);
            }
        }
    }
});
```

<img src="pics/graphql/graphql_demo3.png" width=750>

## 前端——Vue

待续...

***

- [GraphQL官方文档](https://graphql.cn/)