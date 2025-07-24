export default {
    menu: {
        map: '地图追踪',
        script: 'Javascript 脚本',
        combat: '战斗策略',
        tcg: '七圣召唤策略'
    },
    button: {
        ok: '确定',
        cancel: '取消',
        refresh: '刷新页面',
        help: '查看帮助',
        all: '全部',
        subscribed: '已订阅',
        visitOnline: '访问在线仓库'
    },
    sider: {
        repoTitle: '脚本仓库',
        mainRepo: '访问BetterGI主仓库',
        scriptRepo: '访问BetterGI脚本仓库',
        onlineRepo: '访问在线仓库',
        lastUpdate: '最后更新时间：'
    },
    script: {
        all: '全部',
        subscribed: '已订阅',
        onlyLocal: '仅本地页面可用',
        searchMap: '搜索资源名称、作者、tag',
        searchScript: '搜索脚本名称、作者、简介、tag',
        searchCombat: '搜索战斗策略名称、作者、tag',
        searchTCG: '搜索七圣召唤策略名称、作者、tag',
        searchDefault: '输入关键词查询',
        author: '作者：',
        noAuthor: '暂无作者信息',
        unknown: '未知脚本'
    },
    error: {
        repoTitle: '获取仓库信息失败',
        repoDesc: '请检查网络或稍后刷新页面重试',
        loading: '仓库数据加载中，请稍候...'
    },
    comment: {
        title: '评论',
        localModeTitle: '本地模式暂不支持评论功能',
        localModeDesc: '请移步在线仓库进行评论'
    },
    egg: {
        title: '小彩蛋',
        loading: '彩蛋正在拼尽全力加载…',
        error: '拼尽全力无法战胜，加载失败，请重试'
    },
    help: {
        title: '常见问题 Q&A',
        modalTitle: '观前提示：任何问题请在自己思考后再提出，下方回答语气较粗，属正常现象，与BGI作者无关，如有不满敬请谅解或联系此页面作者发泄',
        author: '作者邮箱：anqi4051@gmail.com',
        qa: [
            { q: '为什么仓库一直加载失败？', a: '仓库使用的是github的地址，国内直接连接可能会时好时坏，属正常现象，打不开就多试几次或者过几分钟再来试试，也可以使用BGI的本地仓库页面。（如果你是一个魔法师，你知道怎么做）' },
            { q: '评论功能为什么不可用？', a: '本地模式下不支持评论，请访问在线仓库并登录github账号后评论，如何使用github请自行解决，这里不做引导。' },
            { q: '为什么没有XX脚本？', a: '全部找过后（四个列表全部找过），没有这个脚本，那就是没人写这个脚本。' },
            { q: '已订阅功能怎么用？', a: '“BetterGI → 设置 → BetterGI Http 服务器设置”（如未找到该设置，请确保BGI已更新至最新版），确保该项已开启且端口号设置为30648。完成后请关闭此页面并重启BGI再次尝试，仍有问题请联系作者解决。' },
            { q: 'README是什么，为什么加载失败了？为什么没有显示？', a: '问README是什么的，学过小学英语的请读一遍README😡。加载失败情况同第一问。没显示是因为脚本作者没有写README或者README.md这个文件命名错了。' },
            { q: '一些链接为什么点不开？加载半天为什么加载不出来？', a: '同第一问。' },
            { q: '点击订阅后为什么没反应？', a: '请打开BGI，这时会有导入窗口弹出，选择导入。如果你使用的是在线仓库，刷新BGI页面后没有你订阅的脚本，请更新本地仓库后重试，还有异常请在相关群中提问。' },
            { q: '这个脚本用不了怎么办？', a: '请在相关群中提问，具体问题具体分析，提问时确保你的截图和描述充分。' },
            { q: '我之前的评论怎么不见了？', a: '一般不会删评，如果评论消失大概率是你评论的节点路径改变了，比如水晶矿这个目录被改名成了晶水矿，那就会导致你看到的是新的评论区。' },
            { q: '这个脚本为什么不用纳西妲？', a: '作者们都需要考虑是不是所有人都有，如果你需要请尝试自己做一个。' },
            { q: '我想要XX功能怎么办？', a: '没有作者写那就自己写一个！' },
            { q: '其它', a: '更多问题请联系我，如有价值也会不定期更新该页面。' },
        ]
    },
    readmeViewer: {
        descTitle: '简介：',
        noDesc: '暂无简介',
        loadTimeout: '加载超时',
        loadFailed: '加载失败',
        clickToViewFile: '点击查看GitHub仓库中的文件',
        clickToViewDir: '点击查看GitHub仓库中的目录',
        invalidLinkHint: '（这个作者很笨，把链接写错了，去提醒ta修改吧）'
    },
    action: {
        help: '帮助',
        jumpToGitHub: '跳转到GitHub',
        comment: '评论'
    },
    mapTreeList: {
        subscribed: '已订阅',
        subscribe: '订阅',
        subscribeAgain: '再次订阅',
        selectValidNode: '请选择一个有效的节点进行订阅',
        subscribeFailed: '订阅失败',
        subscribeFailedWithMsg: '订阅失败: {msg}',
        subscribeSuccess: '已将 {name} 的订阅链接复制到剪贴板',
        copyFailed: '复制 {name} 的订阅链接失败',
        noDesc: '无'
    },
    scriptList: {
        subscribed: '已订阅',
        noAuthor: '无',
    },
    combatStrategyList: {
        subscribed: '已订阅',
        noAuthor: '无',
    },
    cardStrategyList: {
        subscribed: '已订阅',
        noAuthor: '无',
    },
    common: {
        comma: '，',
        noDesc: '无'
    },
    detail: {
        author: '作者：',
        scriptAuthor: '作者',
        noAuthor: '暂无作者信息',
        subscribe: '订阅',
        subscribed: '已订阅',
        subscribeAgain: '再次订阅',
        subscribeFailed: '订阅失败',
        subscribeFailedWithMsg: '订阅失败: {msg}',
        subscribeSuccess: '已将 {name} 的订阅链接复制到剪贴板',
        copyFailed: '复制 {name} 的订阅链接失败',
        loadingReadme: '正在加载readme文件',
        readmeFailed: 'readme文件加载失败，请重试',
        loadingStrategy: '正在加载策略文件内容',
        strategyFailed: '策略文件加载失败，请重试',
        empty: '请选择左侧脚本查看详情',
        desc: '简介：',
        tabReadme: '简介',
        tabFiles: '文件列表',
        noFiles: '暂无文件数据',
        modalTitle: '文件详情',
        name: '名称',
        tags: '标签',
        lastUpdated: '更新时间',
        operations: '操作',
        hash: 'hash',
        description: '描述',
        version: '版本',
        path: '路径',
        details: '详情',
        showDetails: '详情'
    },
    settings: {
        title: '设置',
        language: '选择语言',
        zhCN: '简体中文',
        zhTW: '繁體中文',
        enUS: '英文',
        jaJP: '日语',
        frFR: '法语'
    }
}