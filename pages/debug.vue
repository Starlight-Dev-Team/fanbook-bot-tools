<script lang="ts" setup>
import { getDebugMode, setDebugMode } from '~~/utils/debug';

import {
  Form,
  FormItem,
  Switch,
} from '@arco-design/web-vue';

definePageMeta({
  title: '调试模式',
})

const form = reactive({
  debug: getDebugMode(),
});

function changeDebugMode(value: boolean) {
  setDebugMode(value);
  location.reload();
}
</script>

<template>
  <Form class='form' :model='form'>
    <FormItem label='调试模式'>
      <Switch
        v-model='form.debug'
        @change='(v) => changeDebugMode(!!v)'
      />
    </FormItem>
  </Form>
</template>

<style scoped>

.form {
  display: block;
  width: 70%;
  margin: 0 auto;
}
body.mobile .form {
  width: 90vw;
}
</style>
