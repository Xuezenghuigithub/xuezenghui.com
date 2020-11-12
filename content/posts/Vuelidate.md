---
title: "Vuelidate"
date: "2019-12-18T20:30:00+08:00"
tags: ["Vue.js"]
description: "一款基于 Vue.js 2.0的表单验证工具"
keywords: ["Vue 表单验证", "Vuelidate 教程", "Vuelidate"]
categories: ["Tech"]
toc: false
dropCap: false
comments: true
---
## 前言
[Vuelidate](https://vuelidate.js.org/) 是 [Vue.js 2.0](https://cn.vuejs.org/) 的一款表单验证工具，首先要表明的是选择其来做表单验证并是因为其相比于其它 Vue 表单验证工具有多么优秀，而是因为项目用到了一款基于 [Material Design](https://material.io/) 风格的 UI 框架 [Vuetify](https://vuetifyjs.com/en/)，此 UI 框架 **v1.5.x** 版本推荐使用的表单验证方式就是 Vuelidate（说商业胡吹吧 Vuelidate 官网也没提你 Vuetify 啊，是这个原因导致 Vuetify v2.0.x 版本又推荐了 [Vee-validate](https://logaretm.github.io/vee-validate/) 么？哈哈哈哈😄）。

## 用法
### 安装
```s
$ npm install vuelidate --save
```
### 导入
在`main.js`中引入并使用：

```vue
import Vuelidate from 'vuelidate';
Vue.use(Vuelidate);
```
### 基础使用

**1. 在组件中引入验证规则**

使用插件最方便之处就在于不用自己逐个去写正则表达式，Vuelidate 提供了很多常见的内置验证规则：

|验证规则|参数|作用|
|---|---|---|
|required|无|非空数据验证|
|requiredIf|flag[^1]|当 flag 为`true`时验证非空|
|requiredUnless|flag|当 flag 为`false`时验证非空|
|minLength|length|最小长度验证，包含 length 值|
|maxLength|length|最大长度验证，包含 length 值|
|minValue|value|数字或日期最小值验证|
|maxValue|value|数字或日期最大值验证|
|between|minValue, maxVulue|数字或日期指定区间验证|
|alpha|无|仅接受字母和字符|
|alphaNum|无|仅接受字母和数字|
|numeric|无|仅接受数字（不包含负数）|
|integer|无|仅接受正负整数|
|decimal|无|仅接受正负十进制数|
|email|无|电子邮箱验证|
|ipAddress|无|[IPv4地址](https://zh.wikipedia.org/wiki/IPv4)验证|
|macAddress|分隔符，如`:`、`' '`|[MAC地址](https://zh.wikipedia.org/wiki/MAC%E5%9C%B0%E5%9D%80)验证|
|sameAs|flag|验证与给定变量是否相等|
|url|无|网址验证|
|or|多个验证规则|当通过给定的至少一个验证规则时通过|
|and|多个验证规则|当通过所有的验证规则时通过|
|not|验证规则|当不通过给定的验证规则时通过，常与 sameAs 合用|
要使用这些内置的验证规则只需在组件中按需引入：

```vue
<script>
import { required, numeric } from "vuelidate/lib/validators";
</script>
```
**2. 验证表单**

Vuelidate 最便捷的验证方式是基于 Vue 的`v-model`数据来验证。也就是说，Vuelidate 和 Vue 采用的是相同的代码与页面交互方式——数据驱动视图，Vuelidate 通过监听双向绑定的数据来动态判断其是否通过验证规则，从而再将验证通过与否的不同结果反馈给用户。

**第一步、在 validations 中挂载需要验证的表单 data 数据**

```vue
export default {
  name: 'HelloWorld',
  validations: {
    zander: { required, numeric }
  },
  data() {
    return {
      zander: ''
    }
  }
}
```
**第二步、用 Vuelidate 的`$model`管理表单数据**

`$model`相当于`v-model`的替代，是对原始 data 数据的引用，在其它地方使用该数据时无需改变什么，`this.$v.data.$model`的值与`this.data`完全相同。被`$model`管理的数据含有一个 Boolean 类型的标志`$dirty`来表示数据是否改变，很容易理解——如果数据改动了，那它就是肮脏的🤣，`$dirty`置为 true。每当被验证的数据改变时 Vuelidate 都会验证一次数据是否通过验证规则。

`$model`的`$touch()`方法可以将`$dirty`的值手动设为 true，怎么用呢？如果你不想把 Vue 中的`v-model="data"`改为 Vuelidate 的`v-model="$v.data.$model"`，那就可以为输入框添加 change 方法，在 change 方法中再调用`$touch()`方法，两种方式的处理结果是完全相同的。


```vue
<input type="text" v-model="$v.zander.$model">
or 
<input type="text" v-model="zander" @change="$v.zander.$touch()">
```
> 如果觉得..每当用户输入一个字符..就验证一次太频繁，可以加上`v-model`的[`.lazy`](https://cn.vuejs.org/v2/guide/forms.html#lazy)修饰符来使验证频率改为..每当用户输入完成..后验证。


**第三步、添加验证不通过的反馈**

验证规则不通过自然要有反馈动作来提示用户哪里出错了或应该输入什么内容，如果在普通 Vue 项目[^2]中使用 Vuelidate，要显示验证不通过的错误信息需要自己手动添加反馈信息的容器和样式，根据验证结果控制容器的显示与隐藏即可：

```vue
<input type="text" v-model="$v.zander.$model">
<div v-if="!$v.zander.required">不能为空</div>
<div v-if="!$v.zander.numeric">请输入数字</div>
```

![required&numeric.gif](/images/vuelidate:required-numeric.gif "没有样式的验证反馈")

而至此，我方才明白为什么 Vuetify 推荐使用 Vuelidate 了：

![vuetify-vuelidate.gif](/images/vuelidate:vuetify-vuelidate.gif "Vuetify 中 Vuelidate 的验证反馈")

项目中每类表单的验证反馈几乎都需要统一的样式、合理的过渡动画，而这些，Vuetify 都替你做了🥰。相对的，在 Vuetify 中设置 Vuelidate 反馈的方式也有所不同了，也更简单了，只需要在给输入框绑定一个错误信息的属性，然后使用计算属性动态地设置验证反馈的具体文字：

```v
<v-text-field v-model="$v.zander.$model" :error-messages="zanderErrors"></v-text-field>
...
export default {
  computed: {
    zanderErrors() {
      const errors = [];
      if (!this.$v.zander.$dirty) return errors; // 验证通过则返回空数组
      !this.$v.zander.required && errors.push("不能为空"); // 短路语法，如果非空验证不通过则加入此反馈信息
      !this.$v.zander.numeric && errors.push("请输入数字"); // 短路语法，如果数字验证不通过则加入此反馈信息
      return errors;
    }
  }
}
```

### 进阶操作
上面三步已经基本完成了大多数简单表单验证，下面就再介绍几个我在使用过程中碰到的需要注意的点。

**1. 验证对象的某个属性**

就像上文中的第二个 GIF，我们给两个输入框绑定的是同一个对象的两个属性，想要给每个属性都添加不同的验证规则，只需要绑定时使用`.`语法访问对象的属性，挂载时使用嵌套的形式即可：

```v
<v-text-field v-model="$v.zanderObj.memo.$model" :error-messages="memoErrors"></v-text-field>
<v-text-field v-model="$v.zanderObj.amount.$model" :error-messages="amountErrors"></v-text-field>
...
export default {
  validations: {
    zanderObj: {
      memo: { required },
      amount: { required, numeric }
    }
  },
  data: () => ({
    zanderObj: {
        memo: '',
        amount: ''
    }
  })
}
```

**2. 自定义验证规则**

Vuelidate 内置验证规则固然好用，但往往并不能满足我们的实际需求，比如需要一个调整薪资数目的验证规则，需要验证正负整数及正负小数，这就需要我们去自定义验证规则，Vuelidate 提供了帮助我们自定义基于正则表达式验证规则的方法`regex()`。

首先需要引入 Vuelidate 的 helpers 对象，然后就可以使用`helpers.regex()`函数自定义符合我们要求的正则表达式规则，函数有两个参数，分别为该验证规则的描述和正则表达式。最后，像使用内置验证规则一样简单地使用自定义规则吧：

```vue
import { helpers } from 'vuelidate/lib/validators';

const money = helpers.regex('plusOrMinusFloatNum', /^(\-|\+)?\d+(\.\d+)?$/);
export default {
  ...
  validations: {
      adjustSalary: { required, money }
  },
  computed: {
    amountErrors() {
      const errors = [];
      if (!this.$v.adjustSalary.$dirty) return errors;
      !this.$v.adjustSalary.money && errors.push("请输入正确的调整数目");
      return errors;
    }
  }
}
```

**3. 提交表单的验证**

当然，表单验证的目的是让其提交正确格式的数据，这就需要在点击提交按钮时判断数据的正确性，如果不正确则不向后台发送请求等。`$invalid`是用于表示数据是否通过验证的 Boolean 类型状态值，其值为 true 时表示验证不通过，此次提交操作无效。

```vue
<template>
  <div>
    <input type="text" v-model="$v.zander.$model">
    <button @click="submit">提交</button>
    <div v-if="!$v.zander.required">不能为空</div>
    <div v-if="!$v.zander.numeric">请输入数字</div>
  </div>
</template>

<script>
import { required, numeric } from "vuelidate/lib/validators";

export default {
  name: "HelloWorld",
  validations: {
    zander: { required, numeric }
  },
  data() {
    return {
      zander: ""
    };
  },
  methods: {
    submit() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        confirm('无效提交');
      }
      ...
    }
  }
};
</script>
```

![submit-invalid.gif](/images/vuelidate:submit-invalid.gif "提交不成功")

还有一个常用的方法是`$reset()`，它的作用与`$touch()`正相反，将所有被验证数据的`$dirty`标志置为 false 状态，常用于重置表单操作：

```vue
...
<button @click="reset">重置</button>

<script>
export default {
  ...
  methods: {
    reset() {
      this.data = '';
      this.$v.$reset();
    }
  }
};
</script>
```

**4. 数组类型的验证**

是的，通过一段时间的实践运用，我觉得有必要也记录一下数组类型表单的验证。也就是在 Vue 中使用 `v-for` 渲染的表单，要验证数组中每一个对象的某个属性的 value，就需要用到一个新的指令 `$each`，意思显而易见——“每一项”，看实例：

```vue
<div v-for="(item, index) in $v.arr.$each.$iter" :key="index">
  <div>{{ item.$model.name }}</div>
  <input :error-messages="arrErrors" v-model.trim="item.age.$model" />
</div>

<script>
export default {
  validations: {
    arrCount: {
      $each: {
        age: { required, numeric }
      }
    }
  },
  data() {
    return {
      arr: [
        {
          name: "Zander",
          age: ""
        },
        {
          name: "Chris",
          age: ""
        }
      ]
    }
  },
  computed: {
    arrErrors() {
      const errors = [];
      for (let i = 0; i < this.arr.length; i++) { // 因为是数组，所以要循环判断每一项是否通过验证
        if (!this.$v.arr.$each[i].age.$dirty) return errors;
        !this.$v.arr.$each[i].age.required && errors.push("不能为空");
        !this.$v.arr.$each[i].age.numeric && errors.push("请输入数字");
      }
      return errors;
    }
  }
};
</script>
```

要用 Vuelidate 使用数据双向绑定的方式管理数组确实是有点繁琐了哈...所以，替代的便易办法是使用 `change` 事件监听输入框内容的变化，在变化的时候执行 `touch()` 方法让其对内容进行验证，在要验证的表单中添加 Vuelidate 的 `@input` 或 `@blur` 实现：

```html
<div v-for="(item, index) in arr" :key="index">
  <div>{{ item.name }}</div>
  <input :error-messages="arrErrors" @input="$v.arr.$touch()" v-model.trim="item.age" />
</div>
```

但是在 Vuetify 中验证数组表单有一个..小瑕疵..，如果数组中只有一项不通过验证，那么错误反馈会应用到数组表单中的每个要验证的属性，比如上面例子中的两个 `age` 的 `<input>` 标签都会提示错误，而不是只提示不通过验证的这一项。

---

Vuelidate 的功能远远不止于此，这里就只列举一些常见的用法和范例了。话说回来，其实项目中整体使用下来觉得 Vuelidate 也没有多么糟糕，具体情境具体考虑嘛！但个人觉得相对而言 [Vee-validate](https://logaretm.github.io/vee-validate/) 更为轻量，且验证的写法也更为简洁（Star 也更多😌）。当然，自身技术允许的话，撸一个 Vue 表单验证工具针对性地用于具体的项目是最好不过了。

---
[^1]: flag 可以是变量或函数，用于动态地改变是否采用此验证规则。
[^2]: 这里的「普通」指的是没有采用任何 UI 框架，使用原生 HTML 语言编写的 Vue 项目。
