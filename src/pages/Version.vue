<script lang="ts" setup>
import { onMounted, ref } from 'vue';

import { Form, FormItem, Link, Spin, Tag } from '@arco-design/web-vue';
import {
  IconCheckCircleFill,
  IconQuestionCircleFill,
} from '@arco-design/web-vue/es/icon';

import { getVersionInfo } from '@/utils/system';
import type { VersionInfo } from '@/utils/system';

const version = ref(undefined as VersionInfo | undefined);

onMounted(async () => {
  version.value = await getVersionInfo();
});
</script>

<template>
  <Spin class='form-wrapper' :loading='!version' tip='正在加载'>
    <Form
      v-if='version'
      class='form'
      :model='version'
      :disabled='true'
      auto-label-width
    >
      <FormItem label='版本号'>
        {{ version.id }}
        <Tag v-if='version.verified' class='tag' color='green'>
          <template #icon>
            <IconCheckCircleFill />
          </template>
          已验证
        </Tag>
        <Tag v-else class='tag' color='red'>
          <template #icon>
            <IconQuestionCircleFill />
          </template>
          未验证
        </Tag>
      </FormItem>
      <FormItem label='更新时间'>
        {{ version.time.toLocaleString('zh-CN') }}
      </FormItem>
      <FormItem label='贡献者'>
        {{ version.author }}
      </FormItem>
      <FormItem label='更新说明'>
        {{ version.message.split('\n')[0] }}
      </FormItem>
    </Form>
  </Spin>
</template>

<style scoped>
.form-wrapper {
  display: block;
  width: 70%;
  height: 100%;
  margin: 0 auto;
}
body.mobile .form-wrapper {
  width: 90%;
}
.form-wrapper:deep() .arco-spin-mask {
  position: initial;
}
.form {
  margin-top: 12px;
  width: 100%;
}
.tag {
  margin-left: 8px;
  user-select: none;
}
</style>
