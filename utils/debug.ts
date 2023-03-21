/**
 * 调试相关通用工具。
 */

import VConsole from 'vconsole';
import useMainStore from '~~/stores/main';

let vConsole: VConsole | undefined;

/**
 * 获取调试模式开启状态。
 */
export function getDebugMode(): boolean {
  return localStorage.getItem('debug') !== null;
}

/**
 * 初始化调试器。
 */
export function initDebugger(): void {
  if (getDebugMode()) { // 需要开启
    vConsole = new VConsole();
    localStorage.setItem('debug', 'true');
  } else { // 需要关闭
    vConsole?.destroy();
    vConsole = undefined;
    localStorage.removeItem('debug');
  }
}

/**
 * 获取调试模式开启状态。
 * @param enable 是否开启
 */
export function setDebugMode(enable: boolean): void {
  if (enable === getDebugMode()) return; // 已处于目标状态
  if (enable) localStorage.setItem('debug', 'true');
  else localStorage.removeItem('debug');
  initDebugger();
  useMainStore().$patch({
    needReload: true,
  });
}
