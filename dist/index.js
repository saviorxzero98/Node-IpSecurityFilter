"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");
const ipSecurityMiddleware_1 = require("./libs/ipSecurityMiddleware");
const ipFilter_1 = require("./libs/ipFilter");
// 建立 Express
const app = express();
// 設定 Body Parser
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// 設定靜態 HTML
let webPath = process.cwd();
let webrootPath = path.join(webPath, '/wwwroot');
if (fs.existsSync(webrootPath)) {
    app.use('/', express.static(webrootPath));
}
else {
    app.get('/', (req, res) => {
        res.status(200).send('Demo Express');
        res.end();
    });
}
// 設定 IP 限制規則
let rule = ipSecurityMiddleware_1.IpSecurityRule.createRule({
    isEnable: true,
    mode: ipFilter_1.IpFilterMode.Allow,
    allowIpList: [
        '127.0.0.1'
    ],
    denyIpList: [],
    trustedProxyIpList: [
        '127.0.0.1'
    ]
});
let denyMessageCallback = (message) => {
    console.warn(message);
};
// 設定 API Router
app.get('/users', ipSecurityMiddleware_1.IpSecurityUtils.getIpSecurityMiddleware(rule, denyMessageCallback), (req, res) => {
    const users = [
        { id: 1, name: 'Ace' },
        { id: 2, name: 'Jack' }
    ];
    res.status(200).send(users);
    res.end();
});
app.get('/users/:id', ipSecurityMiddleware_1.IpSecurityUtils.getIpSecurityMiddleware(rule, denyMessageCallback), (req, res) => {
    console.log(req.params);
    console.log(req.query);
    res.status(200).send(`You Get users ${req.params.id} ${req.query.name}`);
    res.end();
});
app.post('/users', ipSecurityMiddleware_1.IpSecurityUtils.getIpSecurityMiddleware(rule, denyMessageCallback), (req, res) => {
    console.log(req.body);
    res.status(200).send("You Post users");
    res.end();
});
app.put('/users/:id', ipSecurityMiddleware_1.IpSecurityUtils.getIpSecurityMiddleware(rule, denyMessageCallback), (req, res) => {
    console.log(req.params);
    console.log(req.body);
    res.status(200).send(`You Put users ${req.params.id}`);
    res.end();
});
app.delete('/users/:id', ipSecurityMiddleware_1.IpSecurityUtils.getIpSecurityMiddleware(rule, denyMessageCallback), (req, res) => {
    console.log(req.params);
    console.log(req.body);
    res.status(200).send(`You Delete users ${req.params.id}`);
    res.end();
});
// 設定 Post
app.listen(8000, () => {
    console.log('Example app listening on port 8000!');
});
//# sourceMappingURL=index.js.map