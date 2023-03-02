import { Fragment, ref } from 'vue';

import {
  Button,
  Doption,
  Dropdown,
  FormItem,
  Input,
  Modal,
  Space,
  Table,
} from '@arco-design/web-vue';
import type {
  TableColumnData,
  TableData,
} from '@arco-design/web-vue';
import { IconMindMapping, IconUser } from '@arco-design/web-vue/es/icon';

import type { Bot } from '@starlight-dev-team/fanbook-api-sdk';
import {
  ChannelType,
} from '@starlight-dev-team/fanbook-api-sdk/dist/interface';

import { tryBigintify } from '../util';

type InputStatus = 'error' | 'success' | 'warning' | 'validating' | undefined;

/** 支持的聊天类型。 */
export enum ChatType {
  /** 私聊。 */
  'PRIVATE' = 0x1,
  /** 服务器频道。 */
  'CHANNEL' = 0x2,
}
export const CHAT_TYPE_ALL = ChatType.PRIVATE | ChatType.CHANNEL;

export interface SelectChatTypeConfig {
  types?: ChannelType | number;
  disabledCancel?: boolean;
}
/**
 * 选择聊天类型。
 * @returns 选择的聊天类型
 */
export function selectChatType(
  config: SelectChatTypeConfig = {},
): Promise<ChatType | undefined> {
  let { types, disabledCancel } = config;
  if (types === undefined) types = CHAT_TYPE_ALL;
  return new Promise((resolve) => {
    function isSupportType(target: keyof typeof ChatType): boolean {
      return !!((types as number) & ChatType[target]);
    }
    function onOk(value: ChatType): void {
      modal.close();
      resolve(value);
    }
    function onCancel(): void {
      modal.close();
      resolve(undefined);
    }
    const modal = Modal.open({
      title: '选择聊天类型',
      content: () => (<Fragment>
        <Dropdown
          defaultPopupVisible={true}
          onSelect={(v) => { onOk(v as ChatType); }}
        >
          {isSupportType('CHANNEL') &&
            (<Doption value={ChatType.CHANNEL} v-slots={{
              icon: () => <IconMindMapping />,
            }}>
              服务器频道
            </Doption>)
          }
          {isSupportType('PRIVATE') &&
            (<Doption value={ChatType.PRIVATE} v-slots={{
              icon: () => <IconUser />,
            }}>
              私聊
            </Doption>)
          }
        </Dropdown>
      </Fragment>),
      closable: !disabledCancel,
      escToClose: !disabledCancel,
      footer: () => (<span />), // 占位元素
      simple: true,
      onClose() {
        onCancel(); // 决策只会生效一次，所以这里不会对调用过 onOk 的情况产生影响
      },
    });
  });
}

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
        user = await bot.getUserByShortId(guild, short);
      } catch { // 获取用户 ID 失败
        userShortIdStatus.value = 'error';
        return;
      }
      try { // 尝试获取私聊 ID
        result.value = await bot.getPrivateChat(user);
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
      content: () => (<Fragment>
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
            v-slots={{ prefix: '#' }}
            onChange={onInputChange}
          />
        </FormItem>
      </Fragment>),
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

export interface SelectChannelConfig {
  /** 操作者机器人。 */
  bot: Bot;
  /**
   * 弹窗标题。
   *
   * 默认值：`'选择服务器频道'`。
   */
  title?: string;
  /**
   * 是否禁止输入服务器 ID 。
   *
   * 默认值：`false`。
   */
  disableInputGuild?: boolean;
  /**
   * 默认的服务器 ID 。
   *
   * `disableInputGuild` 为 `true` 时必填。
   */
  defaultGuildId?: bigint;
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
export function selectChannel(
  config: SelectChannelConfig,
): Promise<{
    chat: bigint[];
  }> {
  let {
    bot,
    title,
    max,
    min,
    disableInputGuild,
    defaultGuildId,
    channelType,
  } = config;
  if (title === undefined) title = '选择服务器频道';
  return new Promise((reslove) => {
    const tableCol: TableColumnData[] = [{
      title: '标题',
      dataIndex: 'title',
    }];
    const tableData = ref([] as TableData[]);
    const guildId = ref(String(defaultGuildId ?? ''));
    const guildIdStatus = ref(undefined as InputStatus);
    const result = ref([] as string[]);
    async function onInputChange(value: string): Promise<void> {
      const id = tryBigintify(value);
      if (id === undefined) {
        guildIdStatus.value = 'error';
        return;
      }
      guildIdStatus.value = 'validating';
      try { // 尝试获取频道列表
        const res = await bot.getGuildChannels(id);
        // 获取成功，放到表中
        tableData.value = [];
        for (const item of res) {
          if (item.type === channelType) { // 过滤不需要的频道
            tableData.value.push({
              key: String(item.uuid),
              title: item.title,
            });
          }
        }
        console.log(tableData);
        guildIdStatus.value = 'success';
      } catch { // 获取失败
        guildIdStatus.value = 'error';
      }
    }
    function onOk(): void {
      const chat: bigint[] = [];
      for (const item of result.value) chat.push(BigInt(item));
      modal.close();
      reslove({ chat });
    }
    function onCancel(): void {
      modal.close();
      reslove({ chat: [] });
    }
    const modal = Modal.open({
      title,
      content: () => (<Fragment>
        {!disableInputGuild && (<FormItem
          field='?'
          label='服务器 ID'
          help={guildIdStatus.value === 'error' ? '错误的服务器 ID' : undefined}
          validateStatus={guildIdStatus.value}
          feedback
        >
          <Input
            v-model={guildId.value}
            onChange={onInputChange}
          />
        </FormItem>)}
        <Table
          columns={tableCol}
          data={guildIdStatus.value === 'success' ? tableData.value : []}
          loading={guildIdStatus.value === 'validating'}
          rowSelection={{
            type: max === 1 ? 'radio' : 'checkbox',
            fixed: true,
          }}
          pagination={{
            pageSize: 5,
          }}
          selectedKeys={result.value}
          onSelect={(v) => result.value = v as string[]}
        />
      </Fragment>),
      footer: () => (<Space>
        {
          !min &&
          (<Button
            type='secondary'
            onClick={onCancel}>
          取消</Button>)
        }
        <Button
          type='primary'
          disabled={!result.value.length}
          onClick={onOk}
        >确定</Button>
      </Space>),
    });
    return result;
  });
}

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

/**
 * 选择聊天。
 * @returns 选项信息
 */
export async function selectChat(config: SelectChatConfig): Promise<{
  /** 选择的聊天 ID 。 */
  chat: bigint[];
}> {
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
    case ChatType.CHANNEL:
      return await selectChannel({
        bot: config.bot,
        title,
        max,
        min,
        channelType,
      });
    case ChatType.PRIVATE: {
      const res = await selectPrivateChat({
        bot: config.bot,
        title,
      });
      return res.chat ? { chat: [res.chat] } : { chat: [] };
    }
    default:
      return { chat: [] };
  }
}
