---
title: "macOS 升级 Catalina 后根目录无权限问题"
date: 2019-10-30T13:31:18+08:00
tags: ["macOS", "debug"]
keywords: ["macOS", "Catalina", "权限"]
categories: ["Tech"]
slug: "update-Catalina-bug"
comments: true
---
## Bug 复现
![Catalina.png](/images/catelina-bug:catalina.png "Catalina")

就在昨天..快快乐乐..升级 [macOS Cataline](https://www.apple.com/macos/catalina/) 之后，一切都还是那么舒服，直到刚才需要启动 MongoDB 数据库，就在我自信地在 shell 中输入`mongod`之后报了个错，看都没看就`sudo mongod`，嗯？？？

```
Data directory /data/db not found., terminating
```
谁把我 dbpath 目录删了？？？重建呗——`sudo mkdir /data`，大问题来了：
```
mkdir: data: Read-only file system
```
遂尝试各种增加权限方法，无效，直到看到了[一篇文章](https://www.v2ex.com/t/605198?p=1)讲到问题出在**新系统 Catalina 默认不允许往系统分区写文件**，亲试解决方法有效后在此记录下步骤。
## Figure out
### 关闭本机SIP(系统完整性保护)
终端中输入`csrutil status`后返回`System Integrity Protection status: enabled.`说明 SIP 处于开启状态。


重启电脑，按住`command + R`直至进入系统恢复界面，然后点击**实用工具**选择**终端**：

![open-shell.jpeg](/images/cateline-bug:open-shell.jpeg "打开终端")

输入`csrutil disable`关闭SIP：

![shut-down-sip.jpeg](/images/catelina-bug:shut-down-sip.jpeg "关闭 SIP")

### 权限获取
重新启动电脑，shell 中输入`sudo mount -uw /`，然后就有权限在根目录创建文件夹了，MongoDB 的启动问题得解。

如果此时还是报错没有权限，请再尝试以下步骤：
    
1. 桌面使用`shift + command + C`前往电脑磁盘
    
2. 右击 Macintosh HD 磁盘选择**显示简介**
    
3. 在**共享与权限**中添加自己的用户为管理员并设置**读与写**权限并应用到包含的项目
    
4. 重新创建文件夹

---

> 因为使用 MongoDB 期间会更改 /data/db 文件，所以不能重新开启 SIP，否则还是会报错权限问题，而 SIP 一直处于关闭状态实际上会导致电脑有一定的安全隐患，详情请查阅[关于 Mac 上的系统完整性保护](https://support.apple.com/zh-cn/HT204899)，希望后续能有更好的解决途径吧。

***

~~最后，*Catalina* 真香～~~

2019/12/24更：恕我直言，以上解决办法真的是弱爆了，因为每重启一次 Mac 就需要执行一遍权限获取的操作，苦不堪言。更好的解决办法是在执行启动 MongoDB 的命令时指定 /data/db 目录位置，但更一劳永逸的办法是[使用 Docker 启动 MongoDB](https://hub.docker.com/_/mongo)。

*Catalina* 依然挺香的😎～