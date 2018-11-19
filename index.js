const request = require('request')
const cheerio = require('cheerio')
const fs = require('fs')

const mainURL = 'http://you.163.com/item/list?categoryId=1043000&subCategoryId=1022000'

async function start(url) {
  let scriptStr = await getScriptStr(url)
  eval(scriptStr.match(/var\sjson_Data[\s|\S]*\"frontName\"\:\"\"\}\]\}\;/).join())
  let prodList = json_Data.categoryItemList[3].itemList
  let urlList = await geturlList(prodList)
  
  fs.writeFileSync('./data2/product-info-list.json', JSON.stringify(urlList.prodInfoList))
  console.log('首页商品列表写入成功，请打开此路径查看./data2/product-info-list.json')  

  // 处理详情页信息
  console.log('开始遍历详情页。。。')
  let detailInfoList = await getDetailInfoList(urlList.prodIdList)

  // 将所有详情信息全部写入文件
  fs.writeFileSync('./data2/product-detail-info-list.json', JSON.stringify(detailInfoList))
  console.log('所有商品详情信息已经写入，请查看以下下路径./data2/product-detail-info-list.json')
}


// 获取首页信息和商品跳转链接
function geturlList (prodList) {
  return new Promise(function(resolve){
    let data = {
      prodIdList : [],
      prodInfoList: []
    }
    prodList.forEach((x) => {
      data.prodIdList.push(x.id)
      let prodItem = {
        id: x.id,
        name: x.name,
        jpgPicUrl: x.primaryPicUrl,
        pngPicUrl: x.listPicUrl,
        desc: x.simpleDesc,
        counterPrice: x.counterPrice,
        retailPrice: x.retailPrice
      }
      data.prodInfoList.push(prodItem)
    });
    resolve(data)
  })
}

// 传入地址，获取页面所有script标签内容，并拼接成字符串，待后续通过正则筛选
function getScriptStr(url){
  return new Promise((resolve) => {
    request.get(url, (err, res, body) => {
      const $ = cheerio.load(body)
      let scriptStr
      $('script').each(function(){
        scriptStr += $(this).html()
      })
    resolve(scriptStr)
    })
  })
}


// 解析详情页
function getDetailInfoList (urlList) {
  return new Promise(function(resolve){
    let detailInfoList = {detailList:[]} // 用来装详情页信息
    let n = 0
    urlList.forEach(async (item,index,arr) => {
      let detailUrl = `http://you.163.com/item/detail?id=${item}&_stat_area=mod_4_item_2&_stat_id=1043000&_stat_referer=itemList`
      let detailScriptStr = await getScriptStr(detailUrl)
      // 匹配 “//详情页数据**任意字符**//其他数据” 的内容
      eval(detailScriptStr.match(/\/\/\u8be6\u60c5\u9875\u6570\u636e[\s|\S]*\/\/\u5176\u4ed6\u6570\u636e/).join()) 
      // 用eval()格式化后,便可直接拿到数据变量，将其再赋给data
      let detailInfo = JSON_DATA_FROMFTL 
      // 组装单个详情页数组
      let detailItem = {
        id: detailInfo.item.id,
        name: detailInfo.item.name,
        desc: detailInfo.item.simpleDesc,
        price: detailInfo.item.retailPrice,
        server: detailInfo.policyList,
        mainImg: [
          detailInfo.item.primaryPicUrl,
          detailInfo.item.itemDetail.picUrl1,
          detailInfo.item.itemDetail.picUrl2,
          detailInfo.item.itemDetail.picUrl3,
          detailInfo.item.itemDetail.picUrl4
        ],
        info: detailInfo.item.itemDetail.detailHtml
      }
      detailInfoList.detailList.push(detailItem)
      n++
      console.log(`第${n}个详情页信息获取完毕...`)
      if(n>=urlList.length){
        resolve(detailInfoList)
      }
    })
  })
}

start(mainURL)
