import { defineStore } from 'pinia'
import {computed, nextTick, reactive, ref, watch} from "vue";
import {BulbOutlined, CalculatorOutlined, FileOutlined, FolderOutlined} from "@ant-design/icons-vue";
import {useI18n} from "vue-i18n";
import {getMirrorPath, getRawPath} from "@/utils/basePaths.js";
import {subscribePaths} from "@/utils/subscription.js";
import {mapTagsToCanonical} from "@/utils/roleAlias.js";
import pako from "pako";
import {message as Message} from 'ant-design-vue';

export const useMainStore = defineStore('mainStore', () => {
    const {t: $t} = useI18n();

    // 当前运行环境
    const mode = import.meta.env.VITE_MODE;
    const isModeSingle = mode === 'single';

    // 仓库状态
    // 仓库json文件解构后数据
    const repoData = ref({});
    // 当前选中的脚本
    const selectedScript = ref(null);
    // 仓库加载失败状态（一般在线仓库才会生效）
    const repoError = ref(false);
    // 仓库加载中状态
    const globalLoading = ref(false);
    // 是否启用镜像加速
    const useMirror = ref(false);
    // 加载超时计时器
    let fetchTimeoutId = null;
    // 订阅信息获取失败标志
    const subscribedConfigError = ref(false);
    // 已订阅脚本列表
    const subscribedScripts = ref([]);
    // 已订阅脚本路径列表
    const subscribedScriptPaths = ref([]);
    // 更新订阅脚本中状态
    const updatingSubscribed = ref(false);
    // 有更新的脚本列表
    const updatedScripts = ref([]);
    // 控制一键订阅弹窗显示
    const showUpdateSubscribeModal = ref(false);
    
    // 评论弹窗显示状态
    const showCommentModal = ref(false);
    
    // 列表两列布局状态
    const isListTwoColumn = ref(false);

    // 获取仓库json文件并解构
    async function getRepoJson() {
        clearReadme404Cache();
        repoError.value = false;
        globalLoading.value = true;

        try {
            console.log("Current mode:", mode);
            // 在线仓库模式
            if (!isModeSingle) {
                const controller = new AbortController();
                let didTimeout = false;
                if (fetchTimeoutId) clearTimeout(fetchTimeoutId);
                // 设置10秒定时器
                fetchTimeoutId = setTimeout(() => {
                    didTimeout = true;
                    controller.abort();
                }, 10000);
                try {
                    let repoPath = '';
                    if (useMirror.value) {
                        console.log("Using mirror for fetching repo.json");
                        repoPath = getMirrorPath() + 'repo.json.gz';
                    } else {
                        repoPath = getRawPath() + 'repo.json.gz';
                    }
                    const response = await fetch(repoPath, {
                        signal: controller.signal
                    });
                    clearTimeout(fetchTimeoutId);
                    fetchTimeoutId = null;
                    if (!response.ok) throw new Error('Network request failed');
                    // 获取gzip文件后解压，减少数据传输量
                    const arrayBuffer = await response.arrayBuffer();
                    const unit8ArrayData = new Uint8Array(arrayBuffer);
                    const deUnit8ArrayData = pako.ungzip(unit8ArrayData);
                    const jsonString = new TextDecoder().decode(deUnit8ArrayData);
                    repoData.value = JSON.parse(jsonString);
                } catch (err) {
                    useMirror.value = true; // 下次使用镜像
                    clearTimeout(fetchTimeoutId);
                    fetchTimeoutId = null;
                    if (didTimeout) {
                        throw new Error('Request timed out');
                    } else {
                        throw err;
                    }
                }
            } else { // 本地仓库模式
                const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
                const json = await repoWebBridge.GetRepoJson();
                repoData.value = typeof json === 'string' ? JSON.parse(json) : json;
                // 获取订阅信息
                await fetchSubscribedConfig();
                // 获取有更新的脚本列表
                getUpdatedScripts();
            }
            console.log("json info:", repoData.value)

            // 获取脚本数量计数
            menuCounts.value[0] = getMapCount(repoData.value);
            menuCounts.value[1] = getJsCount(repoData.value);
            menuCounts.value[2] = getCombatCount(repoData.value);
            menuCounts.value[3] = getCardCount(repoData.value);
        } catch (e) {
            console.error('Failed to fetch repo info', e);
            repoError.value = true;
        }
        globalLoading.value = false;
        return repoData.value;
    }

    // 获取订阅信息
    async function fetchSubscribedConfig() {
        if (!isModeSingle) return;
        try {
            const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
            const json = await repoWebBridge.GetUserConfigJson();
            let config = {};
            try {
                config = typeof json === 'string' ? JSON.parse(json) : json;
            } catch (e) {
                config = {};
            }
            const paths = Array.from(new Set(config.scriptConfig?.subscribedScriptPaths || []));
            if (JSON.stringify(paths) !== JSON.stringify(subscribedScriptPaths.value)) {
                if (!paths.length) {
                    subscribedConfigError.value = true;
                    subscribedScriptPaths.value = [];
                } else {
                    subscribedScriptPaths.value = paths;
                    if (!repoData.value || !Array.isArray(repoData.value.indexes)) return;
                    subscribedScripts.value = [];
                    // 递归构建完整路径，使用 name 作为标题
                    function findNodes(node, currentPath) {
                        if (!node) return;
                        const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
                        const isSubscribed = subscribedScriptPaths.value.some(sub => fullPath === sub);
                        const isRoot = ['pathing', 'js', 'combat', 'tcg'].includes(node.name);
                        if (isSubscribed && !isRoot) {
                            subscribedScripts.value.push([node.name, fullPath]);
                        }
                        // 继续向下遍历
                        if (Array.isArray(node.children) && node.children.length > 0) {
                            node.children.forEach(child => findNodes(child, fullPath));
                        }
                    }
                    repoData.value.indexes.forEach(index => {
                        findNodes(index, '');
                    });
                    subscribedConfigError.value = false;
                }
            }
        } catch (e) {
            subscribedConfigError.value = true;
        }
    }

    // 获取所有更新节点信息
    function getUpdatedScripts() {
        if (!repoData.value || !Array.isArray(repoData.value.indexes)) return;
        updatedScripts.value = [];
        // 递归构建完整路径，使用 name 作为标题
        function dfs(node, currentPath) {
            if (!node) return;
            const fullPath = currentPath ? `${currentPath}/${node.name}` : node.name;
            if (node.hasUpdate && !['pathing', 'js', 'combat', 'tcg'].includes(node.name) && !String(node.type || '').includes('file')) {
                node.path = fullPath;
                updatedScripts.value.push(node);
            }
            // 继续向下遍历
            if (Array.isArray(node.children) && node.children.length > 0) {
                node.children.forEach(child => dfs(child, fullPath));
            }
        }
        repoData.value.indexes.forEach(index => {
            dfs(index, '');
        });
        updatedScripts.value.forEach(item => { item.lastUpdated = findLatestTime(item) });
        updatedScripts.value.sort((a, b) => { return String(b.lastUpdated).localeCompare(String(a.lastUpdated))});
    }

    // 更新已订阅的脚本
    async function updateSubscribedScripts() {
        if (updatingSubscribed.value) return;
        if (subscribedScriptPaths.value.length === 0) {
            showUpdateSubscribeModal.value = false;
            return;
        }

        updatingSubscribed.value = true;
        try {
            const result = await subscribePaths(subscribedScriptPaths.value);
            if (!result?.ok) {
                Message.error($t('detail.subscribeFailed'));
                return;
            }

            const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
            const paths = [...subscribedScriptPaths.value];
            const batchSize = 10;
            for (let i = 0; i < paths.length; i += batchSize) {
                const slice = paths.slice(i, i + batchSize);
                await Promise.all(slice.map(p => repoWebBridge.UpdateSubscribed(p)));
            }

            for (const p of paths) {
                updateScriptHasUpdate(p, false);
            }

            await fetchSubscribedConfig();

            showUpdateSubscribeModal.value = false;
        } catch (e) {
            console.error('updateSubscribedScripts failed', e);
            Message.error($t('detail.subscribeFailed'));
        } finally {
            updatingSubscribed.value = false;
        }
    }

    // 更新repoData中指定脚本的hasUpdate状态
    const updateScriptHasUpdate = (scriptPath, hasUpdate) => {
        if (!repoData.value || !repoData.value.indexes) return;

        let targetNode = null;

        // 递归查找目标节点
        const findTargetNode = (node, currentPath = '') => {
            // 构建当前节点的完整路径
            const nodePath = currentPath ? `${currentPath}/${node.name}` : node.name;

            // 检查是否匹配目标路径
            if (nodePath === scriptPath || scriptPath.endsWith(`/${nodePath}`)) {
                targetNode = node;
                return;
            }

            // 如果有子节点，继续递归查找
            if (node.children && node.children.length > 0) {
                for (let child of node.children) {
                    findTargetNode(child, nodePath);
                    // 不return，继续查找所有分支
                }
            }
        };

        // 递归更新所有子节点的hasUpdate状态
        const updateDescendants = (node) => {
            if (!node) return;

            // 先更新所有子节点
            if (node.children && node.children.length > 0) {
                for (let child of node.children) {
                    updateDescendants(child);
                }
            }

            // 最后更新当前节点
            node.hasUpdate = hasUpdate;
        };

        // 先从repoData递归查找目标节点
        for (let index of repoData.value.indexes) {
            findTargetNode(index);
            if (targetNode) break; // 找到目标节点后停止查找
        }

        if (targetNode) {

            // 先更新所有子节点，最后更新目标节点本身
            updateDescendants(targetNode);

            // 强制触发响应式更新
            nextTick(() => {
                repoData.value = {...repoData.value};
            });
        } else {
            console.log("updateScriptHasUpdate: 未找到匹配节点", scriptPath);
        }
    };

    // 监听已订阅脚本路径
    watch(subscribedScriptPaths, (newPaths) => {
        if (!selectedScript.value) return;

        if (selectedScript.value.path) {
            const isSubscribed = newPaths.some(p => selectedScript.value.path === p || selectedScript.value.path.startsWith(p + '/'));
            if (selectedScript.value.isSubscribed !== isSubscribed) {
                selectedScript.value.isSubscribed = isSubscribed;
            }
        }

        if (selectedScript.value.type === 'directory' && selectedScript.value.files && Array.isArray(selectedScript.value.files)) {
            selectedScript.value.files.forEach(file => {
                if (file.path) {
                    file.isSubscribed = newPaths.some(p => file.path === p || file.path.startsWith(p + '/'));
                }
            });
        }
    });

    //菜单
    // 选择的菜单目录项
    const selectedMenu = ref(['1']);
    // 每个菜单项包含的脚本数
    const menuCounts = ref([0, 0, 0, 0]);
    // 列表筛选项：全部、已订阅（本地模式）
    const scriptTab = ref('all');
    // 左侧菜单项
    const menuList = computed(() => [
        {key: '1', label: $t('menu.map'), icon: FolderOutlined, count: menuCounts.value[0]},
        {key: '2', label: $t('menu.script'), icon: FileOutlined, count: menuCounts.value[1]},
        {key: '3', label: $t('menu.combat'), icon: CalculatorOutlined, count: menuCounts.value[2]},
        {key: '4', label: $t('menu.tcg'), icon: BulbOutlined, count: menuCounts.value[3]},
    ]);

    // 切换菜单
    const handleMenuSelect = ({key}) => {
        selectedMenu.value = [key];
        search.value = '';
        selectedScript.value = null;
    };

    // 监听选择菜单变化
    watch(selectedMenu, () => {
        scriptTab.value = 'all';
        // 切换菜单时恢复该菜单上次会话内的排序状态
        applySortForMenu(selectedMenu.value[0]);
        // 同步 combat 面板临时选择
        roleFilterSearch.value = '';
        selectedRoleTags.value = [...appliedRoleTags.value];
    });

    // 计算最后更新时间
    const lastUpdateTime = computed(() => {
        if (repoData.value && repoData.value.time) {
            // 区分本地与web模式，如需更改最后更新时间格式请更改此处
            if (!isModeSingle) {
                return `${formatTime(repoData.value.time)}`;
            }
            return `${formatTime(repoData.value.time)}`;
        }
        return '';
    });

    // 彩蛋显示
    const showEggModal = ref(false);
    // 彩蛋 README 加载状态
    const isLoadingEggReadme = ref(false);
    const eggReadmeError = ref(false);

    // 彩蛋弹窗加载完成
    const handleEggReadmeLoaded = () => {
        isLoadingEggReadme.value = false;
        eggReadmeError.value = false;
    };

    // 彩蛋弹窗加载失败
    const handleEggReadmeError = () => {
        console.log('Egg README load failed');
        isLoadingEggReadme.value = false;
        eggReadmeError.value = true;
    };
    // 重试加载彩蛋弹窗
    const retryLoadEggReadme = () => {
        console.log('Retry loading egg README');
        isLoadingEggReadme.value = true;
        eggReadmeError.value = false;
    };

    // 监听彩蛋弹窗打开，重置加载状态
    watch(showEggModal, (newVal) => {
        if (newVal) {
            // 重置状态
            isLoadingEggReadme.value = true;
            eggReadmeError.value = false;
        }
    });

    // 获取当前菜单标题
    const currentMenuTitle = computed(() => {
        const current = menuList.value.find(item => item.key === selectedMenu.value[0]);
        return current ? current.label : '';
    });

    // 搜索
    // 搜索框文本
    const search = ref('');

    // 搜索框占位符
    const searchPlaceholder = computed(() => {
        switch (selectedMenu.value[0]) {
            case '1':
                return $t('script.searchMap');
            case '2':
                return $t('script.searchScript');
            case '3':
                return $t('script.searchCombat');
            case '4':
                return $t('script.searchTCG');
            default:
                return $t('script.searchDefault');
        }
    });

    // 修改搜索框文本
    const handleSearch = (e) => {
        const value = e.target ? e.target.value : e;
        search.value = value;
        
        // 开始搜索时，切换到相关性排序
        if (value && value.trim()) {
            sortType.value = 'relevance';
        }
        // 清空搜索时，应用回之前的排序方式
        else if (!value) {
            applySortForMenu(selectedMenu.value[0]);
        }
    };

    // 排序筛选
    // 一级排序下拉彩蛋显隐
    const sortDropdownOpen = ref(false);
    // 战斗策略角色筛选
    const roleFilterSearch = ref('');
    // 角色复选框选中项数组（≤4）
    const selectedRoleTags = ref([]);
    // 生效的选中角色数组
    const appliedRoleTags = ref([]);
    // 排序相关数据
    const sortType = ref('time'); // 时间排序
    const sortOrder = ref('desc'); // 排序顺序
    // 除地图追踪外的排序选项（相互独立）
    const sortStateByMenu = reactive({
        '2': {type: 'time', order: 'desc'},
        '3': {type: 'time', order: 'desc'},
        '4': {type: 'time', order: 'desc'}
    });
    // 映射后的角色列表（战斗策略）
    const allRoleTags = computed(() => collectCombatTags(repoData.value));

    // 处理排序菜单点击
    const handleSortMenuClick = ({key}) => {
        if ([ 'relevance', 'time','random', 'name' ].includes(key)) {
            sortType.value = key;
            // 名称排序默认使用正序
            if (key === 'name') {
                sortOrder.value = 'asc';
            } else if (key === 'time') {
                sortOrder.value = 'desc';
            }
        } else if (['asc', 'desc'].includes(key)) {
            sortOrder.value = key;
        }
        // 保存当前菜单的排序状态
        if (!search.value) {
            saveSortForMenu(selectedMenu.value[0]);
        }
    };

    // 保存不同菜单下排序选项状态
    function saveSortForMenu(menuKey) {
        if (!['2', '3', '4'].includes(menuKey)) return;
        sortStateByMenu[menuKey] = { type: sortType.value, order: sortOrder.value };
        console.log('排序设置已更新:', {sortType: sortType.value, sortOrder: sortOrder.value});
    }

    // 搜索角色结果列表（实际展示的数据）（战斗策略）
    const displayedRoleTags = computed(() => {
        const kw = (roleFilterSearch.value || '').trim().toLowerCase();
        if (!kw) return allRoleTags.value;
        return allRoleTags.value.filter(t => String(t).toLowerCase().includes(kw));
    });

    // 更新复选框选中后的角色状态（战斗策略）
    function onRoleCheckboxChange(tag, evt) {
        const checked = evt?.target?.checked;
        const current = new Set(selectedRoleTags.value);
        if (checked) {
            if (!current.has(tag) && current.size < 4) current.add(tag);
        } else {
            current.delete(tag);
        }
        selectedRoleTags.value = Array.from(current);
        appliedRoleTags.value = [...selectedRoleTags.value];
    }

    // 重置选中角色（战斗策略）
    function resetRoleFilter() {
        selectedRoleTags.value = [];
        appliedRoleTags.value = [];
    }

    // 点击确定后关闭二级菜单（战斗策略）
    function confirmRoleFilter() {
        appliedRoleTags.value = [...selectedRoleTags.value];
        sortDropdownOpen.value = false;
    }

    // 切换目录后更换排序选项
    function applySortForMenu(menuKey) {
        const state = sortStateByMenu[menuKey];
        if (state) {
            sortType.value = state.type || 'time';
            sortOrder.value = state.order || 'desc';
        } else {
            sortType.value = 'time';
            sortOrder.value = 'desc';
        }
    }

    // 帮助弹窗显示状态
    const showHelpModal = ref(false);
    
    // 更新计划弹窗显示状态
    const showPlanModal = ref(false);

    // 切换全部与已订阅状态
    const onClickShowAll = () => {
        if (!isModeSingle) return;
        scriptTab.value = 'all';
    };

    const onClickShowSubscribed = () => {
        if (!isModeSingle) return;
        if (subscribedConfigError.value || subscribedScriptPaths.value.length === 0) {
            scriptTab.value = 'subscribed';
            return;
        }
        scriptTab.value = 'subscribed';
    };

    // 选择语言切换
    const onLocaleChange = (val) => {
        // 这里需要访问settings store，所以我们需要在组件中调用
        // 这个方法主要用于在main store中统一管理UI交互逻辑
        return val;
    };

    // 地图追踪板块
    const handleMapSelect = (location) => {
        selectedScript.value = location;
    };

    // 切换当前选中的脚本
    const handleScriptSelect = (script) => {
        selectedScript.value = script;
    };

    // 使用新窗口打开外链
    const openExternalLink = (link) => {
        window.open(link, '_blank');
    };

    // 静默刷新已订阅
    const refreshSubscribedConfigSilently = async (paths) => {
        try {
            if (!paths.length) {
                subscribedConfigError.value = true;
                subscribedScriptPaths.value = [];
            } else {
                subscribedScriptPaths.value = paths;
                subscribedConfigError.value = false;
            }
        } catch (e) {
            subscribedConfigError.value = true;
        }
    };

    let pollingTimer = null;
    let pollingTimeout = null;
    let lastConfigStr = '';

    // 拉取用户配置信息
    const startPollingUserConfig = () => {
        if (pollingTimer) clearInterval(pollingTimer);
        if (pollingTimeout) clearTimeout(pollingTimeout);

        lastConfigStr = JSON.stringify(subscribedScriptPaths.value);

        pollingTimer = setInterval(async () => {
            const repoWebBridge = chrome.webview.hostObjects.repoWebBridge;
            const json = await repoWebBridge.GetUserConfigJson();
            if (json) {
                let config = {};
                try {
                    config = typeof json === 'string' ? JSON.parse(json) : json;
                } catch (e) {
                    config = {};
                }
                const paths = Array.from(new Set(config.scriptConfig?.subscribedScriptPaths || []));
                const newConfigStr = JSON.stringify(paths);
                if (newConfigStr !== lastConfigStr) {
                    // config有变化，静默刷新
                    await refreshSubscribedConfigSilently(paths);
                    lastConfigStr = newConfigStr;
                }
            }
        }, 1000);

        pollingTimeout = setTimeout(() => {
            if (pollingTimer) clearInterval(pollingTimer);
            pollingTimer = null;
            pollingTimeout = null;
        }, 8000);
    };

    return {
        // 当前运行环境
        mode,
        isModeSingle,
        // 仓库数据
        repoData,
        repoError,
        globalLoading,
        subscribedConfigError,
        subscribedScripts,
        subscribedScriptPaths,
        updatingSubscribed,
        updatedScripts,
        showUpdateSubscribeModal,
        selectedScript,
        isListTwoColumn,
        getRepoJson,
        updateSubscribedScripts,
        updateScriptHasUpdate,
        startPollingUserConfig,
        // 菜单
        selectedMenu,
        menuList,
        currentMenuTitle,
        handleMenuSelect,
        // 仓库最后更新时间
        lastUpdateTime,
        // 彩蛋显示
        showEggModal,
        isLoadingEggReadme,
        eggReadmeError,
        handleEggReadmeLoaded,
        handleEggReadmeError,
        retryLoadEggReadme,
        // 搜索
        search,
        searchPlaceholder,
        handleSearch,
        // 排序筛选
        sortDropdownOpen,
        roleFilterSearch,
        selectedRoleTags,
        appliedRoleTags,
        sortType,
        sortOrder,
        displayedRoleTags,
        handleSortMenuClick,
        onRoleCheckboxChange,
        resetRoleFilter,
        confirmRoleFilter,
        applySortForMenu,
        // 帮助弹窗
        showHelpModal,
        // 更新计划弹窗
        showPlanModal,
        // 评论
        showCommentModal,
        // 脚本选择相关
        scriptTab,
        onClickShowAll,
        onClickShowSubscribed,
        onLocaleChange,
        handleMapSelect,
        handleScriptSelect,
        openExternalLink,
        refreshSubscribedConfigSilently,
    }
});

// 四个菜单的获取脚本数量方法
function getJsCount(repo) {
    return countCategoryLeaves(repo, 'js');
}

function getMapCount(repo) {
    return countCategoryLeaves(repo, 'pathing');
}

function getCombatCount(repo) {
    return countCategoryLeaves(repo, 'combat');
}

function getCardCount(repo) {
    // tcg 的叶子是文件节点
    return countCategoryLeaves(repo, 'tcg', (node) => node.type === 'file');
}

// 按分类统计脚本数量
function countCategoryLeaves(repo, categoryName, isLeaf) {
    if (!repo?.indexes) return 0;
    const category = repo.indexes.find(item => item.name === categoryName);
    if (!category || !Array.isArray(category.children)) return 0;

    const hasExpandableChildren = (node) => {
        if (!node?.children || node.children.length === 0) return false;
        return node.children.some(child => child.type === 'directory');
    };

    const defaultIsLeaf = (node) => !hasExpandableChildren(node);
    const leafPredicate = typeof isLeaf === 'function' ? isLeaf : defaultIsLeaf;

    function dfs(nodes) {
        if (!nodes) return 0;
        let total = 0;
        for (const node of nodes) {
            if (leafPredicate(node)) {
                total++;
            } else if (node.children && node.children.length > 0) {
                total += dfs(node.children);
            }
        }
        return total;
    }

    return dfs(category.children);
}

// 格式化时间
function formatTime(timeString) {
    if (!timeString) return '';
    const year = timeString.substring(0, 4);
    const month = timeString.substring(4, 6);
    const day = timeString.substring(6, 8);
    const hour = timeString.substring(8, 10);
    const minute = timeString.substring(10, 12);
    const second = timeString.substring(12, 14);

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// 清理所有readme404缓存
function clearReadme404Cache() {
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('readme404:')) {
            localStorage.removeItem(key);
        }
    });
}

// 获取该节点内最晚的更新时间
function findLatestTime (node) {
    if (!node || typeof node !== 'object') return '';

    let latest = '';

    if (node.lastUpdated) {
        const currentTime = node.lastUpdated;
        if (!latest || new Date(currentTime) >= new Date(latest)) {
            latest = currentTime;
        }
    }

    if (node.children && Array.isArray(node.children) && node.children.length > 0) {
        for (const child of node.children) {
            const childLatest = findLatestTime(child);
            if (childLatest && (!latest || new Date(childLatest) > new Date(latest))) {
                latest = childLatest;
            }
        }
    }

    return latest;
}

// 获取排序后的角色列表（映射角色名后的）（战斗策略）
function collectCombatTags(repo) {
    if (!repo?.indexes) return [];
    const combat = repo.indexes.find(i => i.name === 'combat');
    if (!combat || !Array.isArray(combat.children)) return [];
    const all = [];
    const dfs = (nodes) => {
        for (const node of nodes) {
            if (node.children && node.children.length > 0) {
                dfs(node.children);
            } else {
                const tags = mapTagsToCanonical(Array.isArray(node.tags) ? node.tags : []);
                for (const tag of tags) if (tag && typeof tag === 'string') all.push(tag);
            }
        }
    };
    dfs(combat.children);
    return Array.from(new Set(all)).sort((a, b) => String(a).localeCompare(String(b)));
}