---
title: "常用 CSS 样式总结"
date: "2019-10-09T00:00:00+08:00"
tags: ["CSS"]
discripion: "常用 CSS 样式总结"
keywords: ["CSS", "常用样式"]
categories: ["Tech"]
dropCap: false
toc: true
slug: "common-css"
gitinfo: true
comments: true
---
## 标题左右横线

![title_h.png](/images/common-css:title-h.png "效果图")

```html
<div class="title"></div>
```
```css
.title {
  position: relative;
  font-size: 18px;
  line-height: 18px;
  text-align: center;
  top: 60px; /* 标题与顶部距离 */
}
.title:before {
  content: "";
  position: absolute;
  width: 28px; /* 横线长度 */
  height: 1px; /* 横线粗细 */
  top: 50%;
  background-color: #ddd; /*  横线颜色 */
  left: 28%; /* 左横线与文字距离 */
}
.title:after {
  content: "";
  position: absolute;
  width: 28px;
  height: 1px;
  top: 50%;
  background-color: #ddd;
  right: 28%; /* 右横线与文字距离 */
}
```
## 微信小程序——多行文本展开/收起

![up&down.gif](/images/common-css:up&down.gif "效果图")

```html
<!-- .wxml文件 -->
<text class="text {{ellipsis?'ellipsis':'unellipsis'}}">北京百星电子系统有限公司（以下简称百星公司）成立于1995年，是全外资的高科技企业，运用“云”技术理念，为客户提供专业的外包服务解决方案，对可变数据的抓取、生成电子文档、存储、传输、调阅、发送、打印等各个阶段实现全面优化管理与监控。截至目前，已在全国主要省会城市建立12个自有打印制作中心，与客户合作建立31个外包服务站点。</text>
<view bindtap='ellipsis' class="ellipsis_arrow">
  <image class="ellipsis_img" src="{{ellipsis?'/images/down.png':'/images/up.png'}}"></image>
</view>
```
```css
// .wxss文件

.text {
  display: -webkit-box; /* 自适应盒模型 */
  text-overflow: ellipsis; /* 文字溢出显示省略号 */
  -webkit-box-orient: vertical; /* 内容水平排列 */
  font-size: 24rpx;
  line-height: 40rpx;
  color: rgb(135, 135, 135);
  padding: 0 20px;
  padding-top: 60px;
  overflow: hidden; /* 必须设置溢出隐藏 */
}

.ellipsis {
  -webkit-line-clamp: 5; /* 收起显示的文字行数 */
}

.unellipsis {
  -webkit-line-clamp: 0; /* 展开后显示全部 */
}

.ellipsis_arrow { /* 小箭头样式 */
  width: 30px;
  display: block;
  margin: auto;
  margin-top: -4px
}

.ellipsis_img { /* 箭头图片大小 */
  width: 30px;
  height: 30px;
}
```
```js
// .js文件

Page({
  data: {
    ellipsis: true // 默认收起
  },
  ellipsis: function() { // 点击小箭头触发事件
    var value = !this.data.ellipsis;
    this.setData({
      ellipsis: value
    })
  }
)}
```
## 微信小程序——时间轴组件

<img src="/images/common-css:timeline.png" width="300" title="效果图">

### timeline 组件：
```html
<!-- timeline.wxml -->

<view class="time_line">
  <!-- 左边时间轴 -->
  <view class='leftView'>
    <view class="outRoundView"></view>
    <view class='leftLine'>
    </view>
  </view>
  <!-- 右边文字 -->
  <view class='rightContent'>
    <slot name="rightChilren"></slot>
    <text wx:if="{{axisTitle!=''}}" class='rightTitle'>{{axisTitle}}</text>
    <block wx:if="{{textArray.length>0}}">
      <text wx:for="{{textArray}}" wx:key="unique" class='rightText'>{{item}}</text>
    </block>
    <text class='rightText'>{{axisText}}</text>
  </view>
</view>
```
```css
/* timeline.wxss */

.timeline {
  display: flex;
  flex: 1;
  padding: 0px 20px;
  background-color: #fff;
}

.leftView {
  display: flex;
  flex-direction: column;
}

.outRoundView {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #999;
}

.leftLine {
  display: flex;
  flex: 1;
  width: 1px;
  margin-left: 6px;
  padding-bottom: 6px;
  background: #dadada;
}

.rightContent {
  display: flex;
  flex: 1;
  flex-direction: column;
  margin-top: -6px;
  margin-left: 15px;
  padding-bottom: 24px;
}

.rightTitle {
  font-size: 32rpx;
  line-height: 22.5px;
  color: rgba(0, 0, 0, .7);
}

.rightText {
  font-size: 14px;
  color: #999;
}
```
```js
// timeline.js

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShowLeftLine: { // 是否显示时间轴
      type: Boolean,
      value: true
    },
    axisTitle: { // 标题
      type: String,
      value: ''
    },
    axisText: { // 文字
      type: String,
      value: ''
    },
    textArray: { // 多行文字
      type: Array,
      value: []
    }
  }
})
```


```js
// timeline.json
{
  "component": true
}
```
### 使用组件的页面：
```html
<!-- .html文件 -->

<view>
  <timeLine axisTitle="1995年" axisText="Bel-Star【北京百星电子系统有限公司】成立于北京"></timeLine>
  <timeLine axisTitle="2000年" axisText="荣获Oce亚太地区打印机销售冠军"></timeLine>
  <timeLine axisTitle="2005年" textArray="{{textArray2005}}"></timeLine>
  <timeLine axisTitle="2008年" axisText="发表EOMO保单云端处理生产管理平台"></timeLine>
  <timeLine axisTitle="2015年" textArray="{{textArray2015}}"></timeLine>
  <timeLine axisTitle="2017年" textArray="{{textArray2017}}"></timeLine>
  <timeLine axisTitle="2019年" textArray="{{textArray2019}}"></timeLine>
</view>
```
```js
// .json文件

{
  "usingComponents": {
      "timeLine":"/components/timeLine/timeLine"
  }
}
```