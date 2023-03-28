import process from 'process';

import type { Profile, Session } from '@starlight-dev-team/fanbook-api-sdk/dist/types';

import { defineServiceConfig } from '~~/utils/config';
import type { Config } from '~~/utils/config';

type EnvType =
  | 'prod' // 正式环境
  | 'pre'; // 灰度环境

const configs: Record<EnvType, Config> = {
  prod: defineServiceConfig({}),
  pre: defineServiceConfig({
    auth: {
      maxAge: 5 * 60 * 1000, // 5 min
      async isAuthorized() {
        try {
          await configs.pre.auth?.getProfile();
          return true;
        } catch {
          return false;
        }
      },
      async getProfile() {
        const token = useCookie('token').value;
        if (!token) throw new Error('No token given');
        const req = await useFetch('https://gubfpx.laf.dev/profile', {
          method: 'post',
          body: {
            token,
          },
          mode: 'cors',
        });
        const data = toRaw(req.data.value as any);
        if (data.error === true) { // 请求返回错误
          throw new Error(data.reason ?? 'Request failed');
        }
        return data as Profile;
      },
      async redirect() {
        await navigateTo('https://a1.fanbook.mobi/open/oauth2/authorize?response_type=code&client_id=474159040155488256', {
          external: true,
        });
      },
      async requestAuth() {
        if (useRoute().query.code === undefined) {
          throw new Error('No given code');
        }
        const req = await useFetch('https://gubfpx.laf.dev/token', {
          method: 'post',
          body: {
            code: useRoute().query.code,
          },
          mode: 'cors',
        });
        const data = toRaw(req.data.value as any);
        if (req.error.value) throw new Error('Remote failed');
        const session = data as Session;
        useCookie('token').value = session.accessToken;
        return session.accessToken;
      },
    },
  }),
};

const env = (() => {
  let result = process.env.START_ENV;
  if (!result || Reflect.has(configs, result)) { // 环境配置不存在
    result = 'pre'; // 默认正式环境
  }
  return result as EnvType;
})();

export const useServiceConfig = () => configs[env];
