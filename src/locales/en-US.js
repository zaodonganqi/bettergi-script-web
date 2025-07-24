export default {
    menu: {
        map: 'Map Tracking',
        script: 'Javascript Scripts',
        combat: 'Combat Strategies',
        tcg: 'Genius Invokation TCG Strategies'
    },
    button: {
        ok: 'OK',
        cancel: 'Cancel',
        refresh: 'Refresh Page',
        help: 'View Help',
        all: 'All',
        subscribed: 'Subscribed',
        visitOnline: 'Visit Online Repository'
    },
    sider: {
        repoTitle: 'Script Repository',
        mainRepo: 'Visit BetterGI Main Repo',
        scriptRepo: 'Visit BetterGI Script Repo',
        onlineRepo: 'Visit Online Repository',
        lastUpdate: 'Last Updated: '
    },
    script: {
        all: 'All',
        subscribed: 'Subscribed',
        onlyLocal: 'Local Page Only',
        searchMap: 'Search resource name, author, tag',
        searchScript: 'Search script name, author, description, tag',
        searchCombat: 'Search strategy name, author, tag',
        searchTCG: 'Search TCG strategy name, author, tag',
        searchDefault: 'Enter keywords to search',
        author: 'Author: ',
        noAuthor: 'No author information',
        unknown: 'Unknown Script'
    },
    error: {
        repoTitle: 'Failed to Fetch Repository',
        repoDesc: 'Please check network or refresh later'
    },
    comment: {
        title: 'Comments',
        localModeTitle: 'Comments Unavailable in Local Mode',
        localModeDesc: 'Please use online repository for comments'
    },
    egg: {
        title: 'Easter Egg',
        loading: 'Easter egg is loading...',
        error: 'Failed to load, please retry'
    },
    help: {
        title: 'FAQ',
        modalTitle: 'Notice: Think before asking. Answers below may be blunt. Complaints to:',
        author: 'Author Email: anqi4051@gmail.com',
        qa: [{
                q: 'Why does repository keep failing to load?',
                a: 'Repository uses GitHub which may have unstable connection in some regions. Try refreshing or use local repository page. (Use VPN if available)'
            },
            {
                q: 'Why are comments unavailable?',
                a: 'Local mode doesn\'t support comments. Use online repository with GitHub login.'
            },
            {
                q: 'Why is XX script missing?',
                a: 'If you can\'t find it after checking all categories, it hasn\'t been created.'
            },
            {
                q: 'How to use subscription?',
                a: 'Enable "BetterGI → Settings → HTTP Server" (port 30648). Restart BetterGI. Contact author if issues persist.'
            },
            {
                q: 'What is README? Why won\'t it load?',
                a: 'README = documentation. Loading issues same as Q1. No display = author didn\'t write README or misnamed file.'
            },
            {
                q: 'Why do some links fail to open?',
                a: 'Same as first question.'
            },
            {
                q: 'Why no response after subscribing?',
                a: 'An import window should popup in BetterGI. For online repo, refresh after updating local repo.'
            },
            {
                q: 'What if a script doesn\'t work?',
                a: 'Ask in community groups with detailed description and screenshots.'
            },
            {
                q: 'Why did my comment disappear?',
                a: 'Likely caused by directory path changes (e.g. folder renamed).'
            },
            {
                q: 'Why doesn\'t this script use Nahida?',
                a: 'Authors consider character availability. Make your own version if needed.'
            },
            {
                q: 'How to request XX feature?',
                a: 'Create it yourself if no existing implementation!'
            },
            {
                q: 'Other issues',
                a: 'Contact me for other problems. This page updates periodically.'
            },
        ]
    },
    readmeViewer: {
        descTitle: 'Description:',
        noDesc: 'No description',
        loadTimeout: 'Load timeout',
        loadFailed: 'Load failed',
        clickToViewFile: 'View file in GitHub repo',
        clickToViewDir: 'View directory in GitHub repo',
        invalidLinkHint: '(Invalid link - remind author to fix)'
    },
    action: {
        help: 'Help',
        jumpToGitHub: 'Jump to GitHub',
        comment: 'Comment'
    },
    mapTreeList: {
        subscribed: 'Subscribed',
        subscribe: 'Subscribe',
        subscribeAgain: 'Resubscribe',
        selectValidNode: 'Please select valid node',
        subscribeFailed: 'Subscribe failed',
        subscribeFailedWithMsg: 'Failed: {msg}',
        subscribeSuccess: 'Copied {name} subscription link',
        copyFailed: 'Failed to copy {name} link',
        noDesc: 'None'
    },
    scriptList: {
        subscribed: 'Subscribed',
        noAuthor: 'None',
    },
    combatStrategyList: {
        subscribed: 'Subscribed',
        noAuthor: 'None',
    },
    cardStrategyList: {
        subscribed: 'Subscribed',
        noAuthor: 'None',
    },
    common: {
        comma: ', ',
        noDesc: 'None'
    },
    detail: {
        author: 'Author: ',
        scriptAuthor: 'Author',
        noAuthor: 'Unknown author',
        subscribe: 'Subscribe',
        subscribed: 'Subscribed',
        subscribeAgain: 'Resubscribe',
        subscribeFailed: 'Subscribe failed',
        subscribeFailedWithMsg: 'Failed: {msg}',
        subscribeSuccess: 'Copied {name} subscription link',
        copyFailed: 'Failed to copy {name} link',
        loadingReadme: 'Loading README...',
        readmeFailed: 'README load failed',
        loadingStrategy: 'Loading strategy content...',
        strategyFailed: 'Strategy load failed',
        empty: 'Select script from left panel',
        desc: 'Description:',
        tabReadme: 'README',
        tabFiles: 'Files',
        noFiles: 'No files',
        modalTitle: 'File Details',
        name: 'Name',
        tags: 'Tags',
        lastUpdated: 'Updated',
        operations: 'Actions',
        hash: 'Hash',
        description: 'Description',
        version: 'Version',
        path: 'Path',
        details: 'Details',
        showDetails: 'View'
    },
    settings: {
        title: 'Settings',
        language: 'Language',
        zhCN: 'Simplified Chinese',
        zhTW: 'Traditional Chinese',
        enUS: 'English',
        jaJP: 'Japanese',
        frFR: 'French'
    },
    loading: {
        repoData: 'Repository data is loading, please wait...'
    }
}