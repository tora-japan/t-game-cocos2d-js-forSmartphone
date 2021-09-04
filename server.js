/*
 * server.js  デバッグ用(文字列確認)のnode.jsサーバー
 *
 * Copyright (c) 2021 tora-japan (s.noda)
 *
 * Released under the MIT license.
 * see https://opensource.org/licenses/MIT
 *
 * https://github.com/tora-japan/
 */
var server = require('ws').Server;
var s = new server({port:5001});
s.on('connection',function(ws){
    ws.on('message',function(message){ console.log(""+message); });
    ws.on('close',function(){ console.log('クライアントが閉じた'); });
});
