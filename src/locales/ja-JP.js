export default {
    menu: {
        map: 'マップ追跡',
        script: 'Javascript スクリプト',
        combat: '戦闘戦略',
        tcg: '七聖召喚戦略'
    },
    button: {
        ok: '確認',
        cancel: 'キャンセル',
        refresh: 'ページを更新',
        help: 'ヘルプを見る',
        all: 'すべて',
        subscribed: '購読済み',
        visitOnline: 'オンライン倉庫へ'
    },
    sider: {
        repoTitle: 'スクリプト倉庫',
        mainRepo: 'BetterGIメイン倉庫へ',
        scriptRepo: 'BetterGIスクリプト倉庫へ',
        onlineRepo: 'オンライン倉庫へ',
        lastUpdate: '最終更新：'
    },
    script: {
        all: 'すべて',
        subscribed: '購読済み',
        onlyLocal: 'ローカルモードのみ利用可能',
        searchMap: 'リソース名、作者、タグで検索',
        searchScript: 'スクリプト名、作者、説明、タグで検索',
        searchCombat: '戦闘戦略名、作者、タグで検索',
        searchTCG: '七聖召喚戦略名、作者、タグで検索',
        searchDefault: 'キーワードを入力して検索',
        author: '作者：',
        noAuthor: '作者情報なし',
        unknown: '不明なスクリプト'
    },
    error: {
        repoTitle: '倉庫情報の取得に失敗しました',
        repoDesc: 'ネットワークを確認するか、後でページを更新してください',
        loading: '倉庫データを読み込み中...'
    },
    comment: {
        title: 'コメント',
        localModeTitle: 'ローカルモードではコメントできません',
        localModeDesc: 'オンライン倉庫でコメントしてください'
    },
    egg: {
        title: 'イースターエッグ',
        loading: 'イースターエッグを読み込み中…',
        error: '読み込みに失敗しました。再試行してください'
    },
    help: {
        title: 'よくある質問',
        modalTitle: 'ご注意：質問をする前によく考えてください。下記の回答は厳しい口調かもしれませんが、BGI作者とは関係ありません。不満があればこのページの作者にご連絡ください。',
        author: '作者メール：anqi4051@gmail.com',
        qa: [
            { q: 'なぜリポジトリの読み込みに失敗し続けるのですか？', a: 'リポジトリはGitHubのアドレスを使用しており、中国国内からの接続は不安定な場合があります。失敗した場合は何度か試すか、しばらく待ってから再試行してください。またはBGIのローカルリポジトリページを使用してください。（魔法使いなら分かるはず）' },
            { q: 'コメント機能が使えないのはなぜですか？', a: 'ローカルモードではコメントはサポートされていません。オンラインリポジトリにアクセスし、GitHubアカウントでログインしてコメントしてください。GitHubの使い方はここでは案内しません。' },
            { q: 'XXスクリプトがないのはなぜですか？', a: '4つのリストをすべて探しても見つからなければ、誰も作っていないということです。' },
            { q: '購読機能の使い方は？', a: '「BetterGI → 設定 → BetterGI Http サーバー設定」（見つからない場合はBGIを最新版にアップデートしてください）、有効化しポート番号を30648に設定。完了後このページを閉じてBGIを再起動してください。問題が解決しない場合は作者に連絡してください。' },
            { q: 'READMEとは何ですか？なぜ読み込めない/表示されないのですか？', a: 'READMEが何か分からない場合は一度読んでください。読み込み失敗は最初の質問を参照。表示されない場合はスクリプト作者がREADMEを書いていないか、ファイル名が間違っています。' },
            { q: '一部のリンクが開けない/遅いのはなぜですか？', a: '最初の質問を参照。' },
            { q: '購読をクリックしても反応がないのはなぜですか？', a: 'BGIを開くとインポートウィンドウが表示されます。オンラインリポジトリを使っていて購読が反映されない場合はローカルリポジトリを更新して再試行してください。その他の問題は関連グループで質問してください。' },
            { q: 'このスクリプトが使えない場合は？', a: '関連グループで質問し、十分なスクリーンショットと説明を提供してください。' },
            { q: '以前のコメントが消えたのはなぜですか？', a: 'コメントが削除されることはほとんどありません。消えた場合はノードパスが変更された可能性があります（例：ディレクトリ名の変更）。' },
            { q: 'なぜこのスクリプトでナヒーダを使わないのですか？', a: '作者は全員がそのキャラを持っているか考慮します。必要なら自分で作ってみてください。' },
            { q: 'XX機能が欲しい場合は？', a: '作者が作らないなら自分で作りましょう！' },
            { q: 'その他', a: '他に質問があればご連絡ください。有用なものは随時更新します。' },
        ]
    },
    common: {
        comma: '、',
        noDesc: 'なし'
    },
    detail: {
        author: '作者：',
        noAuthor: '作者情報なし',
        subscribe: '購読',
        subscribed: '購読済み',
        subscribeAgain: '再購読',
        subscribeFailed: '購読に失敗しました',
        subscribeFailedWithMsg: '購読に失敗しました: {msg}',
        subscribeSuccess: '{name} の購読リンクをクリップボードにコピーしました',
        copyFailed: '{name} の購読リンクのコピーに失敗しました',
        loadingReadme: 'readmeファイルを読み込み中',
        readmeFailed: 'readmeファイルの読み込みに失敗しました。再試行してください',
        loadingStrategy: '戦略ファイルの内容を読み込み中',
        strategyFailed: '戦略ファイルの読み込みに失敗しました。再試行してください',
        empty: '左側のスクリプトを選択して詳細を表示してください',
        desc: '概要：',
        tabReadme: '概要',
        tabFiles: 'ファイル一覧',
        noFiles: 'ファイルデータがありません',
        modalTitle: 'ファイル詳細',
        name: '名前',
        tags: 'タグ',
        lastUpdated: '最終更新',
        operations: '操作',
        hash: 'hash',
        description: '説明',
        version: 'バージョン',
        path: 'パス',
        details: '詳細',
        showDetails: '詳細'
    },
    scriptList: {
        subscribed: '購読済み',
        noAuthor: '作者なし'
    },
    combatStrategyList: {
        subscribed: '購読済み',
        noAuthor: '作者なし'
    },
    cardStrategyList: {
        subscribed: '購読済み',
        noAuthor: '作者なし'
    },
    mapTreeList: {
        subscribed: '購読済み',
        subscribe: '購読',
        subscribeAgain: '再購読',
        selectValidNode: '有効なノードを選択して購読してください',
        subscribeFailed: '購読に失敗しました',
        subscribeFailedWithMsg: '購読に失敗しました: {msg}',
        subscribeSuccess: '{name} の購読リンクをクリップボードにコピーしました',
        copyFailed: '{name} の購読リンクのコピーに失敗しました',
        noDesc: 'なし'
    },
    readmeViewer: {
        descTitle: '概要：',
        noDesc: '説明なし',
        loadTimeout: '読み込みタイムアウト',
        loadFailed: '読み込み失敗',
        clickToViewFile: 'GitHubでファイルを見る',
        clickToViewDir: 'GitHubでディレクトリを見る',
        invalidLinkHint: '（作者がリンクを間違えています。修正を促してください）'
    },
    action: {
        help: 'ヘルプ',
        jumpToGitHub: 'GitHubへジャンプ',
        comment: 'コメント'
    }
}