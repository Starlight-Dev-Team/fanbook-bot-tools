import { ref } from 'vue';

import {
  Button,
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

import type {
  ChannelType,
} from '@starlight-dev-team/fanbook-api-sdk/dist/interface';
import type { Bot } from '@starlight-dev-team/fanbook-api-sdk';

import { tryBigintify } from '~~/utils/util';

import type { ChatType, InputStatus } from './util';

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

/**
 * 选择服务器频道。
 * @param config 配置
 * @returns 选择的频道 ID
 */
export function selectChannel(
  config: SelectChannelConfig,
): Promise<{
    guild?: bigint;
    channel: bigint[];
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
        const res = await bot.getGuildChannels({ guild: id });
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
        guildIdStatus.value = 'success';
      } catch { // 获取失败
        guildIdStatus.value = 'error';
      }
    }
    function onOk(): void {
      const chat: bigint[] = [];
      for (const item of result.value) chat.push(BigInt(item));
      modal.close();
      reslove({
        guild: BigInt(guildId.value),
        channel: chat,
      });
    }
    function onCancel(): void {
      modal.close();
      reslove({
        channel: [],
      });
    }
    const modal = Modal.open({
      title,
      content: () => (<>
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
      </>),
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
