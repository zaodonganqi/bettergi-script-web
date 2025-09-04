// 使用main分支的各个仓库路径
// Web页面
const WebPathMain = 'https://github.com/babalae/bettergi-scripts-list/blob/main/repo/';
// 原始文件根路径
const RepoPathMain = 'https://raw.githubusercontent.com/babalae/bettergi-scripts-list/refs/heads/main/repo/';
// raw 根路径
const RawPathMain = 'https://raw.githubusercontent.com/babalae/bettergi-scripts-list/refs/heads/main/';
// 镜像 raw 根路径
const MirrorPathMain = 'https://dkproxy.linzefeng.top/https://raw.githubusercontent.com/babalae/bettergi-scripts-list/refs/heads/main/';

// 使用release分支的各个仓库路径
// Web页面
const WebPathRelease = 'https://github.com/babalae/bettergi-scripts-list/blob/release/repo/';
// 原始文件根路径
const RepoPathRelease = 'https://raw.githubusercontent.com/babalae/bettergi-scripts-list/refs/heads/release/repo/';
// raw 根路径
const RawPathRelease = 'https://raw.githubusercontent.com/babalae/bettergi-scripts-list/refs/heads/release/';
// 镜像 raw 根路径
const MirrorPathRelease = 'https://dkproxy.linzefeng.top/https://raw.githubusercontent.com/babalae/bettergi-scripts-list/refs/heads/release/';

// 仓库 Web 页面根路径
export function getWebPath() {
    return WebPathMain;
}
// 仓库原始文件根路径
export function getRepoPath() {
    return RepoPathMain;
}
// 仓库 raw 根路径
export function getRawPath() {
    return RawPathMain;
}
// 镜像 raw 根路径
export function getMirrorPath() {
    return MirrorPathMain;
}
// 镜像加速站点
export function getMirror() {
    return 'https://dkproxy.linzefeng.top/';
}