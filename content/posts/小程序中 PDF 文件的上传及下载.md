---
title: "小程序中 PDF 文件的上传及下载"
date: "2019-09-30T00:00:00+08:00"
tags: ["小程序", "Node.js", "Vue.js"]
discripion: "微信小程序中将 PDF 文件上传至后台 Node.js 服务器进行数据处理和存储，在 Vue 中进行后台存储 PDF 文件的下载。"
keywords: ["小程序", "PDF上传", "PDF下载", "multer"]
categories: ["Tech"]
dropCap: false
slug: "upload-pdf"
gitinfo: true
---

<iframe frameborder="no" width=100% height=86 src="//music.163.com/outchain/player?type=2&id=552594869&auto=1&height=66"></iframe>

#### 需求
微信小程序中上传 PDF 文件（其它格式文件也可）至服务器（Node.js），并可在后台管理系统（Vue.js）中下载存储的 PDF 文件至本地。

#### 思路
1. 微信小程序中利用现有 API 实现本地文件的上传
2. 后台处理上传过来的二进制数据
3. 存储
4. Vue 中发送请求获取后台数据并下载至本地

## 开搞
#### 小程序中上传文件
首先要明确的是小程序中并没有提供可直接选择手机本地资源文件的 API，原因主要在于iOS系统出于保护用户隐私的文件系统，APP 访问不到系统本地的文件，市值2000亿美金的微信也不例外（辣鸡腾讯???🤨）。

但是，微信小程序提供了选择会话中文件的功能，即[`wx.chooseMessageFile()`](https://developers.weixin.qq.com/miniprogram/dev/api/media/image/wx.chooseMessageFile.html)接口。什么意思呢？就是比如我从电脑上发了一个文件给`文件传输助手`，那这个 API 就能在小程序中获取到这个文件的信息。获取到的文件信息包括：

- `path` 本地临时文件路径(上传时要用到)
- `size` 文件大小，单位为 B
- `name` 文件名
- `type` 文件类型

> 这就要求用户上传 PDF 文件时必须将文件先发送到任何会话中，本质上改变了**上传本地文件**的需求，所以我谨慎地在标题中没有加入..本地..二字。

拿到了文件的信息后使用[`wx.uploadFile()`](https://developers.weixin.qq.com/miniprogram/dev/api/network/upload/wx.uploadFile.html)接口发送请求上传选择好的 PDF 文件至后台，但是要注意的是编译运行前要勾选微信开发者工具中编辑器面板的详情中的**不校验合法域名、web-view (业务域名)、TLS 版本以及 HTTPS 证书**，原因请查阅小程序官方文档中的[域名配置说明](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html)。

```js
// 小程序页面js文件
Page({
  data: {
    filePath: "", // 文件路径
    filename: "" // 文件名
  },
  chooseFile: function() { // 点击选择文件按钮触发事件
    var _that = this;
    wx.chooseMessageFile({ // 会话中选择文件API
      count: 1, // 可选文件个数
      type: 'file', // 文件类型
      success(res) { // 选择成功后的回调函数
        var size = res.tempFiles[0].size; // 文件大小
        var filename = res.tempFiles[0].name; // 文件名
        if (size > 4194301) { // 判断文件大小不能大于4M
          wx.showToast({ // 弹框提示
            title: '文件大小不能超过4MB！',
            icon: "none",
            duration: 2000,
            mask: true
          })
        } else if (filename.indexOf('.pdf') == -1) { // 判断文件格式必须为pdf
          wx.showToast({
            title: '文件格式必须为PDF！',
            icon: "none",
            duration: 2000,
            mask: true
          })
        } else {
          _that.setData({
            filePath: res.tempFiles[0].path, // 保存文件地址到data
            filename: filename // 保存文件名
          })
        }
      }
    })
  },
  uploadFile: function(){ // 上传文件
    var _that = this;
      wx.uploadFile({ // 本地资源上传到服务器API
        url: 'http://localhost:3000/uploadFile', // 指定服务器接口URL
        filePath: _that.data.filePath, // 本地文件路径，即选择文件返回的路径
        name: 'file', // 上传文件的key，后台要用到
        formData: { // 可额外添加字段，存于请求的body对象中
          'filename': _that.data.filename
        },
        success(res) {
          const data = res.data
          console.log("success",data)
        }
      })
  }
})
```
#### 后台处理数据并存储

> 后台使用 Node.js + Express

既然已经知道小程序中上传的是二进制文件了那就好办了，[multer](https://github.com/expressjs/multer/blob/master/doc/README-zh-cn.md) 中间件是 Node.js 中处理 `multipart/form-data`类型数据的常用解决方案，中文文档写的也很清晰，建议往下看之前先仔细研读其文档，具体用法这里不再赘述了。

还有一点需要明确——存储 PDF 文件的方式。我们知道，MongoDB 中的 [GridFs](https://blog.csdn.net/Xue_zenghui/article/details/100982798) 支持文件的存储，但是要考虑项目中具体使用情境的影响如上传的文件数量、文件大小、并发量等，为避免文件数据量过大影响数据库存取效率，建议将 PDF 文件的二进制数据存储于..硬盘文件夹..中而不直接存入数据库中(有文件服务器另说)，下载的时候使用 Node.js 的`fs`模块再读取文件的二进制流就可以了，此时 Node.js 充当的角色就是简单的静态资源服务器。

```js
// uploadFile.js文件
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
var multer = require('multer'); // 引入multer中间件
var storage = multer.diskStorage({ // multer磁盘存储引擎
    destination: function (req, file, cb) {
        cb(null, 'uploads/') // 指定存储位置，必须手动创建此文件夹
    },
    filename: function (req, file, cb) { // 文件重命名
        var filename = req.body.filename; // 读取请求中formData中额外设置的filename
        cb(null, filename) // 将存储的文件重命名
    }
})
var upload = multer({
    storage: storage
})

router.post('/uploadFile', upload.single('file'), (req, res, next) => { // 此处的‘file’即小程序中上传文件时指定的name
    // req.file为文件信息
    // req.body为文本域信息
    res.json({
        status: 200
    })
})

module.exports = router;
```

此时，小程序中选择好文件后点击上传按钮服务器会把文件的二进制数据存储在代码中指定的 uploads 文件夹中：

![upload_pdf.jpeg](http://blog.xuezenghui.com/blog/upload_pdf.jpeg "存储成功的PDF")

#### 下载存储的 PDF 文件至本地
至此，小程序上传 PDF 文件的需求已经完成了。

既然用户上传了文件，我们就要拿到文件的内容，此处使用 Vue 搭建的的简易后台管理系统(说是个系统显然还不够格儿🤪)完成 PDF 文件的下载需求。

- 先来完成后台接口：

```js
// upload.js文件中添加
...
var fs = require('fs'); // 引入fs模块处理文件
...
router.post('/downloadFile',(req, res) => { // 返回文件二进制流数据接口
    var filename = req.body.filename;
    var file = './uploads/'+ filename; // 请求文件的实际路径
    res.writeHead(200, { // 设置响应头
        'Content-Type': 'application/octet-stream',// 告诉浏览器这是一个二进制文件
        'Content-Disposition': 'attachment; filename=' + encodeURI(filename),// 告诉浏览器这是一个需要下载的文件
    });
    var readStream = fs.createReadStream(file); // 得到文件输入流
    readStream.on('data', (chunk) => {
        res.write(chunk, 'binary'); // 文档内容以二进制的格式写到response的输出流
    });
    readStream.on('end', () => {
        res.end();
    })
})
```

- Vue 前台发送请求下载文件到本地：

```vue
<!-- 下载文件组件download.vue -->
<template>
  <div>
    <!-- 使用了vuetify UI框架的组件, Markdown的代码高亮好像不识别了= = -->
    <v-btn @click="download">下载pdf到本地</v-btn>
  </div>
</template>

<script>
export default {
  name: "download",
  data() {
    return {
        filename: 'test.pdf' // 指定要下载的文件名，与后台uploads文件夹中存储的文件名一致
    };
  },
  methods: {
    download() {
      this.$axios({
        method: "post",
        url: "/api/downloadFile", // 请求URL
        data: {
          filename: this.filename // 请求参数
        },
        responseType: "blob" // 设置返回的数据类型为二进制数据
      })
        .then(response => {
          this.downloadFile(response); // 将返回结果作为参数调用本地下载文件方法
        })
        .catch(error => {});
    },
    downloadFile(data) {
        var _that = this;
      if (!data) {
        return;
      }
      let url = window.URL.createObjectURL(new Blob([data.data])); // 后台返回结果data是个对象，其中的data属性才是文件的二进制数据
      let link = document.createElement("a"); // 创建a标签
      link.style.display = "none"; // 设置a标签不可见
      link.href = url; // 设置a标签的URL属性
      link.setAttribute("download", _that.filename); // 给a标签添加download属性并指定下载的文件名(记得加后缀指定下载的文件格式)

      document.body.appendChild(link); // 将a标签节点添加在DOM中
      link.click(); // 触发a标签
    }
  }
};
</script>
```
***
至此，**小程序上传文件**➡️**后台存储 PDF 文件**➡️**后台管理系统下载存储的文件**的整个流程已经走通😏，具体的业务需求就任君发挥了，比如将后台存储的所有文件名渲染在页面中，点击对应文件名将文件下载到本地、文件名多选再下载到本地等。

🎱案例 Github 地址：[小程序中 PDF 文件的上传及下载](https://github.com/Xuezenghuigithub/miniProgram_upload-download)
