// 加载jsoup.jar
runtime.loadJar("./jsoup-1.12.1.jar");
// 使用jsoup解析html
importClass(org.jsoup.Jsoup);
importClass(org.jsoup.nodes.Document);
//importClass(org.jsoup.nodes.Element);
importClass(org.jsoup.select.Elements);

importClass(android.database.sqlite.SQLiteDatabase);
/**
 * 插入tikuNet表
 * @param  {} liArray li列表，包含题目和答案
 */
function CreateAndInsert(liArray){
    
    let dbName = "tiku.db";
    //文件路径
    let path = files.path(dbName);
    //确保文件存在
    if (!files.exists(path)) {
        files.createWithDirs(path);
    }
    //创建或打开数据库
    let db = SQLiteDatabase.openOrCreateDatabase(path, null);
    let createTable = "\
    CREATE TABLE IF NOt EXISTS tikuNet(\
    question CHAR(253),\
    answer CHAR(100)\
    );";
    let cleanTable = "DELETE FROM tikuNet";
    db.execSQL(createTable);
    db.execSQL(cleanTable);
    log("创建打开清空表tikuNet!");

    let sql = "INSERT INTO tikuNet (question, answer) VALUES (?, ?)";
    db.beginTransaction();
    let stmt = db.compileStatement(sql);
    for (let li = 0, len = liArray.size(); li < len; li++) {
        //log("题目："+li.text());
        let liText = liArray.get(li).text();
        let timuPos=liText.indexOf("】")+1;
        let tiMu=liText.substring(timuPos).replace(/_/g, "");
        let daAn = liArray.get(li).select("b").first().text();
        log(util.format("题目:%s\n答案:%s"),tiMu,daAn);
        stmt.bindString(1, tiMu);
        stmt.bindString(2, daAn);
        stmt.executeInsert();
        stmt.clearBindings();
    }
    db.setTransactionSuccessful();
    db.endTransaction();
    db.close();  
    return true;  
}


/**
 */
function updateTikunet() {
    log("开始更新数据库...");
    let htmlString = Jsoup.connect("http://49.235.90.76:5000").maxBodySize(0).timeout(10000).get();
    let htmlArray = Jsoup.parse(htmlString);
    let liArray = htmlArray.select("li:has(b)");
    log(util.format("题库数目%s\n"), liArray.size());    
    //执行更新
    if(CreateAndInsert(liArray))
    {
        return liArray.size();
    }else{
        return -1;
    }
}
//updateTikunet();
module.exports = updateTikunet;

