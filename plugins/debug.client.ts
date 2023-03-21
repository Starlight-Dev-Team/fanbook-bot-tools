export default defineNuxtPlugin(() => {
  const debug = getDebugMode();
  initDebugger();
  if (debug) {
    console.warn('请勿在调试面板执行不可信的命令！');
    console.info('提示：在 command 处输入 %cqd()%c ，按 OK 退出调试模式', 'font-size: 24px; font-style: italic; color: blue;', 'all: unset;');
    window.qd = function() {
      console.info('正在退出调试模式……');
      setDebugMode(false);
      location.reload();
    };
  }
  return {
    provide: {
      debug,
    },
  };
});
