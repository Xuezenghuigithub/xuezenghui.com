---
title: "ECS 服务器配置及部署实践"
date: "2020-04-13T16:24:34+08:00"
tags: ["Linux", "Vue.js", "Node.js"]
keywords: ["Linux", "CentOS 8", "部署"]
categories: ["Tech"]
toc: true
slug: "ecs-server"
---

## 前言
前端切图仔终于在今天也有自己的服务器了😳（还不是趁着没满24岁再薅两把阿里的羊毛）——2G 单核 1M 带宽云服务 ECS ，再入门不过了，也是，自己本来就是用来入门的。所以呢，在此记录服务器从零配置到部署前端项目（Vue.js）和后端项目（Node.js）的过程～

## 前置工作
[学生优惠](https://promotion.aliyun.com/ntms/act/campus2018.html?utm_content=se_1004747724)真的是超划算了，想当年大学时学 Java 的室友就给我疯狂安利，当时的我还嗤之以鼻——“我一学前端的要那玩意儿干哈，用不上”，现在看来真是蛮香的了🤤，建议有闲钱的续他个十年八年的……

服务器呢建议购买云服务器 ECS 而不是轻量应用服务器——如果你也想和我一样从零开始配置服务器，完整地体会整个过程的话。服务器的预装环境强烈推荐选择 CentOS，体验一下 Linux 大法是不是真的好，而版本我选择的是 8.0 64位。

购买完成后关键的一步是**设置实例密码**，在阿里云控制台中的实例列表页面➡️实例的右侧`更多`➡️`密码/密钥`➡️`重置实例密码`，这个密码用于后续连接远程服务器，其他的配置如安全组规则等按照阿里云的文档来操作即可，确保开通了80和443端口。

还需要说明的是我本机操作系统为 macOS Catalina 10.15.3，以下操作都基于此。

## 连接服务器及目录说明
### 连接服务器
macOS 连接服务器实例是极为方便的，在阿里云控制台查看实例的公网 IP 地址，然后在终端中通过 SSH 连接远程实例并指定为 root 用户身份：

```s
$ ssh root@<公网 IP 地址>
```

接着会要求输入实例的密码，当输出 `Welcome to Alibaba Cloud Elastic Compute Service !` 时就成功连接上了 ECS 实例。

> Windows 系统及其它环境可参考[阿里云帮助文档](https://help.aliyun.com/document_detail/25434.html?spm=a2c4g.11186623.2.20.187d6c82wePGwX#concept-rsl-2vx-wdb)。

### Linux 目录说明
Linux 操作系统遵循 [FHS](http://www.pathname.com/fhs/) 的标准，根目录下默认存在以下次级目录：

[^1]![directory.gif](/images/ecs-server:directory.gif "Linux 目录树")

成功连接实例后位于 `/root` 目录下，使用 `$ cd ..` 命令可回到根目录，再使用 `$ ls` 就可看到上图中的目录了。

> 使用 `$ pwd` 命令可查看当前所处路径，`$ ls` 命令查看当前目录下的可见文件，`$ cd` 命令切换所处目录。

## 部署前端项目
### 安装 NGINX
为什么要使用 [NGINX](https://www.nginx.com)？因为前端项目是纯静态的资源，要大家都能通过浏览器去访问它，就需要一个 Web 服务器，NGINX 正是一个合适且优异的免费开源高性能 HTTP 服务器和反向代理服务器。实际上之前我司安排过 NGINX 的相关学习任务，但学习内容还是偏概念性，现在实践终于来了～

首先明确**服务器版本为 CentOS 8**，因为在 CentOS 8 中安装 NGINX 的方法与在 CentOS 7 中安装的有些差异，CentOS 8 中的默认软件包管理工具是 `dnf`，它是 `yum` 的下一代版本（但 CentOS 8 中没有直接弃用 `yum`），安装 NGINX 只需要一个命令：

```s
$ dnf install nginx
```

> 因为我直接使用 root 用户身份登陆的服务器，所以安装命令不需要添加 `sudo`，设置非 root 用户身份并配置 sudo 特权可参考 [Initial Server Setup with CentOS 8](https://www.digitalocean.com/community/tutorials/initial-server-setup-with-centos-8) 或我的另一篇文章 [Linux 的些个操作](../linux-tips/#配置非-root-用户)。

然后在浏览器中访问服务器的公网 IP 就可以看到 NGINX 的欢迎界面啦🎉：

![nginx.png](/images/ecs-sever:nginx.png "NGINX 启动成功")

### 管理 NGINX
其实我没想让这篇文章也成为 NGINX 的安装使用教程，无奈自己在这方面也几乎是小白，就权当作学习记录罢了……

Systemd 是 Linux 的自带系统工具，用来管理系统进程，若进一步学习推荐阮一峰老师的 [Systemd 入门教程](http://www.ruanyifeng.com/blog/2016/03/systemd-tutorial-commands.html)。NGINX 进程也是通过 Systemd 的命令来管理的，以下是常用的一些操作：

**1. 停止运行 NGINX**

```s
$ systemctl stop nginx
```

**2. 启动 NGINX**

```s
$ systemctl start nginx
```

**3. 重启 NGINX**

```s
$ systemctl restart nginx
```

**4. 在不停止运行的情况下重新加载配置**

```s
$ systemctl reload nginx
```

### 配置 NGINX
要部署的项目文件一般都位于 `/var/www/` 目录下，先创建一个示例网站的目录：

```s
$ mkdir -p /var/www/zander/html
```

> `-p` 选项表示确保每个层级的目录都存在，不存在则自动创建。


也就是说，网站要显示的内容就取决于此目录下的文件，那文件呢？创建呗～我是比较习惯使用 nano 文本编辑器的，简单好用，先安装：

```s
$ dnf install nano
```

然后创建网站主要内容的 HTML 文件：

```s
$ nano /var/www/zander/html/index.html
```

在文件中加入内容，可以外部复制后在 nano 中使用 `cmd + v` 直接粘贴：

```html
<html>
    <head>
        <title>Zander</title>
    </head>
    <body>
        <h1>Hello, I am Zander!</h1>
        <p>Welcome to my site.</p>
    </body>
</html>
```

然后使用 `control + x` 关闭文件，nano 会提示是否保存内容，输入 y 后按 Enter 键确认保存。

Linux 中几乎所有的配置文件都位于 `/etc` 目录中，而 NGINX 的所有配置文件都位于 `/etc/nginx/` 目录，`/etc/nginx/nginx.conf` 是 NGINX 全局配置文件，但 NGINX 服务中通常不止托管一个网站，当有多个网站时常用的做法是在 `/etc/nginx/conf.d/` 目录下创建每个网站相应的配置文件，如：

```s
$ nano /etc/nginx/conf.d/zander.conf
```

然后编辑配置的具体内容：

```py
server {
    # 监听 ipv4 端口
    listen 80;
    # 监听 ipv6 端口
    listen [::]:80;

    # 项目文件根目录
    root /var/www/zander/html;
    # 默认显示页
    index index.html index.htm index.nginx-debian.html;

    # 地址，没有域名可先不设置，默认为公网 IP
    server_name _;

    # 请求的 URL 过滤
    location / {
      try_files $uri $uri/ =404;
    }
}
```

还有关键的一步不能忽略，我在这块儿就被坑惨了😢，虽然全局配置文件中已经通过 `include /etc/nginx/conf.d/*.conf;` 引入了我们自己添加的配置文件，但其实全局配置中默认是存在一个 server 配置的，如果不删除这个配置它就会覆盖我们自定义的配置，所以，请无情地**将 `/etc/nginx/nginx.conf` 文件中的 `server { ... }` 这段全部删掉**。

修改完成后使用 `$ nginx -t` 可检查 NGINX 的各文件中是否有语法错误，然后使用 `$ systemctl restart nginx` 重启服务。

最后，快乐地在浏览器访问公网 IP 就可以看到网站的内容了：

![test-site.png](/images/ecs-server:test-site.png "网站内容")

### 部署 Vue 项目
上面..简单..介绍了一个 HTML 文件的部署，其实 Vue 项目部署的原理和这是完全相同的，两个基本的步骤：一、在服务器创建网站内容；二、配置 NGINX。

**1. 打包上传 Vue 项目**

因为 Vue CLI 基于 Webpack 构建，所以使用 Vue CLI 创建的项目默认都有一个打包构建的命令——`$ npm run build`，执行完后会生成一个 **dist 目录**，这个目录和上例中的 `/var/www/zander/html` 一样，都是用于存放网站的内容，不同的是现在需要将本地的这个文件上传到服务器的 `/var/www/` 目录下（更常见的做法应是将代码存储仓库的项目上传至服务器部署，也就是在服务器上使用 Git）。

Linux 中的 `scp` 命令可用来传输文件，macOS 中也是可以直接使用的，将打包构建好的 dist 目录上传至服务器：

```s
# 项目根目录下执行
$ scp -r dist root@<公网 IP 地址>:/var/www/vue-test
```
> `-r` 表示复制目录，递归传输目录内所有的文件，`:` 后为服务器中的存放位置。

然后输入实例密码开始传输，传输过程如下：

```
# 传输过程
favicon.ico                           100% 4286   136.5KB/s   00:00
index.html                            100%  776    26.6KB/s   00:00
app.8aaa5807.css                      100%  428    14.3KB/s   00:00
app.3b5b763e.js.map                   100%   27KB 472.7KB/s   00:00
about.79329b10.js.map                 100% 1350    43.2KB/s   00:00
chunk-vendors.ae64d4e9.js             100%   92KB 891.5KB/s   00:00
app.3b5b763e.js `                     100% 6073   186.9KB/s   00:00
about.79329b10.js                     100%  455    14.7KB/s   00:00
chunk-vendors.ae64d4e9.js.map         100%  464KB   3.6MB/s   00:00
logo.82b9c7a5.png                     100% 6849   213.9KB/s   00:00
```

**2. 配置 NGINX**

上传完成后在服务器中就能看到对应的目录文件了，如上面所说，NGINX 托管部署的每个网站在 `/etc/nginx/conf.d/` 目录下都应有一个自己的配置文件，创建之：

```s
$ nano /etc/nginx/conf.d/vue-test.conf
```

编辑内容：

```py
server {
    listen 80;
    listen [::]:80;

    root /var/www/vue-test;
    index index.html index.htm index.nginx-debian.html;

    server_name _;

    location / {
      try_files $uri $uri/ =404;
    }
}
```

`server_name` 仍保持默认则会..覆盖..之前的网站内容，即现在还是通过公网 IP 地址来访问部署的 Vue 项目。重启 Nginx 服务后部署成功，熟悉的页面😉：

![deploy-vue.png](/images/ecs-server:deploy-vue.png "部署成功的 Vue 项目")

## 部署后端项目
Node.js 项目部署到服务器的目的是让其**持续提供 Web 服务**，其实原理很简单，我们在本地启动项目就只能在本地访问，而在服务器部署后一是能保证项目..持续..运行，二是可通过 ..IP.. 来访问项目提供的 Web 服务。
### 安装 Node.js
CentOS 8 中..快捷..安装 Node.js 和其包管理工具 NPM 的方式有两种，从 CentOS 储存库安装或使用 NVM 安装，这里只介绍第一种方式。输入以下命令查看储存库中可安装的 Node.js 版本列表：

```s
$ yum module list nodejs
```

应该是可以看到一个稳定版本（v10.x）和一个开发版本（v12.x），安装默认版本的 Node.js，同时 NPM 也会被自动安装：

```s
$ yum module install nodejs
```

使用 `$ node --version` 可查看安装的 Node.js 版本。

### 安装 PM2
说是部署，其实就是在服务器上运行罢了，但主要保证的就是..持续..运行，所以还需要用到 [PM2](https://pm2.keymetrics.io/) 进行**进程守护**以保证项目不间断运行。使用 NPM 全局安装 PM2：

```s
$ npm install pm2 -g
```

> 鉴于篇幅原因此处不再详细介绍 PM2 具体使用方法，官方文档很清晰啦～

### 部署 Node 项目

使用 express-generator 简单起一个项目，将项目从本地上传至服务器，注意需要**删掉 node_modules 文件夹**不要上传：

```s
# 项目的父级目录下执行
$ scp -r scp -r deploy-node root@<公网 IP 地址>:/opt/node-test
```

进入服务器的项目目录下安装依赖：

```s
$ cd /opt/node-test
$ npm install
```

注意咯，现在还不能直接运行项目，因为项目的默认端口是 3000，但服务器的 3000 端口还没有对外开放，所以需要先去服务器管理控制台给实例添加一条 3000 端口的安全组规则。

然后使用 PM2 启动项目：

```s
# 项目根目录下执行
$ pm2 start ./bin/www
```

最后，在浏览器输入 `<公网 IP 地址>:3000` 可访问到 Web 服务🎉：

![deploy-node.png](/images/ecs-server:deploy-node.png "部署成功的 Node.js 项目")

## References & Resources
1. [How to Install Nginx on CentOS 8 | DigitalOcean](https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-centos-8)

2. [How to Install Node.js and npm on CentOS 8 | Linuxize](https://linuxize.com/post/how-to-install-node-js-on-centos-8/)

[^1]: 图源[《鸟哥的 Linux 私房菜》](http://cn.linux.vbird.org/linux_basic/0210filepermission_3.php#dir_tree)。