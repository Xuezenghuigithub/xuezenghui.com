---
title: "Linux 的些个操作"
date: "2020-05-25T13:28:59+08:00"
tags: ["Linux"]
keywords: ["Linux", "CentOS 8", "部署"]
categories: ["Tech"]
dropCap: false
toc: true
slug: "linux-tips"
---

记录使用 Linux 时的些个操作，CenteOS 8.0 下。

## 配置非 root 用户
直接使用 root 权限操作 Linux 是极为不安全的，也是非常不提倡的，应该为不同的角色配置不同的用户身份，可为用户配置一定的管理权限，在需要执行管理操作时输入 `sudo` 前缀即可拥有 root 的管理权限，具体步骤：

**1. 使用 root 用户身份登录 Linux**

```s
$ ssh root@service_ip
```

**2. 创建新用户**

```s
$ adduser zander
```

**3. 配置新用户的密码**

```s
$ passwd zander
```

**4. 配置管理权限**

```s
$ usermod -aG wheel zander
```

> `usermod` 命令用于修改用户账号，`-aG` 选项为用户指定**附加组**，wheel 组是 CentOS 8 中默认存在的拥有特殊权限的群组，群组中的成员可使用 `sudo` 命令执行 root 权限的操作。

## 免密登陆
每次本机连接 Linux 都需要输入用户密码，这可真是糟透了，是个懒人没错:)。为本机和服务器配对 SSH 公私密钥即可实现免密登录，只需要一行命令：

```s
$ ssh-copy-id -i ~/.ssh/id_rsa.pub username@service_ip
```

> 当然前提是你本机已经生成了公私钥文件，但都看到这儿了你怎么可能没有呢🤨！

## Keep Alive
终端中通过 SSH 连接上 Linux 后，若几分钟内不使用会导致连接失活，原因是防火墙在一定时间内未监测到会话活动后会自动断开 SSH 连接。可配置本机 SSH，使本地每隔一段时间发送生命周期信号发送至服务器，防止连接失活。同样的，也可配置远程服务器，使其定时向客户端发送数据来保证持久连接。

### 方法一、配置客户端
**1. 创建 ~/.ssh/config 文件**

```s
$ touch ~/.ssh/config
```

**2. 配置该文件**

```py
Host *
    ServerAliveInterval 60
    ServerAliveCountMax 10
```

此配置表示客户端每分钟向所有已连接的服务器发送一次数据，发送10次后如果仍未收到响应则关闭该连接。

### 方法二、配置服务器
**编辑 /etc/ssh/ssh_config 文件**

```s
$ sudo nano /etc/ssh/ssh_config
```

内容为：

```py
ClientAliveInterval 60
ClientAliveCountMax 10
```
## 配置 Docker 命令不需加 `sudo`
Docker 守护进程默认由 root 用户掌管，其他用户使用 Docker 命令时必须加 `sudo` 才可成功执行。可添加配置 docker 用户组使得组内用户使用 Docker 时不需加 `sudo` 命令。

**1. 添加 docker 用户组**

```s
$ sudo groupadd docker
```

**2. 将用户加入用户组**

```s
$ sudo usermod -aG docker username
```

**3. 重新登录，或切换用户组以更新权限**

```s
$ newgrp docker
```