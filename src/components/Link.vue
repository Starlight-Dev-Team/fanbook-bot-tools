<script lang="ts" setup>
import { RouterLink } from 'vue-router';

import { Link } from '@arco-design/web-vue';

export interface Props {
  to: string;
  hoverable?: boolean;
}
withDefaults(defineProps<Props>(), {
  hoverable: true,
});
</script>

<template>
  <Link :hoverable='hoverable'>
    <RouterLink class='link' :to='to'>
      <slot />
    </RouterLink>
  </Link>
</template>

<style scoped>
.link {
  all: inherit;
  width: 100%;
  height: 100%;
}
</style>
