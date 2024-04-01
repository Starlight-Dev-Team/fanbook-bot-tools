import Dexie from 'dexie';

const [db, SUPPORT_DRAFT] = (() => { // 特殊处理 `Dexie.MissingAPIError` 异常
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
export { SUPPORT_DRAFT };
/**
 * 获取草稿内容。
 * @param key 草稿键
 */
export async function getDraft(key: string): Promise<unknown> {
  if (!db) return; // 在例如edge上会未定义，如果 db 未定义，直接返回
  return (await db.table('draft').get(key))?.value;
}
/**
 * 设置草稿内容。
 * @param key 草稿键
 * @param value 草稿内容
 */
export async function setDraft(key: string, value: unknown) {
  if (!db) return;
  await db.table('draft').put({ key, value }, key);
}
