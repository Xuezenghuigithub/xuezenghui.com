---
title: "前端工程化之 CI/CD"
description: "GitLab CI/CD 实践"
date: "2020-11-17T15:20:01+08:00"
tags: ["GitLab", "前端工程化", "CI/CD"]
keywords: ["GitLab", "CI/CD", "前端工程化"]
categories: ["Tech"]
slug: "gitlab-ci-cd"
gitinfo: true
comments: true
toc: true
---

在项目开展的过程中，我经常做功能分支-测试分支-部署分支之间的代码合并工作，虽然说我们团队有着合理的 Git Flow、Commit 规范，但确保不了每个开发人员在每次提交的时候都严格遵守，且在分支复杂、提交时间节点不确定的情况下，合并分支时产生冲突、处理冲突似乎成了不可避免的事，从开发的整个生命周期来看对产出效率的影响是不小的。

「工程化」还要考量的一个角度便是..生产效率..，也就是「自动化」，任何重复次数多于两次的简单机械劳动都应该交给机器来完成，这也就是前端工程化中“自动化”的过程，当然，不止前端了，任何需要频繁交付应用的团队都希望有一个工具、一种方法能应对“[集成地狱](https://www.solutionsiq.com/agile-glossary/integration-hell/)”和机械化的部署工作。

## CI/CD 概要
### CI
Continuous Integration，持续集成。集成这个动作指软件开发过程中合并代码的过程，而持续集成指的就是我们需要的自动化的过程——在开发人员提交新代码后，自动进行构建、测试并合并代码到代码仓库中。

[^1]![ci.png](/images/gitlab-ci-cd_ci.png "持续集成")

### CD
CD 有两种含义，Continuous Delivery 持续交付和 Continuous Deployment 持续部署。持续交付指在完成应用的测试、集成和构建后因为团队要求或业务要求，自动将应用部署到..准生产环境..，能部署到准生产环境也就意味着可以直接部署到正式的生产环境，所以，**持续交付意味着任何的代码修改可以在任何想要部署的时候实施部署，表示一种能力**。

而**持续部署则是一种实践，一个最终动作**，表示在通过前面的所有阶段后自动将改动投入生产环境。不同的团队对持续交付和持续部署有一定要求，比如我司要求在部署到生产环境前先部署到准生产环境进一步测试。

![cd.png](/images/gitlab-ci-cd_cd.png "持续部署")

## GitLab CI/CD 实践
CI/CD 是 GitLab 的内置工具，不需要第三方工具就可以拿来即用。GitLab CI/CD 会根据用户创建的特定 YAML 文件使用 GitLab Runner 自动执行脚本，文件中的脚本即是我们需要执行的操作，如添加依赖项、构建、单元测试等等。

### 配置 GitLab Runner
存放脚本的 YAML 文件是关键，但首先需要有执行脚本的工具 [GitLab Runner](https://docs.gitlab.com/runner/)，每个要实行 CI/CD 的项目都必须指定一个特定的 Runner，Runner 是一个使用 Go 语言编写的类似终端的工具，可以运行在 Linux、Docker、maocOS 等众多环境中，可以选择配置三种不同类型的 Runner：

- **Specific Runners**：项目特定的 Runner，适用于需要执行部署作业等有特定要求的项目
- **Shared Runners**：由 GitLab 管理员安装、注册的可用于所有项目的 Runner
- **Group Runners**：同样由 GitLab 管理员来安装，不同的是可以给特定的 Group 设置特定的 Runner

因为需要进行持续**部署**，部署的目标服务器需要和 GitLab 中的代码仓库通信，符合“需要执行有特定要求”，先来创建一个 Specific Runners。此处以要部署 Vue 项目的云服务器（Ubuntu 18.04.5）为例，分为安装和注册两个步骤，注册即将安装的 Runner 与 GitLab 绑定以使其可通过 API 通信：

**1. 添加 GitLab 官方存储库**

```s
$ curl -L https://packages.gitlab.com/install/repositories/runner/gitlab-runner/script.deb.sh | sudo bash
```

**2. 安装 GitLab Runner**

```s
$ export GITLAB_RUNNER_DISABLE_SKEL=true; sudo -E apt-get install gitlab-runner
```

**3. 获取 URL 和 token**

进入要添加 CI/CD 的 GitLab 项目的 `Setting` ➡️ `CI/CD` 页面（前提是你要有该项目的 Maintainer 权限），展开 Runners 面板，在 Specific Runners 找到 **GitLab URL** 和 **token**。

![runner-token.png](/images/gitlab-ci-cd_runner-token.png "Runner Token")

**3. 注册 Runner**

在 Ubuntu 中运行 `$ sudo gitlab-runner register`，按照指令依次输入 GitLab URL、token、描述、标签、执行者（本例输入 `shell`）[^2]。

注册完成后在 Runners 面板下即可看到绑定成功的 Specific Runner：

![runner.png](/images/gitlab-ci-cd_runner.png "添加成功的 Runner")

> 更换 Runner 后需执行 `$ sudo gitlab-runner restart` 重启以生效。

### 编写脚本文件
`.gitlab-ci.yml` 文件需要在项目根目录下手动创建，这个 YAML 文件中的配置叫做 GitLab CI/CD 的**管道 Pipeline**，每当代码库更新时，GitLab 都会先按照管道中的内容在 Runner 上执行相应的作业 Jobs。Jobs 是 `.gitlab-ci.yml` 文件中的最基本单元，用来定义执行一个操作的条件和位于 `script` 子句内的操作具体内容，如：

```yml
stage:          # 显式声明各阶段，并指定执行顺序
  - job1
  - ...

job1:           # 自定义的 Job 名
  stage: test   # 当前 Job 的阶段
  script:       # 由 Runner 执行的 Shell 脚本
    - echo "Hello, Zander!"
```

> `stage` 可以决定各个 Jobs 的执行顺序——同一阶段的 Jobs 并行运行，不同阶段的 Jobs 依照书写顺序执行，如果前面的 Job 失败，则将提交标记为 `failed` 并且不执行后续的 Job.。不止 `stage` 和 `script`，一个 Job 内可用的参数见 [Job keywords](https://docs.gitlab.com/ee/ci/yaml/#job-keywords)。

在项目根目录下新建（最好是在本地工作区创建而不是线上，因为本地提交更改 push 后会直接运行管道操作，方便查看效果）`.gitlab-ci.yml` 文件，编写脚本：

```yml
stages: 
  - build
  - deploy

build_site:
  stage: build
  script:
    - echo "Start build"  # 打印内容
    - rm -fr ./node_modules && npm install --registry=https://registry.npm.taobao.org
    - npm run build       # 打包构建
    - echo "Build done"
  only: 
    - master              # 只在 master 分支代码发生变化时才执行该 Job
  tags:
    - test                # 指定 Runner 的 tag（注册 Runner 时指定的）
  artifacts:
    - expire_in: 1 week
    - paths:
      - dist/

deploy_site:
  stage: deploy
  script:
    - echo "Start deploy"
    # 将构建好后的 dist 目录拷贝到 NGINX 的挂载目录上
    - cp -fr ./dist /var/www/cicd-test
  only:
    - master
  dependencies:
    - build_site          # 接收 build_site 传递的产物
  tags:
    - test
```

按思路，build 阶段应执行打包产生一个 dist 目录，再在接下来的 deploy 阶段挂载到 NGINX 的目录上就完成了项目部署，但管道的设定是每个 Job 启动时都会同步仓库中的 `.gitignore` 文件并自动删除其中声明的文件——dist 目录在 deploy 阶段开始的时候就没了。

所以脚本文件中需要使用到另一个参数 [`artifacts`](https://docs.gitlab.com/ee/ci/yaml/README.html#artifacts)，我将它译为“**产物**”，表示**在当前 Job 执行成功/失败后可以将指定的文件或目录保存到 GitLab**，这样就可以在下面的 Jobs 中使用了，上面还指定了产物的过期时间。dependencies 用于在当前的 Job 中接收前面的产物，默认前面的所有 Jobs 里的产物都会往后传递，设为空数组则不接收任何产物。

push 之前还需要设定一下 `/var/www` 目录的权限，该目录默认属于 root 用户，而 Runner 运行时的用户是 gitlab-runner，权限交接：

```s
$ chown -hR gitlab-runner:gitlab-runner /var/www/
```

推送更改后，在项目的 CI/CD 面板中可查看管道和 Jobs 的详细情况：

![gitlab-ui.png](/images/gitlab-ci-cd_gitlab-ui.png "CI/CD 面板")

点击单独的 Job 也可查看详细的执行情况，UI 上的操作就不多介绍了，当管道内所有的阶段都执行完毕后，Vue 项目即部署成功：

![deploy-success.png](/images/gitlab-ci-cd_deploy-success.png "部署成功")

## References & Resources
1. [GitLab CI/CD | GitLab](https://docs.gitlab.com/ee/ci/) 
2. [CI/CD是什么？如何理解持续集成、持续交付和持续部署 | Red Hat](https://www.redhat.com/zh/topics/devops/what-is-ci-cd)
3. [给产品经理讲讲，什么是持续交付和DevOps | acejoy](https://blog.jjonline.cn/linux/238.html)
4. [How to auto deploy a Vue application using GitLab CI/CD on Ubuntu 18.04 | Michael Okoh](https://blog.logrocket.com/how-to-auto-deploy-a-vue-application-using-gitlab-ci-cd-on-ubuntu/)

[^1]: 图源 https://www.mindtheproduct.com/what-the-hell-are-ci-cd-and-devops-a-cheatsheet-for-the-rest-of-us/
[^2]: 执行者可以决定 Runner 执行器可以进行的操作，详见 [Executors](https://docs.gitlab.com/runner/executors/README.html)。