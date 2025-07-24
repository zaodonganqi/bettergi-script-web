export default {
    menu: {
        map: '地圖追蹤',
        script: 'Javascript 腳本',
        combat: '戰鬥策略',
        tcg: '七聖召喚策略'
    },
    button: {
        ok: '確定',
        cancel: '取消',
        refresh: '重新整理頁面',
        help: '查看幫助',
        all: '全部',
        subscribed: '已訂閱',
        visitOnline: '前往線上倉庫'
    },
    sider: {
        repoTitle: '腳本倉庫',
        mainRepo: '前往BetterGI主倉庫',
        scriptRepo: '前往BetterGI腳本倉庫',
        onlineRepo: '前往線上倉庫',
        lastUpdate: '最後更新時間：'
    },
    script: {
        all: '全部',
        subscribed: '已訂閱',
        onlyLocal: '僅本地頁面可用',
        searchMap: '搜尋資源名稱、作者、tag',
        searchScript: '搜尋腳本名稱、作者、簡介、tag',
        searchCombat: '搜尋戰鬥策略名稱、作者、tag',
        searchTCG: '搜尋七聖召喚策略名稱、作者、tag',
        searchDefault: '輸入關鍵詞查詢',
        author: '作者：',
        noAuthor: '暫無作者資訊',
        unknown: '未知腳本'
    },
    error: {
        repoTitle: '獲取倉庫資訊失敗',
        repoDesc: '請檢查網路或稍後重新整理頁面',
        loading: '倉庫資料加載中，請稍候...'
    },
    comment: {
        title: '評論',
        localModeTitle: '本地模式暫不支援評論功能',
        localModeDesc: '請前往線上倉庫進行評論'
    },
    egg: {
        title: '小彩蛋',
        loading: '彩蛋正在全力加載…',
        error: '全力加載失敗，請重試'
    },
    help: {
        title: '常見問題 Q&A',
        modalTitle: '觀前提示：任何問題請在自己思考後再提出，下方回答語氣較粗，屬正常現象，與BGI作者無關，如有不滿敬請諒解或聯繫此頁面作者發洩',
        author: '作者信箱：anqi4051@gmail.com',
        qa: [
            { q: '為什麼倉庫一直加載失敗？', a: '倉庫使用的是github的地址，國內直接連接可能會時好時壞，屬正常現象，打不開就多試幾次或者過幾分鐘再來試試，也可以使用BGI的本地倉庫頁面。（如果你是魔法師，你知道怎麼做）' },
            { q: '評論功能為什麼不可用？', a: '本地模式下不支援評論，請訪問線上倉庫並登入github帳號後評論，如何使用github請自行解決，這裡不做引導。' },
            { q: '為什麼沒有XX腳本？', a: '全部找過後（四個列表全部找過），沒有這個腳本，那就是沒人寫這個腳本。' },
            { q: '已訂閱功能怎麼用？', a: '“BetterGI → 設定 → BetterGI Http 伺服器設定”（如未找到該設定，請確保BGI已更新至最新版），確保該項已開啟且埠號設定為30648。完成後請關閉此頁面並重啟BGI再次嘗試，仍有問題請聯繫作者解決。' },
            { q: 'README是什麼，為什麼加載失敗了？為什麼沒有顯示？', a: '問README是什麼的，學過小學英語的請讀一遍README😡。加載失敗情況同第一問。沒顯示是因為腳本作者沒有寫README或者README.md這個文件命名錯了。' },
            { q: '一些連結為什麼點不開？加載半天為什麼加載不出來？', a: '同第一問。' },
            { q: '點擊訂閱後為什麼沒反應？', a: '請打開BGI，這時會有導入視窗彈出，選擇導入。如果你使用的是線上倉庫，刷新BGI頁面後沒有你訂閱的腳本，請更新本地倉庫後重試，還有異常請在相關群中提問。' },
            { q: '這個腳本用不了怎麼辦？', a: '請在相關群中提問，具體問題具體分析，提問時確保你的截圖和描述充分。' },
            { q: '我之前的評論怎麼不見了？', a: '一般不會刪評，如果評論消失大概率是你評論的節點路徑改變了，比如水晶礦這個目錄被改名成了晶水礦，那就會導致你看到的是新的評論區。' },
            { q: '這個腳本為什麼不用納西妲？', a: '作者們都需要考慮是不是所有人都有，如果你需要請嘗試自己做一個。' },
            { q: '我想要XX功能怎麼辦？', a: '沒有作者寫那就自己寫一個！' },
            { q: '其它', a: '更多問題請聯繫我，如有價值也會不定期更新該頁面。' },
        ]
    },
    common: {
        comma: '，',
        noDesc: '無'
    },
    detail: {
        author: '作者：',
        noAuthor: '暫無作者資訊',
        subscribe: '訂閱',
        subscribed: '已訂閱',
        subscribeAgain: '再次訂閱',
        subscribeFailed: '訂閱失敗',
        subscribeFailedWithMsg: '訂閱失敗: {msg}',
        subscribeSuccess: '已將 {name} 的訂閱連結複製到剪貼簿',
        copyFailed: '複製 {name} 的訂閱連結失敗',
        loadingReadme: '正在加載readme文件',
        readmeFailed: 'readme文件加載失敗，請重試',
        loadingStrategy: '正在加載策略文件內容',
        strategyFailed: '策略文件加載失敗，請重試',
        empty: '請選擇左側腳本查看詳情',
        desc: '簡介：',
        tabReadme: '簡介',
        tabFiles: '文件列表',
        noFiles: '暫無文件資料',
        modalTitle: '文件詳情',
        name: '名稱',
        tags: '標籤',
        lastUpdated: '最後更新',
        operations: '操作',
        hash: 'hash',
        description: '描述',
        version: '版本',
        path: '路徑',
        details: '詳情',
        showDetails: '詳情'
    },
    scriptList: {
        subscribed: '已訂閱',
        noAuthor: '無作者'
    },
    combatStrategyList: {
        subscribed: '已訂閱',
        noAuthor: '無作者'
    },
    cardStrategyList: {
        subscribed: '已訂閱',
        noAuthor: '無作者'
    },
    mapTreeList: {
        subscribed: '已訂閱',
        subscribe: '訂閱',
        subscribeAgain: '再次訂閱',
        selectValidNode: '請選擇一個有效的節點進行訂閱',
        subscribeFailed: '訂閱失敗',
        subscribeFailedWithMsg: '訂閱失敗: {msg}',
        subscribeSuccess: '已將 {name} 的訂閱連結複製到剪貼簿',
        copyFailed: '複製 {name} 的訂閱連結失敗',
        noDesc: '無'
    },
    readmeViewer: {
        descTitle: '簡介：',
        noDesc: '暫無簡介',
        loadTimeout: '加載超時',
        loadFailed: '加載失敗',
        clickToViewFile: '點擊查看GitHub倉庫中的文件',
        clickToViewDir: '點擊查看GitHub倉庫中的目錄',
        invalidLinkHint: '（這個作者很笨，把連結寫錯了，去提醒ta修改吧）'
    },
    action: {
        help: '幫助',
        jumpToGitHub: '跳轉到GitHub',
        comment: '評論'
    }
}