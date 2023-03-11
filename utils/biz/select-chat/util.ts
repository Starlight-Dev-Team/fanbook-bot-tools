/** 支持选择的聊天类型。 */
export enum ChatType {
  /** 私聊。 */
  'PRIVATE' = 0x1,
  /** 服务器频道。 */
  'CHANNEL' = 0x2,
}
/** 所有支持的聊天类型。 */
export const CHAT_TYPE_ALL = ChatType.PRIVATE | ChatType.CHANNEL;

/** 输入框校验状态。 */
export type InputStatus =
  | 'error'
  | 'success'
  | 'warning'
  | 'validating'
  | undefined;
