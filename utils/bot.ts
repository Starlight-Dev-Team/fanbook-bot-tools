import { Bot } from '@starlight-dev-team/fanbook-api-sdk';

import useAccountStore from '~~/stores/account';

class UnauthorizedError extends Error {
  constructor() {
    super('No active bot given');
  }
}

let currentBot: Bot | undefined;
export function getCurrentBot(): Bot {
  const token = useAccountStore().activeBotToken;
  if (!currentBot) {
    if (!token) throw new UnauthorizedError();
    currentBot = new Bot(token);
  }
  return currentBot;
}
