---
title: "JSON Web Token"
date: "2020-03-02T05:29:45+08:00"
tags: ["JWT", "Node.js"]
keywords: ["JWT", "认证", "jsonwebtoken"]
categories: ["Tech"]
slug: "jwt"
toc: false
comments: true
dropCap: true
---
## 前言
几乎任何的现代商用网站都离不开..用户认证..，先来一段 Rap 解释一下用户认证——你说你是客户端，名叫小憨憨，你问服务端怎么看，它说这事儿必须验，你证明了自己有点儿憨，它把数据放心传……🤤也就是说，认证是为了**保证服务端把数据安全、正确地传递给客户端**。

身份认证的方式有基于 Cookie 的认证，如 Session，还有基于 Token 的认证，最著名也是最常用的就是 [JSON Web Token](https://jwt.io/)（简称 JWT）了。

## JSON Web Token
首先要明确的还是概念，JSON Web Token 并不是一项依赖于哪个编程语言的技术，而是一套开放的标准（[RFC 7519](https://tools.ietf.org/html/rfc7519)），是一种技术实现的规范，依赖 JWT 思想规范的各种库才是具体的技术实现，如 [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)、[express-jwt](https://github.com/auth0/express-jwt) 等。JWT 定义了一种简洁且独立的方式，用于在客户端和服务端之间安全地传输 JSON 格式的数据。

### JWT 原理
![flow.png](/images/jwt:flow.png "JWT 原理")

1. 客户端用户使用用户名和密码通过 POST 请求登录或注册

2. 服务端确认用户合法，生成一个 JWT

3. 将 JWT 返回给客户端，客户端将其保存在本地（一般保存在 [localStorage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage) 中）

4. 之后客户端向服务端发送 HTTP 请求需要将 JWT 加入请求头中

5. 服务器解析 JWT，检查是否合法且有效

6. 根据检查结果对客户端做出响应

### JWT 结构
服务端生成的 JWT 是一段很长的字符串，由三部分组成，分别为 Header（头部）、Payload（负载）和 Signature（签名），中间用`.`分隔：

![jwt.png](/images/jwt:jwt.png "JWT")

**1. Header**

头部 Header 是经过 Base64Url[^1] 编码的 JSON 对象：

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

其中，`alg`是 JWT 所使用的签名算法，默认为`HS256`，`typ`即 Token 的类型。

**2. Payload**

负载 Payload 是一个包含传递数据的 JSON 对象，同样经过了 Base64Url 编码，包含以下可选属性：

- iss：发行人
- sub：主题
- aud：受众群体
- exp：到期时间
- nbf：生效时间
- iat：签发时间
- jti：JWT ID

> 详情请参考 [Registered Claim Names](https://tools.ietf.org/html/rfc7519#section-4.1)。

Payload 中的属性也可以自行添加，但由于 JWT 的内容对任何人都可见，除非对 JWT 进行二次加密，否则不能将任何机密的数据写入其中。

**3. Signature**

Signature 签名操作是在获取到了 Header 和 Payload 后进行的，比如 Header 中指定的是 HS256 算法，那么会通过以下方式创建 Signature：

```
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  secret)
```

其中的`secret`为保存在服务端的密钥，一般需要定期更新。完成签名后就将这三部分拼接在一起返回给客户端：

```js
JWT = `${Header}.${Payload}.${Signature}`;
```
## NodeJS 中实现 JWT
JWT 在各种语言中都有实现，如 java-jwt、angular2-jwt、go-jwt-middleware 等，更多的实现可在 [auth0-docs](https://auth0.com/docs/) 中查看，此处以 NodeJS 中的实现 [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) 为例进行用户的认证。

### 初始化项目
先使用 [express-generator](https://github.com/expressjs/generator) 创建项目，安装需要的依赖：

```s
npm install mongoose jsonwebtoken --save
```

连接 MongoDB 后添加 users 集合的数据库模型：

```js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    "username": { type: String, required: true },
    "password": { type: String, required: true },
});

module.exports = mongoose.model("User",userSchema, "users");
```

### 生成 JWT
为了更好地复用，完成一个公共的生成 JWT 方法：

```js
const jwt = require('jsonwebtoken');
const secret = "zander";

function createJWT(username, sub, exp, strTimer) {
  const jwt = jwt.sign({
    user: username, // 用户名
    sub: sub // 主题
  }, secret, {
    expiresIn: `${exp}${strTimer}` // 过期时间
  })
  return jwt;
}
```

**1. 注册接口**

```js
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const userData = { username, password };

  const saveData = await new User(userData).save();
  const jwt = createJWT(username, 'register', 1, 'h');
  
  res.json({
    status: 200,
    data: saveData,
    token: jwt
  })
})
```

使用 Postman 测试接口：

![register.png](/images/jwt:register.png "注册接口测试")

**2. 登录接口**

```js
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  const userData = await User.findOne({ username, password });
  if (!userData) {
    return res.json({
      status: 501,
      msg: '登录信息有误'
    })
  }
  const jwt = createJWT(username, 'login', 5, 'd');
  res.json({
    status: 200,
    data: userData,
    token: jwt
  })
})
```

![login.png](/images/jwt:login.png "登录接口测试")

### 验证 JWT
服务端生成了 JWT 后不保存，直接发送给客户端，而客户端拿到了 JWT 后将其保存下来，在发送其它请求时需要将 JWT 加入到请求头中：

```
Authorization: Bearer <token>
```

然后服务端验证 JWT 是否合法且有效：

```js
// 验证token方法
function verifyJWT(token) {
  let decoded;
  try {
    decoded = jwt.verify(token.split(" ")[1], secret);
  } catch (err) {
    return err.message;
  }
  return decoded;
}

// 根据用户名获取密码接口
router.get('/password', async (req, res) => {
  const token = req.headers['authorization'];
  const { username } = req.query;
  
  if (!token) {
    return res.json({
      status: 501,
      msg: 'Not authorized'
    });
  }
  const info = verifyJWT(token);
  if(typeof info === "string"){
    return res.json({
      status: 501,
      msg: info
    });
  }
  const userData = await User.findOne({ username });
  res.json({
    status: 200,
    data: userData.password
  })
})
```

![jwt-illegal.png](/images/jwt:jwt-illegal.png "非法 JWT")
![jwt-legal.png](/images/jwt:jwt-legal.png "合法 JWT")

## References & Resources
1. [JSON Web Token | Auth0](https://jwt.io)

2. [JSON Web Token 入门教程 | 阮一峰](http://www.ruanyifeng.com/blog/2018/07/json_web_token-tutorial.html)

3. [Server 端的认证神器——JWT(一) | 知乎](https://zhuanlan.zhihu.com/p/27370773)

3. [Session vs Token Based Authentication | Medium](https://medium.com/@sherryhsu/session-vs-token-based-authentication-11a6c5ac45e4)

---

[^1]: Base64Url 算法将 Base64 编码中的特殊字符替换为不影响在 URL 中传输的字符。
