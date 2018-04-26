### 什么用
使用 `wepy` 开发项目时不需要手动配置 `app.wpy` 下的 `config.pages`，`autopages` 插件会自动监控 `pages` 目录下文件的变化，自动生成更新对应 `app.json` 下的 `pages`。
### 怎么用

#### 安装
```js
npm i wepy-plugin-autopages --save-dev
```

#### 配置
<s> `wepy.config.js` 中新增插件 `autopages` </s> ，这个版本不能直接使用配置，需要按照 `重要提示` 新增脚本解决，[脚本参考](https://github.com/cangku/wepy-plugin-autopages.git)
```js
plugins: [
    autopages: {}
]
```

### 重要提示
写这个插件之前的想法是这样的，在写入 `app.json` 之前先遍历指定 `pages` 目录去生成配置 `pages`。但是 `wepy` 中有读取 `app.wpy` 中的 `config` 配置的 `pages` 并缓存，联系 `wepy` 作者后，作者表示这种优化暂时不考虑放在当前版本，于是我在运行 `wepy build --watch` 之前添加了一个脚本来处理问题，脚本搭配该插件使用即可完美解决问题。