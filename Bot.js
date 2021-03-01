const puppeteer = require('puppeteer');
const fs = require('fs');

// 投稿URLが起動引数に指定されているか？
if( process.argv.length < 3){
  console.log('URLを起動引数に渡してください。');
  return;
}

// PASSWORDの読み込み
let password = fs.readFileSync("PASSWORD.txt", 'utf-8');

// IDの読み込み
let idfile = fs.readFileSync('ID.txt', 'utf-8')

var idList = idfile.split("\r\n");

(async () => {
  //const browser = await puppeteer.launch();
  //ヘッドフルで起動
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  // コンソールイベントを登録
  page.on('console', msg => {
    for (let i = 0; i < msg._args.length; ++i)
      console.log(`${i}: ${msg._args[i]}`);
  });

  try {
    for(const userid of idList){
      if(userid == ""){
        continue;
      }
      console.log("====================");
      console.log('ID: '+ userid);
      // Fantiaに遷移
      await page.goto('https://fantia.jp/sessions/signin');
  
      await page.waitForTimeout(1000);
  
      // ユーザ名/パスワード入力
      await page.type('input[id="user_email"]', userid);
      await page.type('input[id="user_password"]', password);
  
      await page.waitForTimeout(1000);
  
      //ログイン処理
      await page.click('#new_user > div:nth-child(6) > button');
  
      await page.waitForTimeout(5000);
  
      //投稿へ遷移
      await page.goto(process.argv[2]);
  
      await page.waitForTimeout(5000);
  
      // ブックマークされているか？
      let exitsBookMark = await page.evaluate(() => {
        var elem = document.getElementsByClassName('btn btn-default btn-star clickable btn-sm btn-md starred');
        if( elem.length == 0 ){
          return false;
        }
        else{
          return true;
        }
      });
      // ブックマークされていない場合はブックマークする。
      if(!exitsBookMark){
        var elem = await page.$x('//*[@id="main"]/div[2]/div/div/div[3]/div/div/div/div[1]/div/div[1]/div[1]/div[3]/div[1]/post-like-button/span/a');
        await elem[0].click();
        console.log('ブックマークしました！');
      }
      else{
        console.log('既にブックマーク済みです！');
      }

      await page.waitForTimeout(1000);

      // ログアウト 
      await page.goto('https://fantia.jp/auth/logout');
      console.log("====================");

      await page.waitForTimeout(1000);
    }
  } catch (err) {
    // エラーが起きた際の処理
    console.log('残念、失敗しました！');
  } finally {
    console.log('処理完了！');
    await browser.close();
  }
})();