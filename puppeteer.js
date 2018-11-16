const fs = require('fs')
const cheerio = require('cheerio')
const puppeteer = require('puppeteer');

const pageDetailInfo = {
  from:'http://you.163.com/item/list?categoryId=1043000&subCategoryId=1022000',
  name: 'pageDetaiInfo',
  data:[]
}
const homeData = {
  name: 'homePageData',
  data:[]
}
// 打开目标页面
async function run (url) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage();

  await page.goto(url);
  await console.log('已经打开'+url)
  const html = await page.$eval('body', e => e.innerHTML)
  await browser.close()
  await console.log('关闭'+url+'成功')
  await getPageUrlLis(html)
  await console.log('数据获取完成,开始写入。。。')
  fs.writeFileSync('./data/pageDetail.json', JSON.stringify(pageDetailInfo))
  fs.writeFileSync('./data/homeData.json', JSON.stringify(homeData))
  await console.log('数据写入完成!!!')
};
// 获取目标页面下的所有详情页的跳转链接
async function getPageUrlLis (html){
  const $ = await cheerio.load(html)
  let urlList = []
  await $('#1022000 .m-itemList li .hd a').each(function () {
    urlList.push(`http://you.163.com${$(this).attr('href')}`)
  })
  let list={
    data: urlList
  }
  fs.writeFileSync('./data/list.json', JSON.stringify(list))

  // urlList.length=10 // 可控制数目，注释掉则抓取全部
  await console.log('成功获取所有详情页地址')
  await goSubPage(urlList,1)
};
// 递归逐一跳转所有详情页面
async function goSubPage(list,n) {
  if(await n<=list.length){
    const browser = await puppeteer.launch()
    const page = await browser.newPage();
    await page.goto(list[n-1])
    await console.log('进入到第'+n+'个详情页面')
    const html = await page.$eval('html', e => e.innerHTML)
    await writeData(html, list[n-1]) // 把地址传过去，用于获取商品ID
    await browser.close()
    await console.log('关闭第'+n+'个详情页面')
    await goSubPage(list,n+1)
  }
};
// 获取数据
function writeData(html, url) {
  const $ = cheerio.load(html)
  let server = [] // 用来装服务列表
  $('.policyBox .sItem').each(function () {
    server.push($(this).find('span').eq(1).text())
  })

  let mainImg = [] // 用来装橱窗主图
  $('.m-slide .list li').each(function () {
    let arr = $(this).find('img').attr('src').split('?')
    mainImg.push(arr[0])
  })
  let pages = [] // 用来装详情图片
  $('.m-detailHtml').find('p').each(function () {
    pages.push($(this).children('img').attr('data-original'))
  })
  pages.length-- // 去掉最后一个换行<br>

  let prodId = (((url.split('?'))[1].split('&'))[0].split('='))[1] // 对URL切割获取商品ID

  // 组装详情页数据
  let pageDetail = {
    id: prodId,
    name: $('.intro .name').children().first().text(),
    desc: $('.intro .desc').text(),
    price: $('.price span.rp span.num').text(),
    server:server,
    mainImg: mainImg,
    info: pages
  }
  // 组装首页商品简略数据
  let honme = {
    id: prodId,
    name: $('.intro .name').children().first().text(),
    desc: $('.intro .desc').text(),
    price: $('.price span.rp span.num').text(),
    img: mainImg[0]
  }
  pageDetailInfo.data.push(pageDetail)
  homeData.data.push(honme)
};

run(pageDetailInfo.from)

