const requestp = require('request-promise');
const raon = require('./raon');
const request = require("request");
const sql = require('mysql');
const Fs = require('fs');
const nodeFetch = require('node-fetch')
const fetch = require("fetch-cookie")(nodeFetch)

var cn = sql.createConnection({
    host: '',
    user: '',
    password: '',
    database: ''
});

cn.connect();
cn.query('SELECT * FROM `selfcheck`',
    function(err, rows) {
        if (err) {
            console.log(err);
        } else {
            for (var i = 0; i < rows.length; i++) {
                code = rows[i].orgCode;
                hksengn = rows[i].name;
                hsbirth = rows[i].birthday;
                reg = rows[i].region;
                pw = rows[i].password;
                lt = rows[i].loginType;
                AutoCheck(code, hksengn, hsbirth, reg, pw,lt).catch;
            }
        }
    });
cn.end();
// ###################################### API V2 ##########################################
async function Request(url, header, json) {
    json = JSON.stringify(json);
    response = await fetch('https://' + url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-GB,en;q=0.9,ko-KR;q=0.8,ko;q=0.7,ja-JP;q=0.6,ja;q=0.5,zh-TW;q=0.4,zh;q=0.3,en-US;q=0.2',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Origin': 'https://hcs.eduro.go.kr',
            'Pragma': 'no-cache',
            'Referer': 'https://hcs.eduro.go.kr/',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-site',
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
            'X-Requested-With': 'XMLHttpRequest',
            ...header
        },
        body: json
    })
    let value = await response.text()
    try {
        value = JSON.parse(value)
    } catch (ignored) {
    }
    return value
}
async function AutoCheck(code, Name, Birth, region, password,loginType) {
    //var School = await SearchSchool(lctnScCode, schoolName);
    const p_wd = await raon(password);
    var url = region + 'hcs.eduro.go.kr';
    var Token = await Request(url+'/v2/findUser', {}, 
        {orgCode: code, name: Name, birthday: Birth, loginType: loginType, stdntPNo: null}
    );
    var Pass = await Request(url+'/v2/validatePassword', {Authorization: Token.token}, {deviceUuid: '',makeSession: true,password: p_wd});
    var Select = await Request(url+'/v2/selectUserGroup', {Authorization: Pass}, {});
    var Info = await Request(url+'/v2/getUserInfo', {Authorization: Select[0].token}, {orgCode: code, userPNo: Select[0].userPNo});
    var Serv = await Request(url+'/registerServey', {Authorization: Info.token}, {rspns00: "Y",rspns01: "1",rspns02: "1",rspns03: null,rspns04: null,rspns05: null,rspns06: null,rspns07: null,rspns08: null,rspns09: "0",rspns10: null,rspns11: null,rspns12: null,rspns13: null,rspns14: null,rspns15: null,upperToken: Info.token,upperUserNameEncpt: Info.userName,deviceUuid: Info.deviceUuid});
    console.log(Serv);

    Fs.appendFile('check.log', JSON.stringify(Serv) + '\n', function(err) {
        if (err) console.log(err);
        else console.log('로그 기록 완료');
    });
}
