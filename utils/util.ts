import { openDB } from 'idb';

import type { FieldRule } from '@arco-design/web-vue';

/**
 * 尝试转换为 BigInt 。
 * @param value 需要转换的值
 * @returns 成功返回结果，失败返回 `undefined` 。
 */
export function tryBigintify(value: string): bigint | undefined {
  try {
    // 空值，错误
    if (!value) throw new Error('');
    // 尝试转为 BigInt
    return BigInt(value);
  } catch {
    return undefined;
  }
}

/** 必填项校验规则。 */
export const FORM_REQUIRE_RULE: FieldRule = {
  required: true,
  message: '本项必填',
};
