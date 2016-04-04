#!/usr/bin/env node

'use strict';

var version = "`PROJECT ORZCLASSIFIER VERSION 20160204`";

var TelegramLib = require('node-telegram-bot-api');
var config = require('./config.js');
var confreader = require('jsonfile');

var afile = './assigns.json';
var assigns = confreader.readFileSync(afile);
var tg = new TelegramLib(config.tg_bot_api_key, { polling: true });

var inittime = Math.round(new Date().getTime() / 1000);

tg.on('message', function (msg) {
    if (msg.date < inittime) return;
    if (msg.chat.id > 0) return;
    if (msg.text === undefined) return;
    if (msg.text.slice(0, 7) == '=assign') {
        var cmd = msg.text.split(' ');
        if (cmd.length == 3) {
            if (cmd[2] == 'delete')
                delete assigns[cmd[1]];
            else
                assigns[cmd[1]] = cmd[2];
            confreader.writeFile(afile, assigns, function (err) {
                tg.sendMessage(msg.chat.id, err);
            });
            tg.sendMessage(msg.chat.id, 'Operation Completed');
        } else if (cmd.length == 1) {
            tg.sendMessage(msg.from.id, JSON.stringify(assigns));
        }
        return;
    }
    if (msg.reply_to_message != undefined) {
        var hlist = msg.text.split(' ');
        hlist.forEach(function (child){
            if (assigns[child] != undefined)
                tg.forwardMessage(assigns[child], msg.chat.id, msg.reply_to_message.message_id);
        })
    }
});