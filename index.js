var http = require('http');
//file system: 文件系统
var fs = require('fs');
var url = require('url');

var req = require('request');


http.createServer(function (request, response) {
    // 解析url，获取浏览器访问的文件的路径名
    var pathName = url.parse(request.url).pathname;
    if(isStaticRequire(pathName)) {// 静态资源服务器：浏览器要什么文件，我们就给什么文件
        // 读取文件内容
        try {
            var data = fs.readFileSync('./page/' + pathName);
            response.writeHead(200);
            response.write(data);
            response.end();
        } catch (e) {
            response.writeHead(404);
            response.write('<html><body>404 not found</body></html>');
            response.end();
        }
    } else {// 请求数据接口
        // 获取请求的参数
        var params = url.parse(request.url, true).query;
        // 向图灵api发送请求 (看api: https://www.kancloud.cn/turing/www-tuling123-com/718227)
        var data = {
            "reqType":0,
            "perception": {
            "inputText": {
                "text": params.text
                }
            },
            "userInfo": {
                "apiKey": "6f40366170074873b39860afbb1c0711",
                "userId": "123456"
            }
        }
        req({
            url: "http://openapi.tuling123.com/openapi/api/v2",
            method: 'POST',
            headr: {
                "content-type": "application/json"
            },
            body: JSON.stringify(data)
        }, function(error, resp, body) {
            // 拿到请求的结果
            if(!error && resp.statusCode == 200) {// 没有保存，并且请回返回200成功的
                var obj = JSON.parse(body);
                // console.log(obj && obj.results && obj.results.length > 0 && obj.results[0].value)
                if(obj && obj.results && obj.results.length > 0 && obj.results[0].values) {
                    console.log(obj.results[0].values);
                    // 返回给页面
                    response.writeHead(200);
                    response.write(JSON.stringify(obj.results[0].values));
                    response.end();
                }
            }
        })
        response.end();
    }

}).listen(12306);

// 判断请求是不是请求静态资源，还是数据接口
function isStaticRequire(pathName) {
    var staticFileList = ['.html', '.css', '.js', '.jpg', '.ico', 'png', '.sass'];
    for(var i = 0; i < staticFileList.length; i ++) {
        if(pathName.indexOf(staticFileList[i]) == pathName.length - staticFileList[i].length) {
            return true;
        }
        return false;
    }
}

