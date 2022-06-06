---
title: "Linux 自动压缩 log 脚本"
date: "2022-06-03T18:31:22+08:00"
tags: ["Linux", "Bash Shell"]
keywords: ["Linux", "log compress", "日志压缩", "脚本", "bash shell"]
categories: ["Tech"]
dropCap: false
toc: true
slug: "bash-shell-for-log-compress-on-linux"
---

线上应用一般会产生大量日志文件，如 Java 应用不同级别的 log、Nginx 的 access.log 和 error.log，日积月累会极其占用磁盘空间，因此需要定期对 log 进行压缩、备份和删除，本文先分享我们的应用日志和 Nginx 日志的压缩策略和方式。

## 编写 Bash Shell 压缩脚本
先了解两个概念：
1. **Bash Shell**：Unix、Linux 系统的一种脚本文件，是大多数 Linux 发行版中的默认 Shell，以 `.sh` 结尾，使用 `$ sh name.sh` 命令执行。
2. **`.tar.gz` 格式文件**：`.tar` 为多个文件归档为一个文件的格式，会保留文件的元数据信息，`.gz` 为将单个文件使用 [Gzip](https://zh.m.wikipedia.org/zh-hans/Gzip) 压缩后的格式。通过 Tar + Gzip 压缩比 Zip 压缩效率高且节省空间更多，环境上也更为兼容。

### Java APP log Bash Shell
为了更好的排查 log，我们将 Micro Service 架构下 Java 应用的 log 组织为了如下示例结构（应用中使用 [Logback](https://logback.qos.ch/) 工具）：

```s
log
├── micro-service1
│   ├── 2022-06-01
│   │   ├── error.micro-service1-pod-id.log
│   │   └── info.micro-service1-pod-id.log
│   ├── 2022-06-02
│   │   ├── error.micro-service1-pod-id.log
│   │   └── info.micro-service1-pod-id.log
│   └── 2022-06-03
│       ├── error.micro-service1-pod-id.log
│       └── info.micro-service1-pod-id.log
└── micro-service2
    ├── 2022-06-01
    │   ├── error.micro-service1-pod-id.log
    │   └── info.micro-service1-pod-id.log
    ├── 2022-06-02
    │   ├── error.micro-service1-pod-id.log
    │   └── info.micro-service1-pod-id.log
    └── 2022-06-03
        ├── error.micro-service1-pod-id.log
        └── info.micro-service1-pod-id.log
```

Bash Shell 也以此结构为基准进行编写：

**1. 新建 Bash Shell 文件 `java-log-compress.sh`，指定解释器路径，定义初始变量**

```sh
#!/bin/bash

# log 文件目录绝对路径
base_dir="/var/log"
# 当前日期
date="$(date "+%Y-%m-%d")"
```

**2. 循环 Micro Service 文件列表**

```sh
# 进入 log 目录
cd $base_dir
# 将以 micro-service 开头的所有目录名存入变量
services=$(ls -f micro-service*/)
# 循环目录名 list
for service in $services
do
  echo "service: $service"
done
```

> 使用变量时 `{}` 符号可选，与字符串拼接时必须加，否则会识别错误。

**3. 循环 log 日期列表**

```sh
for service in $services
do
  echo "service: $service"
# 进入 log 目录
++  cd $base_dir
# 判断是否存在 micro service 目录
++  if [ -d $service ]; then
# 进入 micro service 目录
++    cd $service
# 将当前路径存入变量
++    service_path=$(pwd)
++    echo "start compress"
# 将所有日期目录名存入变量
++    date_dirs=$(ls -d *)
# 循环日期目录 list
++    for dir in $date_dirs
++    do
++      echo "date_dir: $dir"
++    done
++  fi
done
```

> 在 service 里重新 `cd $base_dir` 而不直接 `cd $service` 的目的是防止下次循环在该 service 目录直接去 `cd` 下一个 service 目录导致报错。

此时执行 `sh java-log-compress.sh` 的打印：

```s
service: micro-service1/
start compress
date_dir: 2022-06-01
date_dir: 2022-06-02
date_dir: 2022-06-03
service: micro-service2/
start compress
date_dir: 2022-06-01
date_dir: 2022-06-02
date_dir: 2022-06-03
```

**4. 执行压缩**

```sh
    for date_dir in $date_dirs
    do
      echo "date_dir: $date_dir"
# 判断该日期是否为今天
++      if [ $date_dir != $date ]; then
++        echo "run tar -zcvf ${date_dir}.tar.gz $date_dir"
# 将日期目录压缩为 .tar.gz 文佳
++        tar -zcvf ${date_dir}.tar.gz $date_dir
      fi
    done
```

> 日期为今天的文件夹还在持续写入 log，因此不执行压缩。不为今天日期的目录都执行代表可将存量数据完成压缩。

此时执行 `sh java-log-compress.sh` 后的目录结构如下，..日期不为今天..的 log 目录都被压缩完成，可使用 `tar -zxvf *.tar.gz` 解压查看 log 内容是否正常。

```s
log
├── micro-service1
│   ├── 2022-06-01
│   │   ├── error.micro-service1-pod-id.log
│   │   └── info.micro-service1-pod-id.log
│   ├── 2022-06-01.tar.gz
│   ├── 2022-06-02
│   │   ├── error.micro-service1-pod-id.log
│   │   └── info.micro-service1-pod-id.log
│   ├── 2022-06-02.tar.gz
│   └── 2022-06-03
│       ├── error.micro-service1-pod-id.log
│       └── info.micro-service1-pod-id.log
└── micro-service2
    ├── 2022-06-01
    │   ├── error.micro-service1-pod-id.log
    │   └── info.micro-service1-pod-id.log
    ├── 2022-06-01.tar.gz
    ├── 2022-06-02
    │   ├── error.micro-service1-pod-id.log
    │   └── info.micro-service1-pod-id.log
    ├── 2022-06-02.tar.gz
    └── 2022-06-03
        ├── error.micro-service1-pod-id.log
        └── info.micro-service1-pod-id.log
```

**5. 删除已被压缩的 log 文件**

```sh
    cd $service
    service_path=$(pwd)
    echo "start compress"
    date_dirs=$(ls -d *)
    for date_dir in $date_dirs
    do
      echo "date_dir: $date_dir"
      if [ $date_dir != $date ]; then
        echo "run tar -zcvf ${date_dir}.tar.gz $date_dir"
        tar -zcvf ${date_dir}.tar.gz $date_dir
# 判断是否存在压缩完成的文件
++      if [ -f ${service_path}/${date_dir}.tar.gz ]; then
# 删除源文件夹
++        rm -rf ${service_path}/${date_dir}
++      fi
      fi
    done
```

执行 `sh java-log-compress.sh` 后的目录结构如下：

```s
log
├── micro-service1
│   ├── 2022-06-01.tar.gz
│   ├── 2022-06-02.tar.gz
│   └── 2022-06-03
│       ├── error.micro-service1-pod-id.log
│       └── info.micro-service1-pod-id.log
└── micro-service2
    ├── 2022-06-01.tar.gz
    ├── 2022-06-02.tar.gz
    └── 2022-06-03
        ├── error.micro-service1-pod-id.log
        └── info.micro-service1-pod-id.log
```

---

完整的 Bash Shell：

```sh
#!/bin/bash

base_dir="/var/log"
date="$(date "+%Y-%m-%d")"

cd $base_dir
services=$(ls -d micro-service*/)
for service in $services
do
  echo "service: $service"
  cd $base_dir
  if [ -d $service ]; then
    cd $service
    service_path=$(pwd)
    echo "start compress"
    date_dirs=$(ls -d *)
    for date_dir in $date_dirs
    do
      echo "date_dir: $date_dir"
      if [ $date_dir != $date ]; then
        echo "run tar -zcvf ${date_dir}.tar.gz $date_dir"
        tar -zcvf ${date_dir}.tar.gz $date_dir
        if [ -f ${service_path}/${date_dir}.tar.gz ]; then
          rm -rf ${service_path}/${date_dir}
        fi
      fi
    done
  fi
done
```

### Nginx log Bash Shell
Nginx 的 access.log 和 error.log 默认为单文件，为方便日常排查问题和节省磁盘空间同样推荐使用 Bash 脚本切割和压缩 log 文件。

```sh
#!bin/bash

# 目标目录
logs_path="/usr/local/nginx/logs/history"
# 当前 log 目标
current_logs_path="/usr/local/nginx/logs"
# 昨天的日期
yesterday=$(date -d "yesterday" +%Y-%m-%d)
# 新建日期文件夹
mkdir ${logs_path}/${yesterday}
# 如果存在 log，则移动当前 log 至备份目录
if [ -f ${current_logs_path}/access.log ]; then
  mv ${current_logs_path}/access.log ${logs_path}/${yesterday}/access.log
fi
if [ -f ${current_logs_path}/error.log ]; then
  mv ${current_logs_path}/error.log ${logs_path}/${yesterday}/error.log
fi
# 执行压缩
cd $logs_path
tar -zcvf ${yesterday}.tar.gz ${yesterday}
# 删除源文件夹
if [ -f ${logs_path}/${yesterday}.tar.gz ]; then
  rm -rf ${logs_path}/${yesterday}
fi

# 向 Nginx 主进程发送 USR1 信号以打开新的 log 文件
nginx_pid=$(cat /usr/local/nginx/logs/nginx.pid)
kill -USR1 $nginx_pid
```


## Cron job 自动执行脚本
[Cron](https://zh.wikipedia.org/zh-cn/Cron) 是 Linux 中基于时间的任务管理工具，也就是**定时任务**。使用以下命令可新增/编辑 Cron job：

```s
$ crontab -e
```

新增以下两个定时任务（需确保两个 Bash shell 文件具有..可执行..权限，若无权限可使用 `chmod +x filename` 命令添加）：

```s
# 凌晨3点执行压缩 Java 应用 log 脚本
0 3 * * * /usr/local/bash-shell/java-log-compress.sh >/dev/null 2>&1
# 0点执行 Nginx log 切分、压缩
0 0 * * * /usr/local/bash-shell/nginx-log-compress.sh >/dev/null 2>&1
```

> `>/dev/null 2>&1` 表示将 Cron job 错误级别的输出（`2>`）等同于（`&`）标准级别的输出（`1`），都丢到黑洞里（[`/dev/null`](https://zh.m.wikipedia.org/zh-hans//dev/null)），表示不记录输出，想要记录输出内容可设定为 `>/var/log/cron.log 2>&1`。

添加成功后查看已有的 Cron job：

```s
$ crontab -l
```

## References & Resources
1. [Bash 脚本教程 | WangDoc.com](https://wangdoc.com/bash/index.html)
2. [Difference Between Zip and Gzip (With Table) | AskAnyDifference.com](https://askanydifference.com/difference-between-zip-and-gzip/)
