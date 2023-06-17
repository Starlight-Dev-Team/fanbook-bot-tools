import { Bot } from '@starlight-dev-team/fanbook-api-sdk';
import type { GuildCredit } from '@starlight-dev-team/fanbook-api-sdk/dist/types';

import useAccountStore from '~~/stores/account';

let currentBot: Bot | undefined;
export function getCurrentBot(): Bot {
  const token = useAccountStore().activeBotToken;
  if (!currentBot) {
    if (!token) { // 无机器人
      console.warn('No active bot given');
      return new Bot('0'); // 兜底方案
    }
    currentBot = new Bot(token);
  }
  return currentBot;
}

/** 机器人 API 错误码信息。 */
export enum BotErrorCode {
  '没有权限' = 1012,
  '用户已关闭私信' = 1037,
  '机器人已被用户屏蔽' = 1038,
};

export const DEFAULT_CREDIT: GuildCredit = {
  id: crypto.randomUUID(),
  authority: {
    icon: 'https://fb-cdn.fanbook.mobi/fanbook/app/files/chatroom/image/8af6a892e4143284cac9f719e99ee0a9.png',
    name: '机器人工具',
  },
  title: {
    icon: 'https://fb-cdn.fanbook.mobi/fanbook/app/files/chatroom/image/8af6a892e4143284cac9f719e99ee0a9.png',
  },
  slots: [[{
    image: 'https://fb-cdn.fanbook.mobi/fanbook/app/files/chatroom/image/b7986a4941f3e49866b30fd2cc8f413e.png',
    value: 'Hello, World!',
  }]],
};
