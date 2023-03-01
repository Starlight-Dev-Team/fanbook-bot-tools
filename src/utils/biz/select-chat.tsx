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
  ModalReturn,
  TableColumnData,
  TableData,
} from '@arco-design/web-vue';
import { IconMindMapping, IconUser } from '@arco-design/web-vue/es/icon';

import type { Bot } from '@starlight-dev-team/fanbook-api-sdk';
import {
  ChannelType,
} from '@starlight-dev-team/fanbook-api-sdk/dist/interface';

/** 支持的聊天类型。 */
export enum ChatType {
  /** 私聊。 */
  'PRIVATE' = 0x1,
  /** 服务器频道。 */
  'CHANNEL' = 0x2,
  'ALL' = ChatType.PRIVATE | ChatType.CHANNEL,
}

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
  if (types === undefined) types = ChatType.ALL;
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

export interface SelectChatConfig {
  /** 操作者机器人。 */
  bot: Bot;
  /**
   * 弹窗标题。
   *
   * 默认值：`'选择频道'`。
   */
  title?: string;
  /**
   * 服务器 ID 。
   *
   * `allowInputGuild` 为假时必填。
   */
  guild?: bigint;
  /**
   * 是否允许输入服务器 ID 。
   *
   * 默认值：`true`。
   */
  allowInputGuild?: boolean;
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
export function selectChat(config: SelectChatConfig): Promise<{
  /** 选择的聊天 ID 。 */
  chat: bigint[];
}> {
  let {
    title,
    guild,
    allowInputGuild,
    max,
    min,
    chatType,
    supportChatType,
    channelType,
  } = config;
  if (allowInputGuild === undefined) allowInputGuild = true;
  if (title === undefined) title = '选择频道';
  if (max === undefined || max < 0) max = 1;
  if (min === undefined || min < 0 || min > max) min = max;
  if (channelType === undefined) channelType = ChannelType.TEXT_CHANNEL;
  return new Promise((reslove) => {
    function select(): void {
      const tableCol: TableColumnData[] = [{
        title: '标题',
        dataIndex: 'title',
      }];
      const tableData = ref([] as TableData[]);
      const status = ref('empty' as 'empty' | 'default' | 'error' | 'loading');
      const guildId = ref(String(guild ?? ''));
      const selected = ref([] as string[]);
      function onGuildChange(value: string): void {
        try {
          // 空值，显示错误
          if (!value) throw new Error('');
          // 尝试转为 BigInt
          BigInt(value);
          status.value = 'loading';
          // 获取频道列表
          config.bot.getGuildChannels(
            BigInt(guildId.value),
          ).then((res) => {
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
            status.value = 'default';
          }).catch(() => {
            // 获取失败
            status.value = 'error';
          });
        } catch (err) {
          // 无法转为 BigInt
          status.value = 'error';
        }
      }
      function onOk(): void {
        const chat: bigint[] = [];
        for (const item of selected.value) chat.push(BigInt(item));
        modal.close();
        reslove({ chat });
      }
      function onCancel(): void {
        modal.close();
        reslove({ chat: [] });
      }
      const selectChannel = (): ModalReturn => Modal.open({
        title,
        content: () => (<Fragment>
          {allowInputGuild && (<FormItem
            field='?'
            label='服务器 ID'
            help={status.value === 'error' ? '错误的服务器 ID' : undefined}
            validateStatus={status.value === 'error' ? 'error' : undefined}
          >
            <Input
              v-model={guildId.value}
              onChange={onGuildChange}
            />
          </FormItem>)}
          <Table
            columns={tableCol}
            data={status.value === 'default' ? tableData.value : []}
            loading={status.value === 'loading'}
            rowSelection={{
              type: max === 1 ? 'radio' : 'checkbox',
              fixed: true,
            }}
            pagination={{
              pageSize: 5,
            }}
            selectedKeys={selected.value}
            onSelect={(v) => { selected.value = v as string[]; }}
          />
        </Fragment>),
        footer: () => (<Space>
          {
            min &&
            (<Button type='secondary' onClick={onCancel}>取消</Button>)
          }
          <Button
            type='primary'
            disabled={!selected.value.length}
            onClick={onOk}
          >确定</Button>
        </Space>),
      });
      let modal: ModalReturn;
      switch (supportChatType) {
        case ChatType.CHANNEL:
          modal = selectChannel();
          break;
        default:
          reslove({ chat: [] });
      }
    };
    if (!Object.values(ChatType).includes(chatType as ChatType)) { // 未提供唯一聊天类型
      selectChatType({ // 需要选择
        disabledCancel: !!min,
        types: supportChatType,
      }).then((v) => {
        supportChatType = v; // 保存结果
        select();
      });
    } else { // 已是唯一聊天类型
      select();
    }
  });
}

export default selectChat;
