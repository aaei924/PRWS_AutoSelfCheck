const requestp = require("request-promise");
const request = require("request");
const JSEncrypt = require('node-jsencrypt');
const crypto = new JSEncrypt();
const sql = require('mysql');
const Fs = require('fs');

var cn = sql.createConnection({
    host: '',
    user: '',
    password: '',
    database: ''
});

cn.connect();
const work = cn.query('SELECT * FROM `iplist` WHERE `CovName` IS NOT NULL',
    function(err, rows, fields) {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < rows.length; i++) {
                // console.log(rows[i].CovName);
                code = rows[i].CovSchool;
                hksengn = rows[i].CovName;
                hsbirth = rows[i].CovBirth;
                reg = rows[i].CovRegion;
                pw = rows[i].register;
                AutoCheck(code, hksengn, hsbirth, reg, pw).catch;
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
        password: password
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
            //학생 본인이 37.5℃ 이상 발열 또는 발열감이 있나요?
            //단, 기저질환 등으로 코로나19와 관계없이 평소에 발열 증상이 계속되는 경우는 제외
            //1 : 아니요
            //2 : 예

            //학생에게 코로나19가 의심되는 아래의 임상증상*이 있나요?
            //*(주요 임상증상) 기침, 호흡곤란, 오한, 근육통, 두통, 인후통, 후각·미각 소실 또는 폐렴
            //단, 기저질환 등으로 코로나19와 관계없이 평소에 다음 증상이 계속되는 경우는 제외
            rspns02: "1",
            //1: 아니요
            //0: 예

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
            //학생 본인 또는 동거인이 방역당국에 의해 현재 자가격리가 이루어지고 있나요?
            //※ <방역당국 지침> 최근 14일 이내 해외 입국자, 확진자와 접촉자 등은 자가격리 조치
            //단, 직업특성상 잦은 해외 입·출국으로 의심증상이 없는 경우 자가격리 면제
            //0 : 아니요
            //1 : 예

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

async function AutoCheck(code, Name, Birth, region, password) {
    //var School = await SearchSchool(lctnScCode, schoolName);
    var url = region + 'hcs.eduro.go.kr';
    var Token = await findUser(code, Name, Birth, 'school', url);
    var Pass = await validatePassword(Token.token, password, url);
    var Select = await selectUserGroup(Pass, url);
    var Info = await getUserInfo(Select[0].token, code, Select[0].userPNo, url);
    serv = await Servey(Info.token, Token.userName, url);
    console.log(serv);

    var u = 'check.log';
    Fs.appendFile(u, Name + serv + '\n', function(err) {
        if (err) console.log(err);
        else console.log('로그 기록 완료');
    });
}
