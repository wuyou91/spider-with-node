## 用node.js爬取网易严选的商品信息

### 两种方法
1. 通过google的headless工具puppeteer模拟浏览器，再用cheerio提取dom信息，以获取数据
2. 通过分析网站的数据接口，用request模块请求接口数据。

~~~
node puppeteer.js // 启动第一种方法，数据存在/data文件夹下
node index.js //启动第二种方法，数据存在/data2文件夹下
~~~
