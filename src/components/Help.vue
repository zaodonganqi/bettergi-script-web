<template>
  <div class="help-modal-content">
    <div class="help-title">观前提示：任何问题请在自己思考后再提出，下方回答语气较粗，系正常现象，与BGI作者无关，如有不满敬请谅解或联系此页面作者发泄</div>
    <div class="author-title">作者邮箱：anqi4051@gmail.com</div>
    <div v-for="(item, idx) in qaList" :key="idx" class="qa-item">
      <div class="qa-question"><span class="qa-index">{{ idx + 1 }}.</span> {{ item.q }}</div>
      <div class="qa-answer">{{ item.a }}</div>
      <div v-if="idx < qaList.length - 1" class="qa-divider"></div>
    </div>
  </div>
</template>

<script setup>
const qaList = [
  { q: '为什么仓库一直加载失败？', a: '仓库使用的是github的地址，国内直接连接可能会时好时坏，属正常现象，打不开就多试几次或者过几分钟再来试试，也可以使用BGI的本地仓库页面。' },
  { q: '评论功能为什么不可用？', a: '本地模式下不支持评论，请访问在线仓库并登录github账号后评论，如何使用github请自行解决，这里不做引导。' },
  { q: '为什么没有XX脚本？', a: '全部找过后（四个列表全部找过），没有这个脚本，那就是没人写这个脚本。'},
  { q: 'README是什么，为什么加载失败了？为什么没有显示？', a: '问README是什么的，学过小学英语的请读一遍README😡。加载失败情况同第一问。没显示是因为脚本作者没有写README或者README.md这个文件命名错了。' },
  { q: '一些链接为什么点不开？加载半天为什么加载不出来？', a: '同第一问。' },
  { q: '点击订阅后为什么没反应？', a: '请打开BGI，这时会有导入窗口弹出，选择导入。如果你使用的是在线仓库，刷新BGI页面后没有你订阅的脚本，请更新本地仓库后重试，还有异常请在相关群中提问。' },
  { q: '这个脚本用不了怎么办？', a: '请在相关群中提问，具体问题具体分析，提问时确保你的截图和描述充分。' },
  { q: '我之前的评论怎么不见了？', a: '一般不会删评，如果评论消失大概率是你评论的节点路径改变了，比如水晶矿这个目录被改名成了晶水矿，那就会导致你看到的是新的评论区。' },
  { q: '这个脚本为什么不用纳西妲？', a: '作者们都需要考虑是不是所有人都有，如果你需要请尝试自己做一个。' },
  { q: '我想要XX功能怎么办？', a: '没有作者写那就自己写一个！'},
  { q: '其它', a: '更多问题请联系我，如有价值也会不定期更新该页面。'},
];
</script>

<style scoped>
.help-modal-content {
  padding: 10px 16px;
  max-height: 60vh;
  overflow-y: auto;
}
.help-title {
  font-size: 30px;
  font-weight: bold;
  color: #000000;
  margin-bottom: 24px;
  letter-spacing: 2px;
}
.author-title {
  font-size: 15px;
  color: #000000;
  margin-bottom: 20px;
}
.qa-item {
  margin-bottom: 28px;
}
.qa-question {
  font-size: 20px;
  font-weight: 600;
  color: #222;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}
.qa-index {
  color: #000000;
  font-size: 18px;
  font-weight: bold;
  margin-right: 6px;
}
.qa-answer {
  font-size: 15px;
  color: #666;
  line-height: 1.7;
  padding-left: 8px;
}
.qa-divider {
  border-bottom: 1px solid #ececec;
  margin: 18px 0 0 0;
}
</style> 