import {
  ChannelType,
} from '@starlight-dev-team/fanbook-api-sdk/dist/interface';
import type { Bot } from '@starlight-dev-team/fanbook-api-sdk';

import { selectChatType } from './select-chat/type';
import { selectPrivateChat } from './select-chat/private';
import { selectChannel } from './select-chat/channel';

import { ChatType, CHAT_TYPE_ALL } from './select-chat/util';

export interface SelectChatConfig {
  /** 操作者机器人。 */
  bot: Bot;
  /**
   * 弹窗标题。
   */
  title?: string;
  /**
   * 最大选取数量。
   *
   * 为`1`时显示单选框，否则显示多选框。
   */
  max?: number;
  /**
   * 最大选取数量。
   *
   * 默认值：`max`。
   */
  min?: number;
  /**
   * 聊天类型。
   */
  chatType?: ChatType;
  /**
   * 允许选择的聊天类型。
   *
   * 为空时不显示选择弹窗。
   */
  supportChatType?: ChatType;
  /**
   * 允许选择的频道类型。
   *
   * 默认值：`ChannelType.TEXT_CHANNEL`。
   *
   * `chatType & ChatType.CHANNEL` 或 `selectChatType & ChatType.CHANNEL` 为真时有效。
   */
  channelType?: ChannelType;
}

export interface SelectChatResponse {
  type?: ChatType;
  guild?: bigint;
  chat: bigint[];
}

/**
 * 选择聊天。
 * @returns 选项信息
 */
export async function selectChat(
  config: SelectChatConfig,
): Promise<SelectChatResponse> {
  let {
    title,
    max,
    min,
    chatType,
    supportChatType,
    channelType,
  } = config;
  if (max === undefined || max < 0) max = 1;
  if (min === undefined || min < 0 || min > max) min = max;
  if (channelType === undefined) channelType = ChannelType.TEXT_CHANNEL;
  if (supportChatType === undefined) supportChatType = CHAT_TYPE_ALL;
  if (!Object.values(ChatType).includes(chatType as ChatType)) { // 未提供唯一聊天类型
    chatType = await selectChatType({ // 需要选择
      disabledCancel: !!min,
      types: supportChatType,
    });
  }
  switch (chatType) {
    case ChatType.CHANNEL: {
      const res = await selectChannel({
        bot: config.bot,
        title,
        max,
        min,
        channelType,
      });
      return {
        type: ChatType.CHANNEL,
        guild: res.guild,
        chat: res.channel,
      };
    }
    case ChatType.PRIVATE: {
      const res = await selectPrivateChat({
        bot: config.bot,
        title,
      });
      return {
        type: ChatType.PRIVATE,
        chat: res.chat ? [res.chat] : [],
      };
    }
    default:
      return { chat: [] };
  }
}
