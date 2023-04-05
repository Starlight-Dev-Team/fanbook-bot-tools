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
