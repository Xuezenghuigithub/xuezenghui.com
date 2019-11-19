---
title: "macOS升级Catalina后根目录无权限问题"
date: 2019-10-30T13:31:18+08:00
tags: ["macOS", "MongoDB"]
discripion: "macOS升级Catalina后根目录无法创建文件和文件夹，权限为Read-only file system。"
keywords: [macOS,Catalina,权限]
categories: ["Debug"]
slug: "update-Catalina-bug"
---
## Bug复现
![Catalina.png](http://blog.xuezenghui.com/cataline_bug/cataline.png "Catalina")

就在昨天..快快乐乐..升级macOS Cataline之后，一切都还是那么舒服，直到刚才需要启动MongoDB数据库，就在我自信地在shell中输入`mongod`之后报了个错，看都没看就`sudo mongod`，嗯？？？

```
Data directory /data/db not found., terminating
```
谁把我dbpath目录删了？？？重建呗——`sudo mkdir /data`，大问题来了：
```
mkdir: data: Read-only file system
```
遂尝试各种增加权限方法，无效，直到看到了[一篇文章](https://www.v2ex.com/t/605198?p=1)讲到问题出在**新系统Catalina默认不允许往系统分区写文件**，亲试解决方法有效后在此记录下步骤。
## Figure out
### 关闭本机SIP(系统完整性保护)
终端中输入`csrutil status`后返回`System Integrity Protection status: enabled.`说明SIP处于开启状态。


重启电脑，按住`command + R`直至进入系统恢复界面，然后点击**实用工具**选择**终端**：

![open_shell.jpeg](http://blog.xuezenghui.com/cataline_bug/open_shell.jpeg "打开终端")

输入`csrutil disable`关闭SIP：


![enter_order.jpeg](http://blog.xuezenghui.com/cataline_bug/enter_order.jpeg "打开终端")

### 权限获取
重新启动电脑，shell中输入`sudo mount -uw /`，然后就有权限在根目录创建文件夹了，MongoDB的启动问题得解。


如果此时还是报错没有权限，请再尝试以下步骤：
    
1. 桌面使用`shift + command + C`前往电脑磁盘
    
2. 右击Macintosh HD磁盘选择**显示简介**
    
3. 在**共享与权限**中添加自己的用户为管理员并设置**读与写**权限
    
4. 重新创建文件夹

***

> 因为使用MongoDB会更改/data/db文件，所以不能重新开启SIP，否则还是会报错权限问题，而SIP一直处于关闭状态实际上会导致电脑有一定的安全隐患，详情请查阅[关于Mac上的系统完整性保护](https://support.apple.com/zh-cn/HT204899)，希望后续能有更好的解决途径吧。

***

最后，Catalina真香～