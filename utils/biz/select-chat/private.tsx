import { ref } from 'vue';

import {
  Button,
  Modal,
  Space,
} from '@arco-design/web-vue';

import type { Bot } from '@starlight-dev-team/fanbook-api-sdk';

import type { InputStatus } from './util';

import UserInputForm from '~~/components/user-input-form.vue';
import GuildInputForm from '~~/components/guild-input-form.vue';

export interface SelectPrivateChatConfig {
  /** 操作者机器人。 */
  bot: Bot;
  /**
   * 弹窗标题。
   *
   * 默认 `'选择私聊'` 。
   */
  title?: string;
  /**
   * 是否必须选择。
   *
   * 默认 `false` 。
   */
  disabledCancel?: boolean;
  /** 是否允许输入服务器 ID 。 */
  disabledInputGuild?: boolean;
  /**
   * 默认的服务器 ID 。
   *
   * `disabledInputGuild` 为 `true` 时必填。
   */
  defaultGuildId?: bigint;
}

/**
 * 选择私聊。
 * @param config 配置
 * @returns 聊天 ID
 */
export function selectPrivateChat(
  config: SelectPrivateChatConfig,
): Promise<{ chat?: bigint; }> {
  let {
    bot,
    title,
    disabledCancel,
    disabledInputGuild,
    defaultGuildId,
  } = config;
  if (title === undefined) title = '选择私聊';
  return new Promise((reslove) => {
    const guildId = ref(disabledInputGuild ? defaultGuildId : undefined);
    const guildIdStatus = ref(undefined as InputStatus);
    const userId = ref(undefined as bigint | undefined);
    const result = ref(undefined as bigint | undefined);
    async function onInputChange(): Promise<void> {
      const guild = guildId.value;
      if (guild === undefined) { // 服务器 ID 格式错误
        guildIdStatus.value = 'error';
        return;
      }
      guildIdStatus.value = undefined;
      try { // 尝试获取私聊 ID
        result.value = await bot.getPrivateChat({
          target: userId.value as bigint,
        });
      } catch { // 获取私聊 ID 失败
        return;
      }
      // 一切正常
      guildIdStatus.value = 'success';
    }
    watch([guildId, userId], onInputChange);
    function onCancel(): void {
      modal.close();
      reslove({ chat: undefined });
    }
    function onOk(): void {
      modal.close();
      reslove({ chat: result.value });
    }
    const modal = Modal.open({
      title,
      content: () => (<>
        {!disabledInputGuild && (
          <GuildInputForm
            v-model={guildId.value}
            field='?'
            required
          />
        )}
        <UserInputForm
          v-model={userId.value}
          guild={guildId.value}
          field='?'
          required
        />
      </>),
      footer: () => (<Space>
        {
          !disabledCancel &&
          (<Button
            type='secondary'
            onClick={onCancel}>
          取消</Button>)
        }
        <Button
          type='primary'
          disabled={!result.value}
          onClick={onOk}
        >确定</Button>
      </Space>),
    });
  });
}
