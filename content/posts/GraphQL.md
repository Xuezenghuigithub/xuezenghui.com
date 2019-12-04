---
title: "GraphQL——用于 API 的查询语言"
date: "2019-11-28T13:04:32+08:00"
tags: ["GraphQL"]
discripion: "GraphQL学习笔记"
keywords: ["GraphQL"]
categories: ["Tech"]
dropCap: true
toc: true
slug: "GraphQL"
gitinfo: true
comments: true
---

## 前言
<center>**“一种用于API的查询语言。”**</center>

---

🌚看到 [GraphQL 官网](https://graphql.cn/)的这句介绍大概人人都是一脸懵逼的，写过 API、用过数据库查询语言，还就没见过**用于 API 的查询语言**。大概是因为我们平常所见的大多都是 [RESTful API](http://www.ruanyifeng.com/blog/2011/09/restful.html)，而大量 B/S 模式的应用程序也让我们只倾向于「客户端发送请求获取数据，服务端处理请求返回数据」、客户端与服务端交互的方式只能利用 [HTTP 协议](https://zh.wikipedia.org/wiki/%E8%B6%85%E6%96%87%E6%9C%AC%E4%BC%A0%E8%BE%93%E5%8D%8F%E8%AE%AE#HTTP/2)中 GET、POST、PUT、DELETE 等 HTTP 动词的传统认知。

而 GraphQL 正是要打破这种认知的技术。在 GraphQL 中，客户端可以..不多不少..地获得其想要的数据，因为 GraphQL 中控制返回数据的是客户端，而不是 RESTful API 中完全取决于服务端（前端出人头地的时候到了😂）。其次，前端与后端交互的方式也由 HTTP 动词转变为 GraphQL 提供的 [Query](https://graphql.cn/learn/queries/) 和 [Mutation](https://graphql.cn/learn/queries/#mutations) 等。

![graphql_address.png](http://blog.xuezenghui.com/GraphQL/graphql_address.png "GraphQL 在应用中所处的位置")

## 实例体验

---

开始之前先推荐一个开放 API——美国太空探索技术公司 [SpaceX](https://www.spacex.com/) 提供的[开源 REST API](https://github.com/r-spacex/SpaceX-API)，应有尽有的数据，详细完整的文档，还支持一键导入 Postman😏。
<img src="http://blog.xuezenghui.com/GraphQL/spaceX.jpeg" width=400>

---

**1. 使用 [express-generator](http://www.expressjs.com.cn/starter/generator.html) 搭建项目**

**2. 安装使用 GraphQL 需要的依赖**

```s
$ npm install graphql express-graphql axios
```

此处安装 [axios](http://www.axios-js.com/) 是为了直接在后台发送请求获取数据，也可选择使用 Postman 中的 GraphQL 功能测试。

[express-graphql](https://github.com/graphql/express-graphql) 可将 Express 服务端中的 HTTP 请求使用 GraphQL 管理。


**3. 管理 HTTP 请求**

在`app.js`文件中设置路由，表示所有的客户端请求都由 GraphQL 的 `requst handler` 处理：

```js
const graphqlHTTP = require('express-graphql');
const schema = require('./schema');

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
  })
);
```

`graphqlHTTP()`用于处理 GraphQL 的查询请求，它接收一个 options 参数，其中 `schema` 是一个 GraphQL Schema 实例，[`graphiql`](https://github.com/graphql/graphiql) 设置为 `true` 可以在浏览器中直接对 GraphQL 进行调试。


**4. Schema**

[Schema](https://spec.graphql.cn/#sec-Type-System-) 是 GraphQL 的类型系统，用于参数验证和返回数据格式的设定，共有8种类型。

新建`schema.js`文件，定义两个对象类型：LaunchType 和 RocketType：

```js
const { GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLBoolean, GraphQLList, GraphQLSchema } = require('graphql');

const LaunchType = new GraphQLObjectType({
    name: 'Launch',
    description: '发射的相关数据💨',
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
    description: '火箭的相关数据🚀',
    fields: () => ({
        rocket_id: { type: GraphQLString },
        rocket_name: { type: GraphQLString },
        rocket_type: { type: GraphQLString }
    })
});
```

**5. 获取数据，定义查询入口**

使用 axios 发送 HTTP 请求获取 SpaceX 官方 API 的数据，定义`RootQuery`作为所有查询的入口，处理并返回数据（此举实为模拟从数据库中获取数据）：

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

**6. 使用 GraphiQL 测试**

项目文件夹下`npm start`，浏览器中输入 [http://localhost:5000/graphql ](http://localhost:5000/graphql)（端口号可在/bin目录夹下`www`文件中自行指定）启动 GraphiQL。

- 查询所有的`flight_number`:

![graphql_demo1.png](http://blog.xuezenghui.com/GraphQL/graphql_demo1.png "查询结果")

- 查询想要的更多数据：

![graphql_demo1.png](http://blog.xuezenghui.com/GraphQL/graphql_demo2.png "查询结果")

**7. 指定参数实现单条数据查询**

```js
// schema.js
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        ...
        launch: { // 新的查询
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

![graphql_demo1.png](http://blog.xuezenghui.com/GraphQL/graphql_demo3.png "查询结果")
