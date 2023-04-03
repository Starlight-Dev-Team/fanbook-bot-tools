<script lang="tsx" setup>
import { Bot } from '@starlight-dev-team/fanbook-api-sdk';
import type {
  FanbookApiError,
} from '@starlight-dev-team/fanbook-api-sdk/dist/util';

import { createTask } from '~~/utils/task';

import type { SelectedChat } from '~~/components/chat-selector.vue';

import useAccountStore from '~~/stores/account';

import {
  Alert,
  Button,
  Form,
  FormItem,
  Message,
  Modal,
  Space,
  Spin,
  Step,
  Steps,
  Switch,
  Progress,
  Textarea,
  TypographyText,
  TypographyParagraph,
  List,
  ListItem,
} from '@arco-design/web-vue';
import type { FieldRule } from '@arco-design/web-vue';
import { use } from 'h3';
import { fail } from 'assert';

definePageMeta({
  title: '发送消息',
  requiredAuth: true,
});

interface Input {
  targets: Array<SelectedChat>;
  content: string;
  sendAsOneByOne: boolean;
}
const input = reactive({
  targets: [],
  content: '',
  sendAsOneByOne: false,
} as Input);

const REQUEIRE_RULE: FieldRule = {
  required: true,
  message: '本项必填',
};

type Status = 'default' | 'loading';
const status = ref('default' as Status);

const bot = new Bot(useAccountStore().activeBotToken as string);

const messageDescription = ref('');

/**
 * 询问用户是否确定发送**非纯文本内容**。
 * @returns 是否确定
 */
function warnNonPlain(): Promise<boolean> {
  return new Promise((resolve) => {
    Modal.info({
      title: '内容格式提示',
      content: () => (<div>
        消息内容解析为
        <TypographyText bold>非纯文本</TypographyText>
        ！
      </div>),
      hideCancel: false,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

function warnSendAsOneByOne() {
  return new Promise((resolve) => {
    Modal.warning({
      title: '确认发送',
      content: () => (<div>
        消息将会
        <TypographyText bold>私信</TypographyText>
        发送给所选频道的
        <TypographyText bold>所有成员</TypographyText>
        。
        <br />
        请确认操作！
      </div>),
      maskClosable: false,
      hideCancel: false,
      okText: '确认操作',
      okButtonProps: {
        status: 'danger',
      },
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
}

const fetched = ref(0); // 获取到的成员数量
const done = ref(false); // 是否结束
const percent = ref(0); // 进度
/**
 * 发送消息。
 * @param chat 目标聊天
 */
async function send(chat: bigint) {
  return await bot.sendMessage({
    chat,
    text: input.content,
    description: messageDescription.value,
  });
}
/**
 * 获取所选的频道中的用户。
 * @returns 用户 Map
 */
async function getUsers(): Promise<bigint[] | void> {
  const users = new Map<bigint, null>();
  // 分页大小
  const step = 20;
  for (let i = 0; i < input.targets.length; ++i) {
    if (done.value) return;
    const { guild, chat } = input.targets[i];
    if (!guild) continue; // 非频道，不处理
    let start = 1, end = step, now: bigint[];
    // 累计获取为空次数
    let lastUser: bigint = 0n;
    // 退出循环条件：本次轮询中出现了重复值
    // 原理：如果超出范围，服务器不会报错，会返回最近的长度相同的范围，也就是会取到一批重复的值
    while (true) {
      now = await bot.getChannelMembers({ guild, channel: chat, range: {
        start,
        end,
      }});
      // 已经重复，视为超出范围，退出循环
      if (now.length && now[now.length - 1] === lastUser) {
        break;
      }
      // 逐个放入用户表，Map 会自动去重
      for (const item of now) {
        users.set(item, null);
      }
      fetched.value += now.length;
      // 下一页
      lastUser = now[now.length - 1];
      start += step;
      end += step;
    }
  }
  const result: bigint[] = [];
  for (const [ item ] of users) { // 取出所有用户
    result.push(item);
  }
  return result;
}
const finished = ref(0);
const failed = ref(0);
const total = ref(0);
watch([finished, failed, total], (value) => {
  percent.value = Math.round((value[0] + value[1]) / value[2] * 100) / 100;
  done.value = percent.value === 1;
});
async function sendAsOneByOne() {
  const currentStep = ref(1);
  const status = ref('process' as 'error' | 'finish' | 'process');
  function onCancel() {
    done.value = true;
    status.value = 'error';
    modal.close();
    Message.success({
      content: '操作已手动中断',
    });
  }
  const modal = Modal.open({
    title: '正在处理',
    content: () => (<>
      <Steps current={currentStep.value} status={status.value}>
        <Step>
          获取成员列表
        </Step>
        <Step>发送消息</Step>
      </Steps>
      {currentStep.value === 2 && (<Progress
        style={{
          display: 'flex',
          marginTop: '12px',
          justifyContent: 'center',
        }}
        type='circle'
        size='large'
        status={status.value === 'error' ? 'danger' : undefined}
        percent={percent.value}
      />)}
      {currentStep.value === 1 ? (<TypographyParagraph style={{
        marginTop: '12px',
      }}>
        已取到{fetched.value}个成员信息……
      </TypographyParagraph>) : (<TypographyParagraph>
        进度：{finished.value + failed.value} / {total.value} ({failed.value} 失败)
      </TypographyParagraph>)}
      <TypographyParagraph>
        请勿更换网络或关闭标签页。
      </TypographyParagraph>
    </>),
    footer: () => (<Space>
      <Button type='secondary' onClick={onCancel}>取消</Button>
      <Button
        type='primary'
        disabled={!done.value}
        onClick={modal.close}
      >确定</Button>
    </Space>),
    onCancel, 
  });
  try {
    /** 存在则标记为 `null`。 */
    const users = await getUsers();
    if (!users) return; // 操作取消
    currentStep.value = 2;
    total.value = users.length;
    /** 用户 ID 对应聊天 ID、消息 ID。 */
    const history = new Map<bigint, {
      chat: bigint;
      message: bigint;
    }>();
    const task = createTask('逐个通知成员', total.value, async(ctx) => { // 执行
      console.log(status.value);
      if (status.value === 'error') { // 手动终止
        throw new Error('Operation cancelled');
      }
      try { // 单次错误保护
        const user = users[ctx.step - 1];
        const chat = await bot.getPrivateChat({ target: user });
        const message = await send(chat);
        history.set(user, {
          chat,
          message,
        });
      } catch {
        ++failed.value;
      }
    }, (ctx) => { // 回滚
      console.log('revert start', history, users);
      const record = history.get(users[ctx.step]);
      console.log('revert step', history, users);
      if (!record) return; // 未发送成功
      bot.deleteMessage({ // 回滚操作已有异常保护
        chat: record.chat,
        message: record.message,
      });
    }, {});
    task.event.on('stepped', () => { // 进度同步
      ++finished.value;
    });
    task.event.on('before-rollback', () => {
      task.pause();
      finished.value = 0;
      const revertModal = Modal.info({
        title: '正在撤回消息',
        content: () => (<TypographyParagraph>
          正在尝试撤回 { finished.value - failed.value } 条消息。
        </TypographyParagraph>),
      });
      task.event.on('rolled-back', () => {
        revertModal.close();
      });
    });
    task.start();
    await (new Promise((resolve) => { // 等待任务执行完成
      task.event.on('done', resolve);
      task.event.on('before-rollback', resolve);
    }));
    status.value = 'finish';
    done.value = true;
  } catch (err) {
    status.value = 'error';
    console.error(err);
    Modal.error({
      title: '错误',
      content: String(err),
    });
  }
}

/** 错误转为错误信息。 */
function errorToMessage(error: unknown): string {
  let message = String(error);
  if (error instanceof Error &&
      error.message === 'Failed to call Fanbook OpenAPI') {
    const data = ((error as FanbookApiError).response as any).data;
    switch (data.error_code) {
      case 0:
        message = '此机器人不支持发送消息';
      case 1012:
        message = '无权限发送此消息';
      case 1038:
        message = '机器人已被目标用户屏蔽';
    }
  }
  return message;
}
async function onSubmit() {
  let targets = input.targets;
  let json = undefined;
  messageDescription.value = input.content;
  try { // 判断是否非纯文本
    json = JSON.parse(input.content);
    if (typeof json !== 'object') json = undefined; // 富文本一定是 Object 类型
  } catch {}
  if (json !== undefined) { // 非纯文本
    if (!await warnNonPlain()) return; // 用户取消操作
    messageDescription.value = json.title; // 设置简介为富文本标题
  }
  if (input.sendAsOneByOne) {
    if(!await warnSendAsOneByOne()) return;
    await sendAsOneByOne();
    return;
  }
  status.value = 'loading';
  const info: bigint[] = [];
  const errors: unknown[] = [];
  for (const chat of targets) { // 逐个发送
    try {
      info.push(await send(chat.chat));
    } catch (err) {
      errors.push(err);
    }
  }
  const single = targets.length === 1;
  if (!info.length) {
    Modal.error({
      title: '发送失败',
      content: () => (<div>
        {
          single ?
          (<TypographyParagraph>{ errorToMessage(errors[0]) }</TypographyParagraph>) :
          (<TypographyParagraph>{ errors } 条消息全部发送失败！</TypographyParagraph>)
        }
      </div>),
    });
  } else {
    Modal.success({
      title: '发送成功' + (single ? '' : ` ${info.length}/${targets.length}`),
      content: () => (single ?
        (<TypographyParagraph>消息 ID ：{info[0]}</TypographyParagraph>) :
        (<div>
          <TypographyParagraph>消息 ID 列表：</TypographyParagraph>
          <List data={info} v-slots={{
            item: (item: { index: number; item: bigint }) => (
              <ListItem>{item.item}</ListItem>
            )}}
          />
        </div>)
      ),
    });
  }
  status.value = 'default';
}
</script>

<template>
  <div class='notification'>
    <Alert type='info' closable>
      根据 Fanbook 最新规定，发送消息需要
      <AppLink to='https://wenjuan.feishu.cn/m/cfm?t=sSXCQ3hM0HKi-iuth' icon>
        申请白名单
      </AppLink>
      。
    </Alert>
  </div>
  <Spin class='form-wrapper' :loading='status === "loading"' tip='正在执行'>
    <Form
      class='form'
      :model='input'
      :disabled='status === "loading"'
      auto-label-width
      @submit-success='onSubmit'
    >
      <FormItem label='消息接收者' field='targets' :rules='REQUEIRE_RULE'>
        <ChatSelector v-model='input.targets' />
      </FormItem>
      <FormItem label='消息内容' field='content' :rules='REQUEIRE_RULE'>
        <Textarea v-model='input.content' allow-clear :auto-size='{
          minRows: 5,
        }' :max-length='10240' />
      </FormItem>
      <FormItem label='逐个通知成员' field='sendAsOneByOne' tooltip='类似服务器管家的“私信”功能'>
        <Switch v-model='input.sendAsOneByOne' />
      </FormItem>
      <FormItem class='operations'>
        <Button type='primary' html-type='submit'>
          发送消息
        </Button>
      </FormItem>
    </Form>
  </Spin>
</template>

<style scoped>
.notification:has(*) {
  margin-bottom: 12px;
}
.form-wrapper {
  display: block;
  width: 70%;
  margin: 0 auto;
}
body.mobile .form-wrapper {
  width: 90vw;
}
.form {
  width: 100%;
}
.operations {
  margin-top: 4px;
}
</style>
