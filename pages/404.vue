<script lang="ts" setup>
import { back } from '~~/utils/router';

import { Button, Result } from '@arco-design/web-vue';
</script>

<template>
  <Result status='404' title='这里没有机器人存在'>
    <template #extra>
      <Button type='primary' @click='back'>返回上一页</Button>
    </template>
  </Result>
</template>
