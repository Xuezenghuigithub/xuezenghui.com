---
title: "K8S 中使用非 root 用户运行前端项目"
description: "K8S 中使用非 root 用户运行前端项目，将 nginx 镜像切换为 nginx-unprivileged"
date: "2024-04-07T13:47:50+08:00"
tags: ["Kubernetes", "Security"]
keywords: ["Kubernetes", "nginx-unprivileged", "runAsNonRoot"]
categories: ["Tech"]
slug: "run-frontend-container-as-non-root-in-k8s"
gitinfo: true
comments: true
toc: false
---

Kubernetes 中的镜像一般根据项目类型进行构建，前端项目的最佳实践是将 Dockerfile、项目的 Nginx 配置文件与代码文件统一管理在 Git 仓库中，Dockerfile 中使用的镜像若为 Nginx 的基本镜像 [`nginx`](https://hub.docker.com/_/nginx) 则不符合安全性的要求，因为该镜像监听的端口是 80，而 0-1024 为特权端口，**只能使用 root 用户来运行**。换句话说，你跑在 k8s 中的前端项目的 Pod 也将以 root 用户运行，Pen-test 给出的不安全评级为 Medium：

A number of containers were running as the ‘root’ user (this is the default setting) which could make it easier for an attacker with access to the containers to break out to the underlying host.
The following was identified:

```s
$ id
uid=0(root) gid=0(root) groups=0(root)
```

解决方案分为两步：

1. 使用 Nginx 的非特权镜像 [nginx-unprivileged](https://hub.docker.com/r/nginxinc/nginx-unprivileged) 作为前端项目的基础镜像
2. 部署到 K8s 时设置 Pod 的[安全上下文](https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/security-context/) `runAsNonRoot` 配置

## 更换 Nginx 基础镜像

从 nginx-unprivileged 镜像的文档和[源代码](https://github.com/nginxinc/docker-nginx-unprivileged/blob/main/stable/debian/Dockerfile)中可以得到以下几个重要信息：

- 监听的端口由 80 更换为 8080
- 运行容器的新用户为 `nginx`
- `nginx` 用户的 **UID 为 101**

更新 Dockerfile 文件：

```docker
FROM nginxinc/nginx-unprivileged:latest

# 替换项目中的 Nginx 配置文件
USER root
ADD ./dist /usr/share/nginx/html
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
RUN chmod -R 777 /etc/nginx/
RUN id nginx
USER nginx

CMD ["nginx", "-g", "daemon off;"]
```

由于更换了新的端口，修改旧的 Nginx 配置文件监听端口为 8080：

```nginx
server {
    listen 8080;

    root /usr/share/nginx/html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* ^.+\.(ico|gif|jpg|jpeg|png|js|css|svg)$ {
        access_log   off;
        add_header Cache-Control "immutable";
        expires      1y;
    }

    location ~* ^.+\.(otf)$ {
        add_header Cache-Control "immutable";
        access_log   off;
        expires      1y;
    }
}
```

## 修改 K8s 配置

安全上下文（Security Context）有两个层级：Pod 层级和 Container 层级。Pod 层级的安全上下文会应用到 Pod 中所有的 Container，Container 层级的安全上下文只影响设置的 Container，且如果 Pod 层级上同时也设置了，则会以 Container 层级的设置为准，重写 Pod 层级的设置。

所以要根据项目的情况来选择，但常见情况下前端项目只有一个 Container，设置在两个层级没有差别，此处以设置在 Pod 层级为例，**设置 `runAsNonRoot` 为 `true`，`runAsUser` 为上面得到的 `nginx` 用户 UID 101**：

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-demo
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 101
  containers:
  - name: frontend-demo
    image: frontend-demo-image
```

同时将端口相关的配置由 80 改为 8080，如 **containerPort 、探针检测的端口**：

```yaml
  ...
  containers:
  - name: frontend-demo
    ports:
      - containerPort: 8080
        name: 8080tcp
        protocol: TCP
    livenessProbe:
      failureThreshold: 3
      httpGet:
        path: /index.html
        port: 8080
        scheme: HTTP
      initialDelaySeconds: 90
      periodSeconds: 30
      successThreshold: 1
      timeoutSeconds: 2
    startupProbe:
      failureThreshold: 30
      httpGet:
        path: /index.html
        port: 8080
        scheme: HTTP
      initialDelaySeconds: 60
      periodSeconds: 5
      successThreshold: 1
      timeoutSeconds: 2
```

以及作为服务发现的 Service 的端口：

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-demo-service
spec:
  ports:
    - nodePort: 32329
      port: 8946
      protocol: TCP
      targetPort: 8080
```

## 验证
在 Container 中执行 `id` 命令：

```s
$ id
uid=101(nginx) gid=101(nginx) groups=101(nginx)
```

得解。