<script lang="ts" setup>
import { RouterLink, type RouterLinkProps } from 'vue-router';

import { Link } from '@arco-design/web-vue';

export interface Props extends RouterLinkProps {
  to: string;
  hoverable?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  hoverable: true,
});

const external = !props.to.startsWith('/');
</script>

<template>
  <Link v-if='external' :href='to' target='_blank'>
    <slot />
  </Link>
  <RouterLink v-else v-slot='{ navigate }' :to='to' custom>
    <Link :href='to' :hoverable='hoverable' @click='navigate'>
      <slot />
    </Link>
  </RouterLink>
</template>

<style scoped>
.link {
  all: inherit;
  width: 100%;
  height: 100%;
}
</style>
