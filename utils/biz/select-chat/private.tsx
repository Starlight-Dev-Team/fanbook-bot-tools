import { ref } from 'vue';

import {
  Button,
  FormItem,
  Input,
  Modal,
  Space,
} from '@arco-design/web-vue';

import type { Bot } from '@starlight-dev-team/fanbook-api-sdk';

import { tryBigintify } from '~~/utils/util';

import type { InputStatus } from './util';

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
    const guildId = ref(disabledInputGuild ? String(defaultGuildId) : '');
    const guildIdStatus = ref(undefined as InputStatus);
    const userShortId = ref('');
    const userShortIdStatus = ref(undefined as InputStatus);
    const result = ref(undefined as bigint | undefined);
    async function onInputChange(): Promise<void> {
      const guild = tryBigintify(guildId.value);
      if (guild === undefined) { // 服务器 ID 格式错误
        guildIdStatus.value = 'error';
        userShortIdStatus.value = undefined; // 服务器 ID 错误时不检测目标用户
        return;
      }
      const short = Number(userShortId.value);
      if (Number.isNaN(short)) { // 目标用户格式错误
        userShortIdStatus.value = 'error';
        return;
      }
      // 请求时显示为加载中
      guildIdStatus.value = undefined;
      userShortIdStatus.value = 'validating';
      let user: bigint;
      try { // 尝试获取用户 ID
        user = await bot.getUserByShortId({ guild, id: short });
      } catch { // 获取用户 ID 失败
        userShortIdStatus.value = 'error';
        return;
      }
      try { // 尝试获取私聊 ID
        result.value = await bot.getPrivateChat({ target: user });
      } catch { // 获取私聊 ID 失败
        userShortIdStatus.value = 'error';
        return;
      }
      // 一切正常
      userShortIdStatus.value = guildIdStatus.value = 'success';
    }
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
        {!disabledInputGuild && (<FormItem
          field='?'
          label='所在服务器 ID'
          help={guildIdStatus.value === 'error' ? '服务器 ID 无效' : undefined}
          validateStatus={guildIdStatus.value}
          feedback
        >
          <Input
            v-model={guildId.value}
            onChange={onInputChange}
          />
        </FormItem>)}
        <FormItem
          field='?'
          label='目标用户'
          help={userShortIdStatus.value === 'error' ? '无效的目标用户' : undefined}
          validateStatus={userShortIdStatus.value}
          feedback
        >
          <Input
            v-model={userShortId.value}
            v-slots={{ prefix: () => '#' }}
            onChange={onInputChange}
          />
        </FormItem>
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
