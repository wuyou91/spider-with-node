## 用node.js爬取网易严选的商品信息
因为用vue写一个商城，需要一些模拟数据，开始使用mock.js创建的随机模拟数据。但是觉得太难看了，不够真实。刚好通读了node的文档，于是决定用node爬下网易严选的数据。  
为何不用python?  
作为一个前端，能用JS解决的的绝对不用其他，而且学好node对前端还是有很大好处的。  
接下来会深入学习ES6和node。

### 两种方法
1. 从模拟浏览网页入手
  * 通过google的headless工具puppeteer模拟浏览器，再用cheerio提取dom信息，以获取数据

2. 从目标数据入手，只关注数据
  * 如果数据是通过ajax获取，再用js插入的话，用cheerio是获取不到的（cheerio只能获取静态的html内的内容），此时可以通过分析网站的数据接口，用request(node自带的http/https也行，但没有request简单、方便好用)模块直接请求接口拿到数据。
  * 另一种是在服务端将数据放入了script标签里面定义的js变量中，整个页面返回到浏览器后，再用js将变量中的数据插入网页。这时可用cheerio将写在script标签内的数据获得，再通过正则筛选出我们需要的数据。

~~~
node puppeteer.js // 启动第一种方法，数据存在/data文件夹下
node index.js //启动第二种方法，数据存在/data2文件夹下
~~~

用到的工具
* [cheerio](https://github.com/cheeriojs/cheerio)
* [puppeteer](https://github.com/GoogleChrome/puppeteer)
* [request](https://github.com/request/request)