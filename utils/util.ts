import type { FieldRule } from '@arco-design/web-vue';

/** logo 图片链接。 */
export const LOGO_URL = 'https://fb-cdn.fanbook.mobi/fanbook/app/files/chatroom/image/8af6a892e4143284cac9f719e99ee0a9.png';

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
/** 服务器 ID 校验规则。 */
export const FORM_GUILD_RULE: FieldRule = {
  validator(v, cb) {
    if (typeof v !== 'bigint') cb('错误的服务器 ID');
    else if (v.toString().length !== 18) cb('错误的服务器 ID');
    else cb(undefined);
  },
  message: '错误的服务器 ID',
};

/**
 * 去除 `T` 的必选属性，然后把 `T` 的可选属性变为必选。
 */
export type DefaultConfig<T extends object> =
  Required<Pick<T, keyof T>> & Omit<T, keyof T>;
