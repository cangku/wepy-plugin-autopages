import { default as AutoPages, isString } from 'wepy-plugin-autopages';
import fs from 'fs';
import path from 'path';
import childProcess from 'child_process';
import chokidar from 'chokidar';
/**
 * === config ===
 * src      项目名称 eg: src
 * page     页面文件存放名称 eg: pages
 * === config ===
 */

const config = {
    src: 'src',
    path: ['pages', 'miniapp'],
    default: 'pages/index/index'
};
let isRunDev = false;

let appWpyPath = path.join(config.src, 'app.wpy');

let appWpyCode = fs.readFileSync(appWpyPath, { encoding: 'utf-8' });
let reg = /[\s\r\n]config\s*=[\s\r\n]*(\{([\r\n]?.+)+\})/;
let code = appWpyCode.match(reg);
let pagesConfig = new Function('return ' + code[1])();

// 模拟
const ap = new AutoPages(config);
let appConfig = null;

// 监听子进程事件
function processListener(workerProcess) {
    workerProcess.stderr.on('data', function(data) {
        console.log('stderr: ' + data);
    });

    workerProcess.stdout.on('data', function(data) {
        console.log('stdout: ' + data);
    });
}

function next(c) {
    let code = c || this.code;
    appConfig = JSON.parse(code);
    appWpyCode = appWpyCode.replace(reg, (m, n) => {
        return m.replace(n, code);
    });
    fs.writeFileSync(appWpyPath, appWpyCode);
    //
    process.on('message', m => {
        console.log('CHILD got message:', m);
    });
    let fixProcess = childProcess.exec('npm run fix');
    processListener(fixProcess);
    if (!isRunDev) {
        isRunDev = true;
        let devProcess = childProcess.exec('npm run dev');
        processListener(devProcess);
    }
}

// next

// 遍历pages生成配置文件
if (isString(config.path)) {
    config.path = [config.path];
}

let pagePath = [];
config.path.map(p => {
    pagePath.push(path.join(config.src, p));
});
chokidar
    .watch(pagePath)
    .on('add', (path, stats) => {
        if (isRunDev) {
            let page = ap.getPage(path);
            page && appConfig.pages.push(page);
            next(JSON.stringify(appConfig));
        }
    })
    .on('unlink', (path, stats) => {
        let page = ap.getPage(path);
        page && appConfig.pages.remove(page);
        next(JSON.stringify(appConfig));
    })
    .on('ready', () => {
        ap.apply({
            file: 'app.json',
            next,
            code: JSON.stringify(pagesConfig)
        });
    });
