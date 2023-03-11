<script lang="ts" setup>
import { Link } from '@arco-design/web-vue';

export interface Props {
  to: string;
  hoverable: boolean;
  icon: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  hoverable: true,
  icon: false,
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
  <Link v-if='external' v-bind='$attrs' target='_blank' :href='to' :icon='icon'>
    <slot />
  </Link>
  <NuxtLink v-else v-slot='{ navigate }' :to='to' custom>
    <Link
      v-bind='$attrs'
      :href='to'
      :hoverable='hoverable'
      :icon='icon'
      @click='navigate'
    >
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
