/**
 * 服务配置相关通用工具。
 */

import type { Profile } from '@starlight-dev-team/fanbook-api-sdk/dist/types';

export interface Config {
  /** 鉴权配置。 */
  auth?: {
    /** 鉴权结果缓存失效时间（毫秒）。 */
    maxAge: number;
    /** 获取鉴权结果。 */
    isAuthorized: () => boolean | Promise<boolean>;
    /** 获取用户资料。 */
    getProfile: () => Profile | Promise<Profile>;
    /**
     * 鉴权失败后跳转逻辑。
     */
    redirect: () => void | Promise<void>;
    /**
     * 鉴权请求逻辑。
     * @returns 异步获取的令牌
     */
    requestAuth: () => Promise<string>;
  };
}

export const defaultServiceConfig: Config = {};

export function defineServiceConfig(source: Partial<Config>): Config {
  return {
    ...defaultServiceConfig,
    ...source,
  };
}
