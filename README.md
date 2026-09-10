# StudyOS

考研 + 项目 + 实习一体化的每日学习计划网页。单文件 HTML，数据存在浏览器本地（localStorage），不需要服务器。

> 完整版说明（功能清单、排程算法、参数、手机访问、数据同步、已知限制、下一步）见 **[StudyOS-总结.md](StudyOS-总结.md)**。

## 怎么打开

双击或用浏览器打开：

```
D:\codex\StudyOS\outputs\study_os.html
```

（浏览器地址栏形式：`file:///D:/codex/StudyOS/outputs/study_os.html`）

## 目录

```
outputs/study_os.html   ← 网页本体，只有这一个文件是你要用的
outputs/manifest.json   ← 手机“添加到主屏幕”用的应用信息
outputs/icon.svg        ← 主屏幕图标
启动手机访问.bat         ← 双击运行，手机就能在同一个 Wi-Fi 下打开
phone-help.txt          ← 上面那个 bat 打印出来的中文说明
work/                   ← 开发时的自动化验证脚本（check.js 排程验证、check_ui.js 界面验证）
README.md               ← 本文件
```

## 在手机上打开

**办法一：电脑当服务器（最快，不用注册任何东西）**

双击 `启动手机访问.bat`。它会打印出手机能访问的网址，并自动在电脑上打开页面。
手机连上同一个 Wi-Fi，浏览器输入那个网址即可。打开后点浏览器菜单里的
"添加到主屏幕"，以后就能像 App 一样点开。用完关掉黑窗口就断开。

打不开的排查顺序：

1. 第一次运行 Windows 会弹窗问"是否允许 Python 访问网络"，要选允许，并勾上"专用网络"。
2. 校园网 / 宿舍网可能隔离设备，换个热点试试（例如电脑开热点，手机连电脑热点）。
3. 试试 `[2]` 那组地址。

**办法二：把文件本身传到手机**

把 `outputs/study_os.html` 发到手机（微信文件传输助手、网盘都行），用手机浏览器打开。
缺点是 iOS 上打开本地 html 比较麻烦，而且手机上是独立的一份数据。

**办法三：发布到网上**

传到 GitHub Pages / Vercel 之类的静态托管，随时随地都能开，不要求同一个 Wi-Fi。
（注意内容是公开的。需要的话可以让 Codex 把仓库整理成可直接发布的形态。）

**关于数据同步**

任务和进度存在浏览器本地（localStorage），所以电脑和手机各存各的，互不影响。
要让两边一致：在电脑上「学习设置 → 导出备份」下载 JSON，传到手机后「导入备份」。
想做自动同步就得接一个后端/云数据库。

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
