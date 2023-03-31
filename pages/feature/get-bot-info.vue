<script lang="ts" setup>
import {
  Form,
  FormItem,
  Spin,
TypographyText,
} from '@arco-design/web-vue';

import type { Profile } from '@starlight-dev-team/fanbook-api-sdk/dist/types';

const result = ref(undefined as Profile | undefined);

onMounted(async () => {
  result.value = await getCurrentBot().getProfile();
});
</script>

<template>
  <Spin class='form-wrapper' :loading='!result' tip='正在获取'>
    <Form v-if='result' :model='result'>
      <FormItem label='机器人名称'>
        {{ result.name }}
      </FormItem>
      <FormItem label='长 ID' field='uuid'>
        {{ result.uuid }}
      </FormItem>
      <FormItem label='头像图片链接' field='avatar'>
        <TypographyText class='avatar-link' :ellipsis='{
          rows: 1,
          expandable: true,
        }'>
          {{ result.avatar }}
        </TypographyText>
      </FormItem>
    </Form>
  </Spin>
</template>

<style scoped>
.form-wrapper {
  display: block;
  width: 70%;
  margin: 0 auto;
}
.avatar-link {
  margin: 0;
}
</style>
