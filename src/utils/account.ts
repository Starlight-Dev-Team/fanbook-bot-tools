import { useAccountStore } from '@/stores/account';

/**
 * 机器人令牌正则表达式。
 */
export const BOT_TOKEN_REGEXP = /[0-9a-f]{96}/g;
/**
 * 检测机器人令牌是否有效。
 * @param token 机器人令牌
 * @returns 令牌是否有效
 */
export function isBotTokenValid(token: string): boolean {
  // 重新构造一个 RegExp ，否则结果会有错误
  const regexp = new RegExp(BOT_TOKEN_REGEXP, BOT_TOKEN_REGEXP.flags);
  return regexp.test(token);
}
/**
 * 获取机器人列表。
 * @returns 机器人令牌列表
 */
export function getBots(): string[] {
  let result: string[] = [];
  try {
    result = JSON.parse(localStorage.getItem('bots') ?? '[]');
  } catch (err) {
    localStorage.setItem('bots', '[]');
  }
  return result;
}
/**
 * 覆盖机器人列表。
 * @param tokens 机器人令牌列表
 */
export function setBots(tokens: string[]): void {
  const newTokens: string[] = [];
  for (const token of tokens) {
    // 格式正确且不重复
    if (isBotTokenValid(token) && !newTokens.includes(token)) {
      newTokens.push(token);
    }
  }
  useAccountStore().botTokens = newTokens;
  localStorage.setItem('bots', JSON.stringify(newTokens));
}
/**
 * 添加机器人。
 * @param token 机器人令牌
 */
export function addBot(token: string): void {
  setBots(getBots().concat(token));
  useAccountStore().$patch({
    activeBotToken: token,
  });
}
/**
 * 移除机器人
 * @param token 机器人令牌
 */
export function removeBot(token: string): void {
  setBots(getBots().filter((value) => value !== token));
  const bots = getBots();
  const store = useAccountStore();
  // 全部机器人都已移除
  if (!bots.length || !store.activeBotToken) {
    store.$patch({
      activeBotToken: undefined,
    });
    return;
  }
  // 当前机器人已退出
  if (!bots.includes(store.activeBotToken)) {
    const token = store.botTokens[0];
    store.$patch({
      activeBotToken: token,
    });
  }
}
/**
 * 检测是否有指定机器人。
 * @param token 机器人令牌
 * @returns 是否有机器人
 */
export function hasBot(token: string): boolean {
  return getBots().includes(token);
}
