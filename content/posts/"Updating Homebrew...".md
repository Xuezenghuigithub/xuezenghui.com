---
title: '"Updating Homebrew..."'
date: "2020-06-05T09:30:55+08:00"
tags: ["MacOS", "debug"]
keywords: ["Homebrew", "MacOS"]
categories: ["Tech"]
dropCap: false
toc: false
slug: "updating-homebrew"
---
## 问题
[Homebrew](https://brew.sh/index_zh-cn) 是 MacOS 下一个极为方便的包管理工具，但是国内在使用的时候往往由于**网络环境**的原因会出现这么一个问题——在执行 `$ brew update` 或 `$ brew upgrade` 等操作时，终端会卡死在 `Updating Homebrew...` 状态，导致无法更新/下载 Homebrew 和本地软件。

## 解决
和大多数网络问题导致的此类情况解决方法类似——要么..换源..，要么..科学上网..。

### 更换 Homebrew 源
换源算是最常规的解决办法了，像 Npm 换 cnpm 镜像、Docker 换阿里云镜像等等，Homebrew 的有效镜像推荐[中科大开源软件镜像](http://mirrors.ustc.edu.cn/help/brew.git.html)和[清华大学开源软件镜像](https://mirror.tuna.tsinghua.edu.cn/help/homebrew/)，以 USTC 镜像为例更换 Homebrew 源步骤：

**1. 更换 brew 程序本身的源**

```s
$ cd "$(brew --repo)"
$ git remote set-url origin https://mirrors.ustc.edu.cn/brew.git

# 还原为官方源
$ git remote set-url origin https://github.com/Homebrew/brew.git
```

**2. 更换 homebrew-core 源**

```s
$ cd "$(brew --repo)/Library/Taps/homebrew/homebrew-core"
$ git remote set-url origin https://mirrors.ustc.edu.cn/homebrew-core.git

# 还原为官方源
$ git remote set-url origin https://github.com/Homebrew/homebrew-core.git
```

> homebrew-core 为 Homebrew 的核心软件仓库。

**3. 更换 homebrew-cask 源**

```s
$ cd "$(brew --repo)"/Library/Taps/homebrew/homebrew-cask
$ git remote set-url origin https://mirrors.ustc.edu.cn/homebrew-cask.git

# 还原为官方源
$ git remote set-url origin https://github.com/Homebrew/homebrew-cask.git
```

> homebrew-cask 是提供 macOS 应用程序的软件仓库。

### 配置终端科学上网
一般只更换上述的三个源就可以解决 Homebrew 软件的下载和更新问题了，但是这并不是一劳永逸的办法。你是否在执行 `$ git clone` 时每秒几 kb 的下载速度？你是否在使用 Npm / Yarn 安装依赖时等得头大……

并且，因为终端只支持 HTTP 代理，而主机使用的是 Sock 代理，即便主机使用了代理工具可以科学上网，但终端的网络环境还是一样的糟糕，这时，就需要配置终端科学上网😎。[Privoxy](https://www.privoxy.org/) 代理工具可实现终端的 HTTP 代理，具体配置步骤：

> 在进行以下步骤前，请确保本机可以科学上网，因为 Privoxy 是一个..客户端代理工具..，单独不能进行翻墙。

**1. 安装 Privoxy**

```s
$ brew install privoxy
```

**2. 配置监听端口**

```s
$ nano /usr/local/etc/privoxy/config
```

追加配置内容：

```yaml
listen-address 0.0.0.0:8118 # 监听8118端口
forward-socks5 / localhost:1080 . # 转发至socks端口
```

> localhost 后的端口号为本机 Sock 监听端口，可在本机代理工具中查看，以 V2rayU 为例，进入`偏好设置`➡️`Advance`即可查看。

**3. 启动 Privoxy 服务**

```s
$ sudo /usr/local/sbin/privoxy /usr/local/etc/privoxy/config
```

**4. 查看网络连接状况**

```s
netstat -na | grep 8118
```

如打印以下内容即为端口监听成功：

```
tcp4       0      0  *.8118                 *.*                    LISTEN
tcp4       0      0  127.0.0.1.8118         *.*                    LISTEN
```

**5. 开启 Privoxy 代理**

```s
# 开启
$ export http_proxy='http://localhost:8118'
$ export https_proxy='http://localhost:8118'

# 关闭
$ unset http_proxy
$ unser https_proxy
```

至此，..当前..终端已经可以进行科学上网了，在执行以上开启代理命令的前后分别执行 `$ curl cip.cc` 可查看网络 IP 地址的变化。但只针对当前打开的终端有效，新建的终端窗口需要重复执行步骤5来开启代理，当然，是有便捷方法的——配置打开/关闭代理的快捷命令：

配置 [Oh My Zsh](https://ohmyz.sh/) 的配置文件：

```s
$ nano ~/.zshrc
```

内容：

```yaml
function proxy_on() {
    export no_proxy="localhost,127.0.0.1,localaddress,.localdomain.com"
    export http_proxy="http://localhost:8118"
    export https_proxy="http:/localhost:8118"
    echo -e "已开启代理"
}

function proxy_off(){
    unset http_proxy
    unset https_proxy
    echo -e "已关闭代理"
}
```

然后使用 `$ source ~/.zshrc` 命令执行更改。

> Oh My Zsh 这么棒的工具你不会没安装吧？Alright，如果没安装，使用的是默认的终端，配置 `$ nano ~/.bash_profile`，内容无异，`source` 命令的文件路径也作相应更改即可。

Bingo～现在，在终端输入 `$ proxy_on` 即可打开终端代理功能，`$ proxy_off` 即关闭🤟，问题得解～
