/*************************

京东多合一签到脚本

更新时间: 2020.11.17 21:35 v1.85
有效接口: 48+
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
电报频道: @NobyDa 
问题反馈: @NobyDa_bot 
如果转载: 请注明出处

*************************
【 JSbox, Node.js 说明 】 :
*************************

开启抓包app后, Safari浏览器登录 https://bean.m.jd.com 点击签到并且出现签到日历后, 返回抓包app搜索关键字 functionId=signBean 复制请求头Cookie填入以下Key处的单引号内即可 */

var Key = ''; //单引号内自行填写您抓取的Cookie

var DualKey = ''; //如需双账号签到,此处单引号内填写抓取的"账号2"Cookie, 否则请勿填写

/* 注1: 以上选项仅针对于JsBox或Node.js, 如果使用QX,Surge,Loon, 请使用脚本获取Cookie.
   注2: 双账号用户抓取"账号1"Cookie后, 请勿点击退出账号(可能会导致Cookie失效), 需清除浏览器资料或更换浏览器登录"账号2"抓取.
   注3: 如果复制的Cookie开头为"Cookie: "请把它删除后填入.
   注4: 如果使用QX,Surge,Loon并获取Cookie后, 再重复填写以上选项, 则签到优先读取以上Cookie.
   注5: 如果使用Node.js, 需自行安装'request'模块. 例: npm install request -g
   注6: Node.js或JSbox环境下已配置数据持久化, 填写Cookie运行一次后, 后续更新脚本无需再次填写, 待Cookie失效后重新抓取填写即可.

*************************
【 QX, Surge, Loon 说明 】 :
*************************

初次使用时, app配置文件添加脚本配置,并启用Mitm后, Safari浏览器打开登录 https://bean.m.jd.com ,点击签到并且出现签到日历后, 如果通知获得cookie成功, 则可以使用此签到脚本。 注: 请勿在京东APP内获取!!!

由于cookie的有效性(经测试网页Cookie有效周期最长31天)，如果脚本后续弹出cookie无效的通知，则需要重复上述步骤。 
签到脚本将在每天的凌晨0:05执行, 您可以修改执行时间。 因部分接口京豆限量领取, 建议调整为凌晨签到。

BoxJs订阅地址: https://raw.githubusercontent.com/NobyDa/Script/master/NobyDa_BoxJs.json

*************************
【 配置双京东账号签到说明 】 : 
*************************

正确配置QX、Surge、Loon后, 并使用此脚本获取"账号1"Cookie成功后, 请勿点击退出账号(可能会导致Cookie失效), 需清除浏览器资料或更换浏览器登录"账号2"获取即可.

注: 获取"账号1"或"账号2"的Cookie后, 后续仅可更新该"账号1"或"账号2"的Cookie.
如需写入其他账号,您可开启脚本内"DeleteCookie"选项以清除Cookie
*************************
【Surge 4.2+ 脚本配置】:
*************************

[Script]
京东多合一签到 = type=cron,cronexp=5 0 * * *,wake-system=1,timeout=20,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js

获取京东Cookie = type=http-request,pattern=https:\/\/api\.m\.jd\.com\/client\.action.*functionId=signBean,script-path=https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js

[MITM]
hostname = api.m.jd.com

*************************
【Loon 2.1+ 脚本配置】:
*************************

[Script]
cron "5 0 * * *" tag=京东多合一签到, script-path=https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js

http-request https:\/\/api\.m\.jd\.com\/client\.action.*functionId=signBean tag=获取京东Cookie, script-path=https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js

[MITM]
hostname = api.m.jd.com

*************************
【 QX 1.0.10+ 脚本配置 】 :
*************************

[task_local]
# 京东多合一签到
# 注意此为远程路径, 低版本用户请自行调整为本地路径.
5 0 * * * https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js, tag=京东多合一签到, img-url=https://raw.githubusercontent.com/Orz-3/task/master/jd.png,enabled=true

[rewrite_local]
# 获取京东Cookie. 
# 注意此为远程路径, 低版本用户请自行调整为本地路径.
https:\/\/api\.m\.jd\.com\/client\.action.*functionId=signBean url script-request-header https://raw.githubusercontent.com/NobyDa/Script/master/JD-DailyBonus/JD_DailyBonus.js

[mitm]
hostname = api.m.jd.com

*************************/

var LogDetails = false; //是否开启响应日志, true则开启

var stop = 0; //自定义延迟签到,单位毫秒. 默认分批并发无延迟. 延迟作用于每个签到接口, 如填入延迟则切换顺序签到(耗时较长), VPN重启或越狱用户建议填写1, Surge用户请注意在SurgeUI界面调整脚本超时

var DeleteCookie = false; //是否清除Cookie, true则开启.

var boxdis = true; //是否开启自动禁用, false则关闭. 脚本运行崩溃时(如VPN断连), 下次运行时将自动禁用相关崩溃接口(仅部分接口启用), 崩溃时可能会误禁用正常接口. (该选项仅适用于QX,Surge,Loon)

var ReDis = false; //是否移除所有禁用列表, true则开启. 适用于触发自动禁用后, 需要再次启用接口的情况. (该选项仅适用于QX,Surge,Loon)

var out = 0; //接口超时退出, 用于可能发生的网络不稳定, 0则关闭. 如QX日志出现大量"JS Context timeout"后脚本中断时, 建议填写6000

var keyName = "jdapp_cookie";

var CookieValue = "";

var jd_type = 1; // 1-先去获取jd init 2-开始抢购

var readyType = 2;

var $nobyda = nobyda();

console.log(6666)
function getString(str, name) {
  var prefix = name + "="
  var start = str.lastIndexOf(prefix)

  if (start == -1) {
      return null;
  }

  var end = str.indexOf("&", start + prefix.length)
  if (end == -1) {
      end = str.length;
  }

  var value = str.substring(start + prefix.length, end)
  return unescape(value);
}

function getCookie(cookie, name) {
  var prefix = name + "="
  var start = cookie.lastIndexOf(prefix)

  if (start == -1) {
      return null;
  }

  var end = cookie.indexOf(";", start + prefix.length)
  if (end == -1) {
      end = cookie.length;
  }

  var value = cookie.substring(start + prefix.length, end)
  return unescape(value);
}

async function all() {
  console.log(this)
  
  let initCookie = await ProcessMid(); // 抢购init

  console.log(999)
  $nobyda.printLog("ProcessMid", "执行结果：" + JSON.stringify(initCookie));
  let cookiestr = "";
  if (initCookie) {
    Object.keys(initCookie).forEach((item) => {
      if (item !== "seckill100012043978") {
        cookiestr += item + "=" + initCookie[item] + ";";
      }
    });
  }
  $nobyda.printLog("all", "initCookie:  " + cookiestr);
  let specialsec = initCookie["seckill100012043978"] ? 'seckill100012043978='+initCookie["seckill100012043978"] + ";" : "";
    
  console.log("----------"+specialsec)
  let seckill100012043978 = await BeginSeckill(stop, cookiestr + specialsec);
  $nobyda.printLog("all", "seckill100012043978:  " + seckill100012043978);
  specialsec = seckill100012043978 ? 'seckill100012043978='+seckill100012043978 + ';' : "";
  initCookie.seckill100012043978 = seckill100012043978;
  await BuyMaotai(stop, cookiestr + specialsec);

  $nobyda.done();
}

async function ProcessMid() {
  const status = $response.status;
  const headers = $response.headers;
  $nobyda.printLog("ProcessMid", "开始执行");
  let cookies = headers["Set-Cookie"]
  let location = headers["Location"]

  let pt_pin = "jd_77556e72875a1";
  let pwdt_id = "jd_77556e72875a1";
  let seckillSku = "100012043978";
  let seckillSid = "";
  let pt_key = getCookie(cookies, "pt_key");
  let seckill100012043978 = getCookie(cookies, "seckill100012043978");
  
  let sid = getCookie(cookies, "sid");
  let mid = getString(location, "mid");
  $nobyda.printLog("ProcessMid", "执行结束");

  const requestHeaders = $request.headers;
  let requestCookies = headers["Cookie"];
  let unpl = getCookie(requestCookies, "requestCookies");
  let visitkey = getCookie(requestCookies, "visitkey");
  let result = {pt_pin, pwdt_id, seckillSku, seckillSid, pt_key, seckill100012043978, sid, mid, visitkey}

  if (readyType === 1) {
    result = {...result, unpl};
  }
  $nobyda.printLog("ProcessMid---request cookie", "执行结束:" + result);
  return result;
}

function BeginCaptcha(s, initCookie) {
  return new Promise(resolve => {
    // if (disable("JDBean")) return resolve()
    setTimeout(() => {
      let now = Date.now() + "";
      now = now.substring(0, now.length - 3);
      const JDBUrl = {
        url: 'https://marathon.jd.com/m/captcha.html?sid=' + initCookie.sid + '&lat=0.000000&mid=' + initCookie.mid + '&un_area=12_988_40034_51587&skuId=100012043978&lng=0.000000',
        headers: {
          Cookie: initCookie + CookieValue
        },
        // body: "sku=100012043978&num=1&isModifyAddress=false"
      };
      $nobyda.get(JDBUrl, function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            
            $nobyda.printLog("接口请求：", JDBUrl.url, JSON.stringify(response) + "\n" + data)
            const headers = response.headers;
            let cookies = headers["Set-Cookie"]
            let seckill100012043978 = getCookie(cookies, "seckill100012043978");
            resolve(seckill100012043978);
          }
        } catch (eor) {
          $nobyda.AnError("京东商城-京豆", "JDBean", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

function BeginSeckill(s, initCookie) {
  return new Promise(resolve => {
    // if (disable("JDBean")) return resolve()
    setTimeout(() => {
      let now = Date.now() + "";
      now = now.substring(0, now.length - 3);
      const JDBUrl = {
        url: 'https://marathon.jd.com/seckill.action?skuId=100012043978&num=1&rid=' + now,
        headers: {
          Cookie: initCookie + CookieValue
        },
        // body: "sku=100012043978&num=1&isModifyAddress=false"
      };
      $nobyda.get(JDBUrl, function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            
            $nobyda.printLog("接口请求：", JDBUrl.url, JSON.stringify(response) + "\n" + data)
            const headers = response.headers;
            let cookies = headers["Set-Cookie"]
            let seckill100012043978 = getCookie(cookies, "seckill100012043978");
            resolve(seckill100012043978);
          }
        } catch (eor) {
          $nobyda.AnError("京东商城-京豆", "JDBean", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

function BuyMaotai(s, initCookie) {
  return new Promise(resolve => {
    // if (disable("JDBean")) return resolve()
    setTimeout(() => {
      let initParam = JSON.parse($nobyda.read("maotai"))
      const {invoiceInfo, addressList, token} = initParam;
      let address = addressList[0];
      const param = {
        num: initParam.buyNum,
        addressId: 66260024,
        yuShou: true,
        isModifyAddress: false,
        name: address.name,
        provinceId: address.provinceId,
        provinceName: address.provinceName,
        cityId: address.cityId,
        cityName: address.cityName,
        countyId: address.countyId,
        countyName: address.countyName,
        townId: address.townId,
        townName: address.townName,
        addressDetail: address.addressDetail,
        mobile: address.mobile,
        mobileKey: address.mobileKey,
        email: address.email,
        invoiceTitle: invoiceInfo.invoiceTitle,
        invoiceCompanyName: invoiceInfo.invoiceCompany,
        invoiceContent: invoiceInfo.invoiceContentType,
        invoiceTaxpayerNO: "",
        invoiceEmail: invoiceInfo.invoiceEmail,
        invoicePhone: invoiceInfo.invoicePhone,
        invoicePhoneKey: invoiceInfo.invoicePhoneKey,
        invoice: true,
        password: "",
        codTimeType: 3,
        paymentType: 4,
        overseas: 0,
        phone: "",
        areaCode: "",
        token: token
      }
      $nobyda.printLog("初始化茅台参数", "参数构成：" + JSON.stringify(param));
      let postParam = $nobyda.urlEncode(param);
      $nobyda.printLog("编码茅台参数", "参数构成：" + postParam);
      const JDBUrl = {
        url: 'https://marathon.jd.com/seckillnew/orderService/submitOrder.action?skuId=100012043978',
        headers: {
          Cookie: initCookie + CookieValue
        },
        body: postParam
      };
      $nobyda.post(JDBUrl, function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            $nobyda.printLog("接口请求：", JSON.stringify(response) + "\n" + data)
          }
        } catch (eor) {
          $nobyda.AnError("京东商城-京豆", "JDBean", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

// function GetBuyInfo(s) {
//   return new Promise(resolve => {
//     // if (disable("JDBean")) return resolve()
//     setTimeout(() => {
//       // CookieValue = 'seckill100012043978=VPKAPRiuHkUHvQePZw1iuR4i5JX5BoktNjPIXi3aafLUehkC9fMXG/Jyqp2Zs+NNlzdq0d9KzeDMas5TiRt0aSASsLXppFooF/sJOog6Gcr5sLpng1BK2DlvOGXFpl59rUUnkAN/a4FkHRmkXOpl04JNcJJQJU3gAvhUOxtCp+OkwgsnAVddJ6d+LYkeuR/GJSfoqT2AyBv3IRWE; seckillSid=; seckillSku=100012043978; __jda=121091540.1572673737380308490731.1572673737.1606145242.1606183031.675; __jdb=121091540.11.1572673737380308490731|675.1606183031; __jdc=121091540; __jdv=121091540%7Ckong%7Ct_1000170136%7Ctuiguang%7Cnotset%7C1606103281090; mba_muid=1572673737380308490731.1487.1606183374761; mba_sid=1487.33; pre_seq=30; pre_session=a2b44ddbc7c853384ce56efa9b755742ae1e6334|5111; unpl=V2_ZzNtbUJVEBJwABVRf0kLVWIHQllKXkYVcFoSASscDwBmBxoNclRCFnQURlRnGVoUZgsZWUtcQhxFOEZVehteAGUEGl1yZ3MWdThHZHseXQFjBRteS1FGHHULRlF9HFUHYDMiXUpTcxB3Dk5SfhtsNWICE1xAUEoUfQt2VUsbXQRkChZfQldFJTdmHQEVHggDNAESWBBXFBJxXwtUfBhYAWEKEVREUkoVdghDUn4QXgJXAiJe%7CV2_ZzNtbUoCFkUmAEAEfkkPAWJRQgkRUUAVcg9OVChJDFBkAkVVclRCFnQURlVnGl0UZgsZWEFcQB1FCEJkexhdBWQLEVhKXnMSdwFCVHkpXAQJbRZeLDYASyBMFBEuTRlVP14iXkJnQiUlCxVRfkwJVjUFQFRGVUEccFoSUHxNC1VvUBRZRlFGFiVcRgB8G14AVzMbXHJXQhR0CENTfx1cB2IzxuHkgOqooYn4jdGjiJfl1LXrlurkwPiZks%252fYKV01ZjMTbRQ5QxR0CURXfBxYACpTEQ5HUhZAJlpABnIdXgduBkAJRlAXQiUAFVJ%252fHVoAZFNGXRZQQRdwOEdkew%253d%253d; pt_key=app_openAAJfuy1EADBb-fY_GHMN9ZcXnQMhxUQnUvXi-2DzT-NMzPNX26AGIHtYtDK-kiV5v_2MLf_lCnA; pt_pin=jd_77556e72875a1; pwdt_id=jd_77556e72875a1; sid=1ec0d3c5778213378bfd820425a1cddw; mid=xSlUeHzVh49EO7paAzZPT9ZGDhxYOdySv93KQkpnU1k; __jd_ref_cls=Mnpm_ComponentApplied; 3AB9D23F7A4B3C9B=NFTGFEE7ZDCJPSVUM7L4JP2L7CZYSEGKBUOLZFRLRKZK6KBTPXUSBT2VS4LU7Y2WCSYXKQQM6MJ7F45AVLTIFQ3UUI; BATQW722QTLYVCRD={"tk":"jdd01R2AFBSV3OA5WD57RKXBFWPB7OUXPAERTEFKS7YRPOGQEKIMCX46LFTZ7KKTYIZZHEXGFGCELYRTWIHR6CKGZ5NXB2ZM2OMQV6SEP35Q01234567","t":1606105972949}; shshshfp=2fb72d1026066853741521ea051faf27; shshshfpa=1e606e515e176466abd69acd2b144f76e2d7830630acc4bf75af1be4cf; shshshfpb=1e606e515e176466abd69acd2b144f76e2d7830630acc4bf75af1be4cf; __wga=1605026342366.1605025514159.1604991239188.1587609492189.4.44; cid=8; retina=1; __jdu=1572673737380308490731; wq_uits=; cartLastOpTime=1592284581; webp=0; visitkey=46357509995397652'
//       const JDBUrl = {
//         url: 'https://marathon.jd.com/seckillnew/orderService/init.action',
//         headers: {
//           Cookie: CookieValue
//         },
//         body: "sku=100012043978&num=1&isModifyAddress=false"
//       };
//       $nobyda.post(JDBUrl, function(error, response, data) {
//         try {
//           if (error) {
//             throw new Error(error)
//           } else {
//             $nobyda.printLog("接口请求：", JDBUrl.url, JSON.stringify(response) + "\n" + data)
//             $nobyda.write(data, "maotai")
//             resolve(data);
//           }
//         } catch (eor) {
//           $nobyda.AnError("京东商城-京豆", "JDBean", eor, response, data)
//         } finally {
//           resolve()
//         }
//       })
//     }, s)
//     if (out) setTimeout(resolve, out + s)
//   });
// }

function BuyProduct() {
  CookieValue = $nobyda.read(keyName)
  if (CookieValue) {
    if (jd_type === 1) {
      GetBuyInfo(0);
    } else {
      BuyMaotai(0);
    }
    
  } else {
    console.log("JDAPPcookie不存在请先获取cookie")
    $nobyda.notify("JDAPPcookie不存在请先获取cookie !", "", '')
  }
}

function GetBuyInfo(s) {
  return new Promise(resolve => {
    // if (disable("JDBean")) return resolve()
    setTimeout(() => {
      // CookieValue = 'seckill100012043978=VPKAPRiuHkUHvQePZw1iuR4i5JX5BoktNjPIXi3aafLUehkC9fMXG/Jyqp2Zs+NNlzdq0d9KzeDMas5TiRt0aSASsLXppFooF/sJOog6Gcr5sLpng1BK2DlvOGXFpl59rUUnkAN/a4FkHRmkXOpl04JNcJJQJU3gAvhUOxtCp+OkwgsnAVddJ6d+LYkeuR/GJSfoqT2AyBv3IRWE; seckillSid=; seckillSku=100012043978; __jda=121091540.1572673737380308490731.1572673737.1606145242.1606183031.675; __jdb=121091540.11.1572673737380308490731|675.1606183031; __jdc=121091540; __jdv=121091540%7Ckong%7Ct_1000170136%7Ctuiguang%7Cnotset%7C1606103281090; mba_muid=1572673737380308490731.1487.1606183374761; mba_sid=1487.33; pre_seq=30; pre_session=a2b44ddbc7c853384ce56efa9b755742ae1e6334|5111; unpl=V2_ZzNtbUJVEBJwABVRf0kLVWIHQllKXkYVcFoSASscDwBmBxoNclRCFnQURlRnGVoUZgsZWUtcQhxFOEZVehteAGUEGl1yZ3MWdThHZHseXQFjBRteS1FGHHULRlF9HFUHYDMiXUpTcxB3Dk5SfhtsNWICE1xAUEoUfQt2VUsbXQRkChZfQldFJTdmHQEVHggDNAESWBBXFBJxXwtUfBhYAWEKEVREUkoVdghDUn4QXgJXAiJe%7CV2_ZzNtbUoCFkUmAEAEfkkPAWJRQgkRUUAVcg9OVChJDFBkAkVVclRCFnQURlVnGl0UZgsZWEFcQB1FCEJkexhdBWQLEVhKXnMSdwFCVHkpXAQJbRZeLDYASyBMFBEuTRlVP14iXkJnQiUlCxVRfkwJVjUFQFRGVUEccFoSUHxNC1VvUBRZRlFGFiVcRgB8G14AVzMbXHJXQhR0CENTfx1cB2IzxuHkgOqooYn4jdGjiJfl1LXrlurkwPiZks%252fYKV01ZjMTbRQ5QxR0CURXfBxYACpTEQ5HUhZAJlpABnIdXgduBkAJRlAXQiUAFVJ%252fHVoAZFNGXRZQQRdwOEdkew%253d%253d; pt_key=app_openAAJfuy1EADBb-fY_GHMN9ZcXnQMhxUQnUvXi-2DzT-NMzPNX26AGIHtYtDK-kiV5v_2MLf_lCnA; pt_pin=jd_77556e72875a1; pwdt_id=jd_77556e72875a1; sid=1ec0d3c5778213378bfd820425a1cddw; mid=xSlUeHzVh49EO7paAzZPT9ZGDhxYOdySv93KQkpnU1k; __jd_ref_cls=Mnpm_ComponentApplied; 3AB9D23F7A4B3C9B=NFTGFEE7ZDCJPSVUM7L4JP2L7CZYSEGKBUOLZFRLRKZK6KBTPXUSBT2VS4LU7Y2WCSYXKQQM6MJ7F45AVLTIFQ3UUI; BATQW722QTLYVCRD={"tk":"jdd01R2AFBSV3OA5WD57RKXBFWPB7OUXPAERTEFKS7YRPOGQEKIMCX46LFTZ7KKTYIZZHEXGFGCELYRTWIHR6CKGZ5NXB2ZM2OMQV6SEP35Q01234567","t":1606105972949}; shshshfp=2fb72d1026066853741521ea051faf27; shshshfpa=1e606e515e176466abd69acd2b144f76e2d7830630acc4bf75af1be4cf; shshshfpb=1e606e515e176466abd69acd2b144f76e2d7830630acc4bf75af1be4cf; __wga=1605026342366.1605025514159.1604991239188.1587609492189.4.44; cid=8; retina=1; __jdu=1572673737380308490731; wq_uits=; cartLastOpTime=1592284581; webp=0; visitkey=46357509995397652'
      const JDBUrl = {
        url: 'https://marathon.jd.com/seckillnew/orderService/init.action',
        headers: {
          Cookie: CookieValue
        },
        body: "sku=100012043978&num=1&isModifyAddress=false"
      };
      $nobyda.post(JDBUrl, function(error, response, data) {
        try {
          if (error) {
            throw new Error(error)
          } else {
            $nobyda.printLog("接口请求：", JDBUrl.url, JSON.stringify(response) + "\n" + data)
            $nobyda.write(data, "maotai")
            resolve(data);
          }
        } catch (eor) {
          $nobyda.AnError("京东商城-京豆", "JDBean", eor, response, data)
        } finally {
          resolve()
        }
      })
    }, s)
    if (out) setTimeout(resolve, out + s)
  });
}

function ReadCookie() {
  DualAccount = true;
  const EnvInfo = $nobyda.isJSBox ? "JD_Cookie" : "CookieJD"
  const EnvInfo2 = $nobyda.isJSBox ? "JD_Cookie2" : "CookieJD2"
  if (DeleteCookie) {
    // if ($nobyda.read(EnvInfo) || $nobyda.read(EnvInfo2)) {
    //   $nobyda.write("", EnvInfo)
      
    //   $nobyda.notify("京东Cookie清除成功 !", "", '请手动关闭脚本内"DeleteCookie"选项')
    //   $nobyda.done()
    //   return
    // }
    $nobyda.write("", "jdapp_cookie")
    $nobyda.notify("脚本终止", "", '请手动关闭脚本内"DeleteCookie"选项')
    $nobyda.done()
    return
  } else if ($nobyda.isRequest) {
    GetCookie()
    return
  }
}
function GetCookie() {
  try {
    if ($request.headers && $request.url.match(/mars\.jd\.com.*/)) {
      var CookieValue = $request.headers['Cookie']
      $nobyda.write(CookieValue, "jdapp_cookie");
      $nobyda.notify("appcookie写入", "", "可以查看log");
      console.log("appcookie写入", "jdapp_cookie", CookieValue);
    } else if ($request.url === 'http://www.apple.com/') {
      $nobyda.notify("appcookie写入", "", "类型错误, 手动运行请选择上下文环境为Cron ");
    } else {
      $nobyda.notify("appcookie写入", "写入Cookie失败", "请检查匹配URL或配置内脚本类型 ");
    }
  } catch (eor) {
    // $nobyda.write("", "CookieJD")
    // $nobyda.write("", "CookieJD2")
    // $nobyda.notify("写入京东Cookie失败", "", '已尝试清空历史Cookie, 请重试 ')
    console.log(`\n写入京东Cookie出现错误 \n${JSON.stringify(eor)}\n\n${eor}\n\n${JSON.stringify($request.headers)}\n`)
  } finally {
    $nobyda.done()
  }
}

// Modified from yichahucha
function nobyda() {
  const start = Date.now()
  const isRequest = typeof $request != "undefined"
  const isSurge = typeof $httpClient != "undefined"
  const isQuanX = typeof $task != "undefined"
  const isLoon = typeof $loon != "undefined"
  const isJSBox = typeof $app != "undefined" && typeof $http != "undefined"
  const isNode = typeof require == "function" && !isJSBox;
  const NodeSet = 'CookieSet.json'
  const node = (() => {
    if (isNode) {
      const request = require('request');
      const fs = require("fs");
      return ({
        request,
        fs
      })
    } else {
      return (null)
    }
  })()
  const urlEncode = (param, key, encode) => {
    if (param == null) return '';
    var paramStr = '';
    var t = typeof (param);
    if (t == 'string' || t == 'number' || t == 'boolean') {
      paramStr += '&' + key + '=' + ((encode == null || encode) ? encodeURIComponent(param) : param);
    } else {
      for (var i in param) {
        var k = key == null ? i : key + (param instanceof Array ? '[' + i + ']' : '.' + i);
        paramStr += urlEncode(param[i], k, encode);
      }
    }
    return paramStr;
  };
  const notify = (title, subtitle, message) => {
    if (isQuanX) $notify(title, subtitle, message)
    if (isSurge) $notification.post(title, subtitle, message)
    if (isNode) console.log(`${title}\n${subtitle}\n${message}`)
    if (isJSBox) $push.schedule({
      title: title,
      body: subtitle ? subtitle + "\n" + message : message
    })
  }
  const write = (value, key) => {
    if (isQuanX) return $prefs.setValueForKey(value, key)
    if (isSurge) return $persistentStore.write(value, key)
    if (isNode) {
      try {
        if (!node.fs.existsSync(NodeSet)) node.fs.writeFileSync(NodeSet, JSON.stringify({}));
        const dataValue = JSON.parse(node.fs.readFileSync(NodeSet));
        if (value) dataValue[key] = value;
        if (!value) delete dataValue[key];
        return node.fs.writeFileSync(NodeSet, JSON.stringify(dataValue));
      } catch (er) {
        return AnError('Node.js持久化写入', null, er);
      }
    }
    if (isJSBox) {
      if (!value) return $file.delete(`shared://${key}.txt`);
      return $file.write({
        data: $data({
          string: value
        }),
        path: `shared://${key}.txt`
      })
    }
  }
  const read = (key) => {
    if (isQuanX) return $prefs.valueForKey(key)
    if (isSurge) return $persistentStore.read(key)
    if (isNode) {
      try {
        if (!node.fs.existsSync(NodeSet)) return null;
        const dataValue = JSON.parse(node.fs.readFileSync(NodeSet))
        return dataValue[key]
      } catch (er) {
        return AnError('Node.js持久化读取', null, er)
      }
    }
    if (isJSBox) {
      if (!$file.exists(`shared://${key}.txt`)) return null;
      return $file.read(`shared://${key}.txt`).string
    }
  }
  const adapterStatus = (response) => {
    if (response) {
      if (response.status) {
        response["statusCode"] = response.status
      } else if (response.statusCode) {
        response["status"] = response.statusCode
      }
    }
    return response
  }
  const get = (options, callback) => {
    options.headers['User-Agent'] = 'JD4iPhone/167169 (iPhone; iOS 13.4.1; Scale/3.00)'
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "GET"
      //options["opts"] = {
      //  "hints": false
      //}
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) {
      options.headers['X-Surge-Skip-Scripting'] = false
      $httpClient.get(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isNode) {
      node.request(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isJSBox) {
      if (typeof options == "string") options = {
        url: options
      }
      options["header"] = options["headers"]
      options["handler"] = function(resp) {
        let error = resp.error;
        if (error) error = JSON.stringify(resp.error)
        let body = resp.data;
        if (typeof body == "object") body = JSON.stringify(resp.data);
        callback(error, adapterStatus(resp.response), body)
      };
      $http.get(options);
    }
  }
  const post = (options, callback) => {
    // 
    // options.headers['User-Agent'] = 'JD4iPhone/167169 (iPhone; iOS 13.4.1; Scale/3.00)'
    options.headers['User-Agent'] = 'jdapp;iPhone;9.1.9;13.6.1;a2b44ddbc7c853384ce56efa9b755742ae1e6334;network/4g;ADID/28BA77ED-A4E9-4EE9-A917-6CD77E3FAF89;JDEbook/openapp.jdreader;supportApplePay/1;hasUPPay/0;pushNoticeIsOpen/0;model/iPhone12,1;addressid/209587005;hasOCPay/0;appBuild/167398;supportBestPay/0;jdSupportDarkMode/0;pv/1487.32;apprpd/Productdetail_MainPage;ref/WareInfoViewController;psq/30;ads/;psn/a2b44ddbc7c853384ce56efa9b755742ae1e6334|5111;jdv/0|kong|t_1000170136|tuiguang|notset|1606103281090|1606183030;adk/;app_device/IOS;pap/JA2015_311210|9.1.9|IOS 13.6.1;Mozilla/5.0 (iPhone; CPU iPhone OS 13_6_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1'
    if (options.body) options.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    if (isQuanX) {
      if (typeof options == "string") options = {
        url: options
      }
      options["method"] = "POST"
      //options["opts"] = {
      //  "hints": false
      //}
      $task.fetch(options).then(response => {
        callback(null, adapterStatus(response), response.body)
      }, reason => callback(reason.error, null, null))
    }
    if (isSurge) {
      // options.headers['X-Surge-Skip-Scripting'] = false
      // log("post-options", JSON.stringify(options));
      $httpClient.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isNode) {
      node.request.post(options, (error, response, body) => {
        callback(error, adapterStatus(response), body)
      })
    }
    if (isJSBox) {
      if (typeof options == "string") options = {
        url: options
      }
      options["header"] = options["headers"]
      options["handler"] = function(resp) {
        let error = resp.error;
        if (error) error = JSON.stringify(resp.error)
        let body = resp.data;
        if (typeof body == "object") body = JSON.stringify(resp.data)
        callback(error, adapterStatus(resp.response), body)
      }
      $http.post(options);
    }
  }
  const printLog = (name, text, sptext) => {
    console.log("日志打印：");
    console.log(name + text + "\n");
    console.log(sptext)
  }
  const AnError = (name, keyname, er, resp, body) => {
    if (typeof(merge) != "undefined" && keyname) {
      if (!merge[keyname].notify) {
        merge[keyname].notify = `${name}: 异常, 已输出日志 ‼️`
      } else {
        merge[keyname].notify += `\n${name}: 异常, 已输出日志 ‼️ (2)`
      }
      merge[keyname].error = 1
    }
    return console.log(`\n‼️${name}发生错误\n‼️名称: ${er.name}\n‼️描述: ${er.message}${JSON.stringify(er).match(/\"line\"/)?`\n‼️行列: ${JSON.stringify(er)}`:``}${resp&&resp.status?`\n‼️状态: ${resp.status}`:``}${body?`\n‼️响应: ${body}`:``}`)
  }
  const time = () => {
    const end = ((Date.now() - start) / 1000).toFixed(2)
    return console.log('\n签到用时: ' + end + ' 秒')
  }
  const done = (value = {}) => {
    if (isQuanX) return $done(value)
    if (isSurge) isRequest ? $done(value) : $done()
  }
  return {
    AnError,
    isRequest,
    isJSBox,
    isSurge,
    isQuanX,
    isLoon,
    isNode,
    notify,
    write,
    read,
    get,
    post,
    time,
    done,
    printLog,
    urlEncode
  }
};

all();