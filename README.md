# StudyOS

考研 + 项目 + 实习一体化的每日学习计划网页。单文件 HTML，数据存在浏览器本地（localStorage），不需要服务器。

## 怎么打开

双击或用浏览器打开：

```
D:\codex\StudyOS\outputs\study_os.html
```

（浏览器地址栏形式：`file:///D:/codex/StudyOS/outputs/study_os.html`）

## 目录

```
outputs/study_os.html   ← 网页本体，只有这一个文件是你要用的
work/                   ← 开发时的自动化验证脚本（check.js 排程验证、check_ui.js 界面验证）
README.md               ← 本文件
```

## 版本管理（git）

每次改动都会提交一次，所以任何一版都能退回来。在 PowerShell 里：

```
cd D:\codex\StudyOS
git log --oneline
```

看历史版本，每条前面那串字符是提交号。

```
git diff
```

看我改了但还没提交的内容。

```
git restore outputs/study_os.html
```

撤销未提交的改动，把文件恢复到上一次提交的样子。

```
git checkout <提交号> -- outputs/study_os.html
```

把某个历史版本取回来（提交号从 `git log --oneline` 里抄）。

```
git show <提交号>:outputs/study_os.html > 旧版.html
```

把某个历史版本另存成新文件，用来对比，不影响当前文件。

## 约定

- 所有产物默认放 D 盘，除非必须放 C 盘。
- 改完先跑验证脚本再提交：
  `node work\check.js outputs\study_os.html` 和 `node work\check_ui.js outputs\study_os.html`
