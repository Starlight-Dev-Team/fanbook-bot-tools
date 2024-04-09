import { Bot } from '@starlight-dev-team/fanbook-api-sdk';

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
  '参数错误，请检查消息是否有特殊内容' = 1001,
  '机器人没有在该服务器，请先添加' = 1008,
  '服务器不存在' = 1011,
  '没有权限' = 1012,
  '频道不存在' = 1021,
  '用户已关闭私信' = 1037,
  '机器人已被用户屏蔽' = 1038,
  '机器人不在发消息 API 白名单中' = 10002,
};
