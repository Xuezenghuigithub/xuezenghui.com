---
title: '说 Markdown'
date: "2020-07-19T16:19:39+08:00"
tags: ["markdown"]
keywords: ["markwdown"]
categories: ["Tech"]
dropCap: true
slug: "about-markdown"
---
自大学接触前端开始也就慢慢接触了 Markdown，最开始在 [CSDN](https://blog.csdn.net/Xue_zenghui) 上用着默认的富文本编辑器，当时对富文本是没有什么优劣认知的，毕竟不是文本编辑器的深度使用者，转战 Markdown 是因为彼时网课老师的普及和多见的 GitHub 项目 README.md 文件。

现在，日复一日阅读和使用 Markdown 已一载有余，就来谈谈对 Markdown 的些许看法和使用建议。

---

[Markdown](https://daringfireball.net/projects/markdown/) 语言在2004年由[约翰·格鲁伯(John Gruber)](https://zh.wikipedia.org/wiki/%E7%B4%84%E7%BF%B0%C2%B7%E6%A0%BC%E9%AD%AF%E4%BC%AF)创建，初衷是希望「使用易于阅读、易于撰写的纯本文格式进行编写，然后可以转换为结构上有效的 XHTML（或 HTML）」。

Markdown 没有 RTF 格式[^1]复杂的语法，也没有 HTML 繁琐的 `<>` 结构（作为一名前端开发人员，真的厌恶这个符号），不使用任何编译器或编辑器也能很容易地识别要表达的内容。甚至使用过程中会让人感受不到这是一门..语言..、一个..规范..，它的确做到了简洁地让人只专注于创作，仅仅使用键盘多敲几个符号就解决了**基本的**排版问题。解决了基本的排版问题，但还有些问题是让人不能不提的：


**1. 图片无法指定大小**

众所周知，在 Markdown 中使用 `![alt](url)` 语法可以插入图片，但对图片的大小控制完全无力，很多时候都会因为图片问题严重影响文档的美观程度。而要想自行控制图片大小，只能又在 Markdown 文件中使用 HTML 语法—— `<image src="" width="">`，这不就又偏离初衷迷失本意了吗？

**2. 过渡依赖空格、缩进和空行进行排版**

虽然每次编写时也都不会忘记在 Markdown 符号后追加空格，但缩进和空行可就说不准了。在程序员编写 md 时会经常在列表下编辑代码段，就像这样：

- 代码示例：

    ```js
    console.log('Hello World')
    ```

书写这样的格式要求代码段必须与上面的列表采用**空行间隔 + 缩进**，缩进的多少对排版格式也有着莫大的影响（上面为缩进四个空格的结果），规范的不明确让人又回头思索起了如何排版的问题🤯。

其次，对空行的要求很高，少敲一个回车会导致排版混乱，多敲一个又会导致空行极多，往往一篇文章的空行数量有近..三分之一..，而这又是不可避免的……

![br-error.png](/images/markdown:br-error.png "缺少空行导致排版混乱")

还有一个不是 Markdown 的锅但同样让人头大的问题，书写中文文章时需要频繁地中英文切换，全角半角符号经常性切换不及，写错了还不易发现。

---

> 说实话不太理解和认同 Gruber 拒绝标准化的想法和做法。

接下来推荐两个笔者常用的 Markdown 编辑器吧：

**1. [Macdown](https://macdown.uranusjr.com/)**

一款 MacOS 上开源的 Markdown 编辑器，优点是界面简洁，..所见即所得..的编写模式，支持 LaTeX 公式、Mermaid，也支持图片以 Base64 拖入并显示于文档（奉劝不要尝试这种粗鲁的做法哈哈哈哈）。缺点是文档内容多了时上下滚屏会卡顿，还有如上图所示，对空行的要求较严格。

**2. [Typora](https://typora.io/)**

开源，支持 MacOS、Windows 和 Linux 三端，..实时预览..模式，同样支持 LaTeX 公式、Mermaid，还有文件目录、文档目录等功能，但这都不是最重要的，它内置的一款主题 Newsprint 实在是深得我意，与本博客的主题不谋而合，让人能极其舒适地码字：

![typora.png](/images/markdown:typora.png "Typora Newsprint 主题")

Typora 还有效避免了缺少空行导致的排版问题，它会在隔离的 Markdown 符号上下都自动加入空行，但这种处理方式又导致要实现上面的「列表下编辑代码段」会特麻烦……总之还是上面总结的几点 Markdown 语言的问题导致的。

[^1]: Rich Text Format，富文本格式。