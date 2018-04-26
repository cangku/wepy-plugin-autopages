import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';

// tool
Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

/**
 * isArray
 */
export function isArray(data) {
    return Object.prototype.toString.call(data).indexOf('Array') !== -1;
}

/**
 * isString
 */
export function isString(data) {
    return Object.prototype.toString.call(data).indexOf('String') !== -1;
}
export default class {

    constructor(c = {}) {
        const def = {
            src: 'src',
            path: 'pages',
            default: '',
            exts: ['wpy']
        };

        this.setting = Object.assign({}, def, c);
    }

    apply(op) {
        // only app.json
        let appConfig = null;
        let setting = this.setting;

        if (!/app\.json/.test(op.file)) {
            op.next();
            return;
        }

        try {
            appConfig = JSON.parse(op.code);
        } catch (e) {
            throw e;
        }
        console.log(123)
        // 遍历pages生成配置文件
        if(isString(setting.path)) {
            setting.path = [setting.path];
        }
        let files = [];
        setting.path.map(p => {
            let pagePath = path.join(setting.src, p);
            files = files.concat(this.getAllFiles(pagePath));
        })
        console.log(files)
        // 默认首页
        if(setting.default) {
            files.unshift(setting.default);
        }
        appConfig.pages = files;

        // next
        // let pagePath = path.join(setting.src, setting.path);
        // chokidar.watch(pagePath).on('add', (path, stats) => {
        //     let page = this.getPage(path);
        //     page && appConfig.pages.push(page);
        //     this.output('新增页面', op, appConfig);
        // }).on('unlink', (path, stats) => {
        //     let page = this.getPage(path);
        //     page && appConfig.pages.remove(page);
        //     this.output('删除页面', op, appConfig);
        // })
        
        this.output('页面配置', op, appConfig);
    }

    /**
     * 输出页面
     */
    output(tip, op, appConfig) {
        op.output && op.output({
            action: tip,
            file: op.file
        });
        // 去重
        appConfig.pages = Array.from(new Set(appConfig.pages));
        op.code = JSON.stringify(appConfig);
        op.next();
    }

    /**
     * 获取指定路径下的所有文件
     */
    getAllFiles(dir) {
        let files = fs.readdirSync(dir);
        let rst = [];
        files.forEach(item => {
            let filepath = `${dir}${path.sep}${item}`;
            let stat = fs.statSync(filepath);
            if (stat.isFile()) {
                let page = this.getPage(filepath);
                page && rst.push(page);
            } else if(stat.isDirectory()){
                rst = rst.concat(this.getAllFiles(filepath));
            }
        });
        return rst;
    }

    /**
     * 指定路径字符串，返回 page
     * @param {string} pagePath 
     */
    getPage(pagePath) {
        if (path.extname(pagePath).includes(this.setting.exts)) {
            let { dir, name } = path.parse(pagePath);
            return path.relative(this.setting.src, path.join(dir, name)).replace(/\\/g, '/');
        } else {
            return '';
        }
    }
}