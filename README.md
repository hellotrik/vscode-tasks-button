# Tasks Button

**Tasks Button**，为你的 `Tasks` 添加 `Button` !

## 功能介绍

为 VS Code 的状态栏添加自定义按钮，让你能快速运行在 `.vscode/tasks.json` 中定义的任务。

![screenshot](images/screenshot.png)

## 使用方法

在你的 `.vscode/tasks.json` 中为任务添加 `icon`，并设置 `id`：

```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "echo",
            "type": "shell",
            "icon": {
                "id": "debug",
                "tooltip": "按钮提示(可省略)"
            },
            "command": "echo Hello",
        }
    ]
}
```


## 图标 id

你可以使用 VS Code 内置的图标，常用的图标包括：

- `play`: 播放图标
- `debug`: 调试图标
- `terminal`: 终端图标
- `gear`: 齿轮图标
- `folder-opened`: 打开的文件夹图标
- `refresh`: 刷新图标
- `rocket`: 火箭图标
- `flame`: 火焰图标
- `zap`: 闪电图标
- `star`: 星星图标
- `light-bulb`: 灯泡图标
- `heart`: 心形图标
- `bell`: 铃铛图标
- `shield`: 盾牌图标
- `tools`: 工具图标
- `beaker`: 烧杯图标
- `gift`: 礼物图标
- `megaphone`: 扩音器图标

更多图标可以参考 [VS Code 图标参考](https://code.visualstudio.com/api/references/icons-in-labels)，输入图标 `identifier` 即可。

![screenshot](images/vscodeicon.png)

## 注意

- 确保 `.vscode/tasks.json` 文件存在，这是插件激活的唯一条件。
- 需要显示的任务至少要有 `label` 属性。

## 许可证

MIT