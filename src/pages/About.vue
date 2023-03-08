<script lang="ts" setup>
import { inject } from 'vue';

import {
  TypographyTitle,
  TypographyParagraph,
  Link,
} from '@arco-design/web-vue';

import type { DeviceInjection } from '@/App.vue';

const $device = inject('device') as DeviceInjection;
</script>

<template>
  <article>
    <TypographyTitle v-if='$device === "desktop"'>声明</TypographyTitle>
    <TypographyParagraph>
      本项目非 Fanbook 官方项目，是由星光工作室开发组维护的
      <Link
        href='https://github.com/Starlight-Dev-Team/fanbook-bot-tools'
        :hoverable='false'
      >
        开源项目
      </Link>
      ，在
      <Link href='https://opensource.org/license/mit/' :hoverable='false'>
        The MIT License
      </Link>
      下发布的自由软件。
    </TypographyParagraph>
    <TypographyParagraph>
      这个网站由 Github Pages 托管，敏感信息存储在您的浏览器中，不会主动上传到无关服务器。
    </TypographyParagraph>
  </article>
</template>

<style scoped>
article {
  width: 70vw;
  margin: 0 auto;
}
article > div.arco-typography {
  text-indent: 2em;
}
body.mobile article {
  width: 90vw;
}
h1 {
  margin-top: 0;
  text-align: center;
}
</style>
