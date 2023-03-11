import {
  Doption,
  Dropdown,
  Modal,
} from '@arco-design/web-vue';
import { IconMindMapping, IconUser } from '@arco-design/web-vue/es/icon';

import type {
  ChannelType,
} from '@starlight-dev-team/fanbook-api-sdk/dist/interface';

import { ChatType, CHAT_TYPE_ALL } from './util';

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
      content: () => (<>
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
      </>),
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
