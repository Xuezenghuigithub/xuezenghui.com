---
title: "MEVN 项目部署"
date: "2020-06-17T16:13:25+08:00"
tags: ["Linux"]
keywords: ["MEVN", "Linux", "部署", "MongoDB", "Node.js"]
categories: ["Tech"]
toc: true
slug: "deploy-mevn-project"
---

## 前言
有一个计划已经躺在我的 [Microsoft To Do](https://todo.microsoft.com/tasks/) 里许久了——“完成一个图片合成工具”，解释一下，这个工具的作用是**合成图片**（???还用你解释）。哈哈哈，因为在阅读技术文章的时候发现很多文章的配图为**多个技术的 Logo 组成的架构图**，尤其 [Medium](https://medium.com/) 中的文章，比如[这个](https://medium.com/@shrikarvk/creating-a-docker-container-for-spring-boot-app-d5ff1050c14f)，[这个](https://medium.com/swlh/how-to-create-your-first-mern-mongodb-express-js-react-js-and-node-js-stack-7e8b20463e66)，当然了，谁让我又偏爱 Medium 的风格呢，所以还有[这个](https://xuezenghui.com/posts/graphql/#graphql--nodejs--mongodb)。那有没有一个方便的方式可以快速地生成这样瘠薄（技术博主）常用的图片呢？没找到……那就自己写一个罢。

功能开发上并不难，图片合成使用 canvas 实现，剩下就是各技术 Logo 的管理了，相当于一个简单的图床。5天，基本功能实现，传送门——[Psoon](http://47.93.234.220/)，名字是 Picture synthesis soon，意为快速地 Ps 😳，技术架构为 MEVN[^1]，源码见我的 [GitHub](https://github.com/Xuezenghuigithub/psoon)。

因为自己平常与开发以外的环节接触不多，Linux 和 Docker 也都只学了皮毛，整个项目下来问题就几乎都出在了部署上，比如 Vue 项目的部署问题：

- 字体文件太大，导致首屏加载时间极长
- 路由采用 History 模式，直接访问子路由或刷新页面导致 404
- 样式问题

但因为 Vue 项目的基本部署已在[前文](../ecs-server/#部署-vue-项目)记录，这里就不详述了，针对上面几个问题会视其必要性辟文新立，先说说部署后台的主要工作。

## 部署方式
诚言，在服务器上裸机部署 Node.js + MongoDB 的 Web 应用是没有什么难度的，
前文也有简单地记录过。为了更接近生产环境，也为了检测自己 Docker 的学习效果，决定采用 Docker 部署的方式。

简单说一下 [Docker](https://docs.docker.com/)，它基于 Go 语言开发，是一个基于 Linux 容器虚拟化技术的用于构建、部署和共享应用程序的工具，做到了使 APP 及其运行环境“一次封装，到处运行”，大大避免了诸如“在我电脑上可以跑啊”之类的言论🌚，现如今 Docker 在后端的江湖地位也可谓举足轻重了。

## 环境安装
环境主要是 Docker 工具集的安装，这里介绍如何在 CentOS 8 中安装 Docker 及 [Docker Compose](https://docs.docker.com/compose/)，Docker Compose 是用于定义和运行多个容器的一个 Docker 子工具，多用于有关联关系的容器之间的联调部署，譬如 Express 应用和 MongoDB 之间的..通信互联..。

### 安装 Docker
Docker 分为社区版 Docker CE 和企业版 Docker EE，这里安装的为社区版。

**1. 添加 Docker CE 存储库**

```s
$ dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
```

**2. 查看可安装的软件包版本**

```s
$ dnf list docker-ce
```

**3. 安装最新版本的 Docker CE**

```s
$ dnf install docker-ce --nobest -y
```

**4. 验证安装结果**

```s
$ docker --version
```

### 安装 Docker Compose
**1. 安装 curl**

```s
$ dnf install curl -y
```

**2. 下载安装 Docker Compose**

```s
$ sudo curl -L "https://github.com/docker/compose/releases/download/1.26.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
```

> 1.26.0 为截止文章撰写之日的最新版本，后续请关注 [GitHub releases](https://github.com/docker/compose/releases) 及时更新替换版本。

**3. 为下载的二进制文件添加可执行权限**

```s
$ sudo chmod +x /usr/local/bin/docker-compose
```

**4. 验证结果**

```s
$ docker-compose --version
```

## 部署应用
### 创建 Dockerfile 文件
简单点说，使用 Docker 部署应用即运行相应的 Docker 容器，需要先创建容器，创建容器需要使用 Docker 映像，而要构建映像，就需要使用 [Dockerfile](https://docs.docker.com/engine/reference/builder/)。在 Node.js 应用根目录下创建 Dockerfile 文件：

```docker
# 基础映像
FROM node:latest

# 作者信息
MAINTAINER Zander<xuezenghui@gmail.com>

# 设定运行容器后终端所在的工作路径
WORKDIR /usr/src/psoon

# 拷贝依赖文件到映像文件夹
COPY package.json /usr/src/psoon/

# 安装依赖
RUN npm install

# 拷贝项目文件和目录到映像文件夹
COPY . /usr/src/psoon

# 暴露端口号
EXPOSE 2000

# 启动容器
CMD ["npm", "start"]
```

> 你可能会有疑问：复制全部文件不是已经包含 package.json 文件了吗？为什么要..执行两次.. `COPY` 命令？
> 
> 原因是分作两步可以利用 Docker 的**缓存层**，防止每次更改应用程序源码后都重新构建 node_modules 模块，详参[《把一个 Node.js web 应用程序给 Docker 化》](https://nodejs.org/zh-cn/docs/guides/nodejs-docker-webapp/#dockerfile)。

### 创建 Docker Compose 文件
如果不使用 Docker Compose 则需要通过 Dockerfile 手动构建映像，再通过映像启动容器，而有了 Docker Compose 只需要创建用于启动容器服务的 Docker Compose 文件，同样的，在项目根目录下创建 docker-compose.yml 文件：

```yml
version: "3.4"              # Compose file 版本
services:
  psoon:                    # 服务名
    container_name: psoon   # 容器名
    restart: always         # 失败时重新运行容器
    build:
      context: .            # 使用当前目录中的 Dockerfile 文件构建映像
    ports:                  # 主机和容器的端口映射
      - "2000:2000"
    links:                  # 链接的容器
      - mongo
  mongo:
    container_name: mongo
    image: mongo            # mongo 使用官方映像
    volumes:                # 指定容器数据卷，数据持久化
      - ./data:/data/db
    ports:
      - "27017:27017"
```

> 注：Node 和 MongoDB 暴露的端口服务器都要配置对外开放。

### 上传项目至服务器
本地创建好项目构建部署所需的文件后需要将项目上传至 CentOS 8，有些文章中建议建立一个 .dockerignore 文件，其作用与 .gitignore 类似，用来排除构建 Docker 映像时不需要的文件和目录，比如 node_modules、npm-debug.log 文件。但我这里项目文件是由本地上传至服务器，手动删除此类文件不上传至服务器即可（变相节省服务器内存???），个人理解 .dockerignore 文件应多作用于 CI/CD[^2] 时。

```s
# 项目根目录下起步执行
$ rm -rf node_modules
$ cd ..
$ scp -r psoon root@<公网 IP 地址>:/usr/src/psoon
```
### 构建镜像，启动服务
登录服务器后进入项目目录，执行 Docker Compose 的构建启动命令：

```s
$ cd /usr/src/psoon
$ docker-compose up -d
```

> `-d` 指定启动容器后不进入交互模式，以守护式进程运行。

构建过程：

```shell
Building psoon
Step 1/8 : FROM node:latest
 ---> dcda6cd5e439
Step 2/8 : MAINTAINER Zander<xuezenghui@gmail.com>
 ---> Running in 9c2e8d8a4df1
Removing intermediate container 9c2e8d8a4df1
 ---> ab2f34e52d9f
Step 3/8 : WORKDIR /usr/src/psoon
 ---> Running in 184b939e4b09
Removing intermediate container 184b939e4b09
 ---> f16a6e357920
Step 4/8 : COPY package.json /usr/src/psoon/
 ---> 4e9485e1a306
Step 5/8 : RUN npm install
 ---> Running in ce459058cd8a
 ......
 Removing intermediate container ce459058cd8a
 ---> c05c31eabb12
Step 6/8 : COPY . /usr/src/psoon
 ---> 66b86989d3ba
Step 7/8 : EXPOSE 2000
 ---> Running in 67332d77017b
Removing intermediate container 67332d77017b
 ---> fc863845b8a8
Step 8/8 : CMD ["npm", "start"]
 ---> Running in 022afc431683
Removing intermediate container 022afc431683
 ---> bacb1e3a5dd8

Successfully built bacb1e3a5dd8
Successfully tagged psoon_psoon:latest
```

---

在这里不得不提一个踩了一下午的坑🥶，在我执行 `$ docker-compose up` 命令后构建总是卡在 Step 5 `RUN npm install` 处，然后报错如下：

```
npm ERR! code EAI_AGAIN
npm ERR! errno EAI_AGAIN
npm ERR! request to https://registry.npmjs.org/connect-history-api-fallback failed, reason: getaddrinfo EAI_AGAIN registry.npmjs.org

npm ERR! A complete log of this run can be found in:
npm ERR!     /root/.npm/_logs/2020-06-18T07_52_25_346Z-debug.log
ERROR: Service 'psoon' failed to build: The command '/bin/sh -c npm install' returned a non-zero code: 1
```

尝试更改 npm 镜像源、更改服务器 DNS 等等方法皆无效，最终解决方案为指定 Docker 容器的网络为 [host](https://docs.docker.com/network/host/)，即宿主机的网络（默认为 [bridge 网桥网络](https://docs.docker.com/network/bridge/)），具体方式：

1. 手动构建镜像：

  ```s
  $ docker build . --network host
  ```

2. 使用 Docker Compose 构建，则需要[更改 docker-compose.yml 文件](https://docs.docker.com/compose/networking/)：

```yml
version: "3.4"              # Compose file 版本
services:
  psoon:                    # 服务名
    container_name: psoon   # 容器名
    restart: always         # 失败时重新运行容器
    build:
      context: .            # 使用当前目录中的 Dockerfile 文件构建映像
+     network: host         # 指定容器使用的网络
    ports:                  # 主机和容器的端口映射
      - "2000:2000"
    links:                  # 链接的容器
      - mongo
  mongo:
    container_name: mongo
    image: mongo            # mongo 使用官方映像
    volumes:                # 指定容器数据卷，数据持久化
      - ./data:/data/db
    ports:
      - "27017:27017"
```

---

成功后使用 `$ docker images` 和 `$ docker ps` 命令可查看构建成功的镜像和已经启动的两个容器，在浏览器中输入 `IP:2000` 或 `IP:27017` 也就能访问到相应的服务了😚。

最后，不要忘记在 NGINX 中配置接口请求地址～

## References & Resources
1. [Dockerising a Node.js and MongoDB App | Medium](https://medium.com/statuscode/dockerising-a-node-js-and-mongodb-app-d22047e2806f)
2. [Complete Node js Project Setup from Docker to Testing | Medium](https://medium.com/@nur_islam/complete-node-js-project-setup-from-docker-to-testing-docker-restfull-apis-with-node-js-9f384e06734a)
3. [
npm install error - getaddrinfo EAI_AGAIN registry.npmjs.org:443 | GitHub](https://github.com/StefanScherer/dockerfiles-windows/issues/270)


[^1]: MongoDB + Express.js + Vue.js + Node.js 技术架构。
[^2]: 持续集成、持续交付和持续部署。