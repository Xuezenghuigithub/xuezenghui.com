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
<img src="http://blog.xuezenghui.com/GraphQL/spaceX.jpeg" width=400 title="大火箭🚀">

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
        flight_number: { type: GraphQLInt, description: '发射编号' },
        mission_name: { type: GraphQLString, description: '任务代号' },
        launch_date_local: { type: GraphQLString, description: '发射时间' },
        launch_success: { type: GraphQLBoolean, description: '是否成功' },
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

![graphql_demo1.png](http://blog.xuezenghui.com/GraphQL/graphql_demo1.png)

- 查询想要的更多数据：

![graphql_demo1.png](http://blog.xuezenghui.com/GraphQL/graphql_demo2.png)

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

![graphql_demo1.png](http://blog.xuezenghui.com/GraphQL/graphql_demo3.png)

## GraphQL + NodeJS + MongoDB
![graphql&node&mongodb.jpeg](/images/graphql:graphql&node&mongodb.jpeg "GraphQL + NodeJS + MongoDB")

上述实例只是验证了 GraphQL 中的强大查询可以通过 Query 轻松地实现，但还有两件事需要去做：①连接数据库使用自己的数据；②新增、更新、删除操作。下面通过一个综合实例来完成这两点：

> 某些操作上方实例中已涉及到，此处不再赘述😑

### 设置项目
**1. 搭建项目目录**

使用 express-generator 搭建项目，添加`/models`目录定义 MongoDB 集合的模型，添加`/graphql/schema.js`目录来完成 GraphQL 相关操作，最终目录结构：
```
.
├─ app.js
├─ bin/
│   └─ www
├─ package.json
├─ node_modules
├─ public
├─ images
├─ javascripts
├─ stylesheets/
│   └─ style.css
├─ models/
│   ├─ author.js
│   └─ book.js
├─ graphql/
│   └─ schema.js
└─ views/
    ├─ error.pug
    ├─ index.pug
    └─ layout.pug
```

**2. 安装所需依赖项**
```s
$ npm i express-graphql graphql mongoose --save
```
### 连接数据库并定义集合的模型
**1. 使用 Mongoose 连接 MongoDB**
```js
// 文件位置：app.js

const mongoose = require('mongoose');

mongoose.set('useFindAndModify', false);
mongoose.connect('mongodb://127.0.0.1:27017/demo', {
  useNewUrlParser: true
})
mongoose.connection.on('connected', function () {
  console.log('连接成功');
})
mongoose.connection.on('error', function () {
  console.log('出错');
})
mongoose.connection.on('disconnected', function () {
  console.log('连接断开');
})
```
**2. 定义 Mongoose 数据模型**

```js
// 文件位置：models/author.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const authorSchema = new Schema({
    "name": String,
    "age": Number
});

module.exports = mongoose.model("Author", authorSchema, 'authors');
```
```js
// 文件位置：models/book.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bookSchema = new Schema({
    "name": String,
    "page": Number,
    "authorId": { type: mongoose.Types.ObjectId }
});

module.exports = mongoose.model("Book", bookSchema, 'books');
```

### 在 GraphQL 请求中获取数据

Express 中传统的 RESTful 接口使用`express-router`来管理路由，并在不同路由中完成相应的数据库操作，而要结合 GraphQL 就不能使用这种方式了，需要使用 GraphQL 中的方法管理所有的 HTTP 请求，然后在 GraphQL 的接口中完成相应的数据库操作。

**1. 定义请求入口，使用 GraphQL 管理所有的 HTTP 请求**

**2. 定义 GraphQL 的 Schema**

此处的 Schema 才真正决定请求返回的是怎样的数据结构，与 Mongoose 的 Schema 完全不同，后者实际只是为了定义 Model 完成数据库操作，比如`author`集合中本没有`books`字段，而在 GraphQL 的 Schema 中定义以后客户端就可以拿到定义的相应数据。

```js
// 文件位置：graphql/schema.js

const graphql = require('graphql');

const Author = require('../models/author'); // 引入作者模型
const Book = require('../models/book'); // 引入书籍模型

const { // 定义GrapQL中Schema的类型
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull
} = graphql;

// 定义Book的Schema，决定了其可以返回的数据包括哪些
const BookType = new GraphQLObjectType({
  name: 'Book',
  description: "书籍信息",
  fields: () => ({
    id: {
      type: GraphQLID,
      name: "id"
    },
    // _id: {
    //   type: GraphQLID,
    //   name: "也是id吗？"
    // },
    name: {
      type: GraphQLString,
      name: "书名", // 此处的name用于在GraphiQL Query栏输入字段时显示
      description: "书名" // 此处的description用于在GraphiQL Docs中显示
    },
    page: {
      type: GraphQLInt,
      name: '页数',
      description: '页数'
    },
    author: {
      type: AuthorType,
      name: '书的作者',
      description: '书的作者',
      resolve(parent, args) {
        return Author.findById(parent.authorId);
      }
    }
  })
})

// 定义Author的Schema
const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: "作者信息",
  fields: () => ({
    id: {
      type: GraphQLID
    },
    name: {
      type: GraphQLString,
      name: '作者名',
      description: '作者名'
    },
    age: {
      type: GraphQLInt,
      name: '作者年龄',
      description: '作者年龄'
    },
    books: {
      type: new GraphQLList(BookType),
      name: '著作',
      description: '著作',
      resolve(parent, args) {
        return Book.find({
          authorId: parent.id
        });
      }
    }
  })
})

```

1. 字段的`name`属性和`description`属性可设置在 GraphiQL 的 Query 栏中输入字段时或在 Docs 中显示对应的说明

2. `resove()`方法才是掌控返回具体数据的关键，如果不设置则根据字段名对应，`BookType`的`author`字段和`AuthorType`的`books`字段都是通过`resove()`进行了数据的关联，常用参数： 
	- `parent`：上一级对象，如 `author` 字段`resove()`中的`parent`为 `Book`，`parent.authorId`即为 book 集合中的`authorId`字段
	- `args`：请求的参数，通常在 Query 和 Mutation 操作中使用

**3. 定义具体请求方法**

GraphQL 中的 Mutation 操作用于对数据进行新增、更改和删除操作，用法与  Query 类似。

```js
const RootQuery = new GraphQLObjectType({ // 相当于js中定义了一个对象，然后在对象中添加各种方法
  name: 'RootQueryType',
  fields: {
    books: {
      type: new GraphQLList(BookType),
      description: '获取所有的书籍信息', // 此处的description用于在GraphiQL Query中显示
      resolve() {
        return Book.find({});
      }
    },
    book: {
      type: BookType,
      description: '根据书名获取书籍信息',
      args: { // 定义参数
        name: {
          type: GraphQLString
        }
      },
      resolve(parent, args) {
        return Book.findOne({
          name: args.name
        });
      }
    },
    author:{
      type: AuthorType,
      description: "根据作者id获取作者信息",
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
          return Author.findById(args.id);
      }
    },
    authors:{
        type: new GraphQLList(AuthorType),
        description: "获取所有作者信息",
        resolve(parent, args) {
            return Author.find({});
        }
    }
  }
})

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addAuthor: {
      type: AuthorType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) }, //GraphQLNonNull作用与Mongoose Schema中的required类似，设置参数为必须值
        age: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve(parent, args){
        let author = new Author({
          name: args.name,
          age: args.age
        })
        return author.save();
      }
    },
    updateAuthor: {
        type: AuthorType,
        args: {
          name: { type: new GraphQLNonNull(GraphQLString) },
          age: { type: new GraphQLNonNull(GraphQLInt) }
        },
        resolve(parent, args){
          let updateObj = {
            name: args.name,
            age: args.age
          }
          return Author.findOneAndUpdate({ name: args.name }, updateObj);
        }
    },
    deleteBook: {
      type: BookType,
      args: {
        name: { type: GraphQLString }
      },
      resolve(parent, args){
        return Book.deleteOne({ name: args.name });
      }
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
```
### 执行请求

- 查询所有作者信息：
![query-authors.png](/images/graphql:query-authors.png)

- 根据书籍名查找书籍信息：
![query-book.png](/images/graphql:query-book.png)

- 新增作者：
![add-author.png](/images/graphql:add-author.png)

- 更新作者信息：
![update-author.png](/images/graphql:update-author.png)

- 删除作者：
![delete-book.png](/images/graphql:delete-book.png)

---
- [DataLoader](https://github.com/graphql/dataloader)