<script lang="ts" setup>
import type { RouterLinkProps } from 'vue-router';

import { Link } from '@arco-design/web-vue';

export interface Props extends Omit<RouterLinkProps, 'href'> {
  to: string;
  hoverable?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  hoverable: true,
});

const external = ((): boolean => {
  try {
    new URL(props.to);
  } catch {
    return false;
  }
  return true;
})();
</script>

<template>
  <Link v-if='external' v-bind='$attrs' :href='to' target='_blank'>
    <slot />
  </Link>
  <NuxtLink v-else v-slot='{ navigate }' :to='to' custom>
    <Link v-bind='$attrs' :href='to' :hoverable='hoverable' @click='navigate'>
      <slot />
    </Link>
  </NuxtLink>
</template>

<style scoped>
.link {
  all: inherit;
  width: 100%;
  height: 100%;
}
</style>
