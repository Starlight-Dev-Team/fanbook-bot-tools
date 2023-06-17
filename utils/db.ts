import Dexie from 'dexie';

const [db, SUPPORT_DB] = (() => { // 特殊处理 `Dexie.MissingAPIError` 异常
  try {
    const db = new Dexie('fb-mgr');
    db.version(1).stores({
      draft: '&key,value',
    });
    return [db, true] as const;
  } catch (e) {
    if (e instanceof Dexie.MissingAPIError) return [undefined, false] as const;
    else throw e;
  }
})();
export { SUPPORT_DB };

/**
 * 获取草稿内容。
 * @param key 草稿键
 */
export async function getDraft(key: string): Promise<unknown> {
  if (!db) return;
  return (await db.table('draft').get(key))?.value;
}
/**
 * 设置草稿内容。
 * @param key 草稿键
 * @param value 草稿内容
 */
export async function setDraft(key: string, value: Record<string, unknown>) {
  if (!db) return;
  // 过滤以 `_` 开头的键
  const entries = Object.entries(value).filter(([k]) => !k.startsWith('_'));
  await db.table('draft').put({
    key,
    value: Object.fromEntries(entries),
  }, key);
}
