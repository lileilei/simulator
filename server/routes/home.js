'use strict';

module.exports = (router, service) => {

    //****每个模块的路由单独建js文件，不要在这里加
    [
        '/',
        'home',
        'evection',
        'orders',
        'statues',
        'info',
        'guide',
        'finance',
        'analysis',
        'about',
        'connect',
        'job',
        'help',
        'links'
    ].forEach((url) => {
        router.get(url, service.common.isLogin(), service.common.renderQuickly('index'));
    });

    [
        'member/becomegold' //成为黄金会员
    ].forEach((url) => {
        router.get(url, service.common.isLogin(), service.common.renderQuickly('sindex'));
});

};