const requestp = require("request-promise");
const request = require("request");
const JSEncrypt = require('node-jsencrypt');
const crypto = new JSEncrypt();
const sql = require('mysql');
const Fs = require('fs');

var cn = sql.createConnection({
    host: 'localhost',
    user: '',
    password: '',
    database: ''
});

cn.connect();
const work = cn.query('SELECT * FROM `table` WHERE `Name` IS NOT NULL',
    function(err, rows, fields) {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < rows.length; i++) {
                // console.log(rows[i].Name);
                code = rows[i].School;
                hksengn = rows[i].Name;
                hsbirth = rows[i].Birth;
                reg = rows[i].Region;
                AutoCheck(code, hksengn, hsbirth, reg).catch;
            }
        }
    });
cn.end();

crypto.setPublicKey("MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA81dCnCKt0NVH7j5Oh2+SGgEU0aqi5u6sYXemouJWXOlZO3jqDsHYM1qfEjVvCOmeoMNFXYSXdNhflU7mjWP8jWUmkYIQ8o3FGqMzsMTNxr+bAp0cULWu9eYmycjJwWIxxB7vUwvpEUNicgW7v5nCwmF5HS33Hmn7yDzcfjfBs99K5xJEppHG0qc+q3YXxxPpwZNIRFn0Wtxt0Muh1U8avvWyw03uQ/wMBnzhwUC8T4G5NclLEWzOQExbQ4oDlZBv8BM/WxxuOyu0I8bDUDdutJOfREYRZBlazFHvRKNNQQD2qDfjRz484uFs7b5nykjaMB9k/EJAuHjJzGs9MMMWtQIDAQAB");

// ###################################### API V2 ##########################################

findUser = (orgcode, name, birthday, loginType, url) => new Promise((resolve, reject) =>
    request.post({
        url: `https://` + url + `/v2/findUser`,
        method: "POST",
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13B143',
            'Content-Type': 'application/json',
            'Origin': 'https://hcs.eduro.go.kr',
            'Referer': 'https://hcs.eduro.go.kr/'
        },
        json: {
            orgCode: orgcode,
            name: crypto.encrypt(name),
            birthday: crypto.encrypt(birthday),
            loginType: loginType,
            stdntPNo: null
        }
    }, function(err, res, body) {
        if (err) reject(err);
        resolve(body);
    }));
hasPassword = (token, url) => new Promise((resolve, reject) => request.post({
    url: `https://` + url + `/v2/hasPassword`,
    method: "POST",
    headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13B143',
        'Content-Type': 'application/json',
        'Authorization': token,
        'Origin': 'https://hcs.eduro.go.kr',
        'Referer': 'https://hcs.eduro.go.kr/'
    },
    json: {}
}, function(err, res, body, url) {
    if (err) reject(err);
    resolve(body);
}));
validatePassword = (token, password, url) => new Promise((resolve, reject) => request.post({
    url: `https://` + url + `/v2/validatePassword`,
    method: "POST",
    headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13B143',
        'Content-Type': 'application/json',
        'Authorization': token,
        'Origin': 'https://hcs.eduro.go.kr',
        'Referer': 'https://hcs.eduro.go.kr/'
    },
    json: {
        deviceUuid: "",
        password: crypto.encrypt(password, url)
    }
}, function(err, res, body) {
    if (err) reject(err);
    resolve(body);
}));
selectUserGroup = (token, url) => new Promise((resolve, reject) => request.post({
    url: `https://` + url + `/v2/selectUserGroup`,
    method: "POST",
    headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13B143',
        'Content-Type': 'application/json',
        'Authorization': token,
        'Origin': 'https://hcs.eduro.go.kr',
        'Referer': 'https://hcs.eduro.go.kr/'
    },
    json: {}
}, function(err, res, body) {
    if (err) reject(err);
    resolve(body);
}));
getUserInfo = (token, orgCode, userPNo, url) => new Promise((resolve, reject) => request.post({
    url: `https://` + url + `/v2/getUserInfo`,
    method: "POST",
    headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13B143',
        'Content-Type': 'application/json',
        'Authorization': token,
        'Origin': 'https://hcs.eduro.go.kr',
        'Referer': 'https://hcs.eduro.go.kr/'
    },
    json: {
        orgCode: orgCode,
        userPNo: userPNo
    }
}, function(err, res, body) {
    if (err) reject(err);
    resolve(body);
}));
Servey = (token, username, url) => new Promise((resolve, reject) =>
    request.post({
        url: "https://" + url + "/registerServey",
        method: "POST",
        headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Mobile/13B143',
            'Authorization': token,
            'Host': url,
            'Origin': 'https://hcs.eduro.go.kr',
            'Referer': 'https://hcs.eduro.go.kr/',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site'

        },
        json: {
            rspns00: "Y",
            //return "1" === rspns01 && "1" === rspns02 && "0" === rspns09 ? rspns00 = "Y" : rspns00 = "N"

            rspns01: "1",
            
            rspns02: "1",
           

            rspns03: null,
            //Unknown
            rspns04: null,
            //Unknown
            rspns05: null,
            //Unknown
            rspns06: null,
            //Unknown
            rspns07: null,
            //Unknown
            rspns08: null,
            //Unknown

            rspns09: "0",
           

            rspns10: null,
            //Unknown
            rspns11: null,
            //Unknown
            rspns12: null,
            //Unknown
            rspns13: null,
            //Unknown
            rspns14: null,
            //Unknown
            rspns15: null,
            //Unknown
            upperToken: token,
            upperUserNameEncpt: username,
            deviceUuid: ""
        }
    }, function(err, res, body) {
        if (err) reject(err);
        resolve(JSON.stringify(res));
    }));

async function AutoCheck(code, Name, Birth, region) {
    //var School = await SearchSchool(lctnScCode, schoolName);
    var url = region + 'hcs.eduro.go.kr';
    var Token = await findUser(code, Name, Birth, 'school', url);
    var Select = await selectUserGroup(Token.token, url);
    var Info = await getUserInfo(Select[0].token, code, userPNo, url);
    serv = await Servey(Info.token, Token.userName, url);
    console.log(serv);

    var u = './check.log';
    Fs.appendFile(u, Name + serv + '\n', function(err) {
        if (err) console.log(err);
        else console.log('로그 기록 완료');
    });
}
