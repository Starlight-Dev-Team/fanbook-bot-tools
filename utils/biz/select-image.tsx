import { type FieldRule, Form, FormItem, Input, Modal, Space, Button } from '@arco-design/web-vue';
import { type FormItemInfo } from '@arco-design/web-vue/es/form/context';

import type { DefaultConfig } from '../util';

export interface SelectImageConfig {
  /**
   * 弹窗标题。
   * @default '选择图片'
   */
  title?: string;
  /**
   * 默认输入的链接。
   * @default ''
   */
  defaultLink?: string;
}

const SELECT_IMAGE_DEFAULT_CONFIG: DefaultConfig<SelectImageConfig> = {
  title: '选择图片',
  defaultLink: '',
};

const RULES: FieldRule[] = [FORM_REQUIRE_RULE, { type: 'url', message: '错误的链接' }];

/**
 * 选择图片。
 * @param config 配置
 * @returns 图片链接，无则为 `undefined`
 */
export function selectImage(
  config: SelectImageConfig,
): Promise<string | undefined> {
  const options = { ...SELECT_IMAGE_DEFAULT_CONFIG, ...config };
  return new Promise((resolve) => {
    const form = ref({ link: options.defaultLink });
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const el = ref({} as FormItemInfo);
    const disableOk = ref(true);
    async function validate() {
      if (await el.value.validate() !== undefined) disableOk.value = true;
      else disableOk.value = false;
    }
    function handleOk() {
      stop();
      close();
      resolve(form.value.link);
    }
    function handleCancel() {
      stop();
      close();
      resolve(undefined);
    }
    const { close } = Modal.open({
      title: options.title,
      content: () => (<Form ref={el} model={form.value} autoLabelWidth>
        <FormItem field='link' label='图片链接' required rules={RULES} validateTrigger='blur' feedback>
          <Input v-model={form.value.link} onBlur={validate} />
        </FormItem>
      </Form>),
      footer: () => (<Space>
        <Button type='primary' disabled={disableOk.value} onClick={handleOk}>确定</Button>
        <Button onClick={handleCancel}>取消</Button>
      </Space>),
      maskClosable: false,
      closable: false,
      escToClose: false,
    });
  });
}
