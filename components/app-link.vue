<script lang="ts" setup>
import { Link } from '@arco-design/web-vue';

export interface Props {
  /** 链接目标地址。 */
  to: string;
  /** hover 时是否有底色。 */
  hoverable?: boolean;
  /** 是否添加链接图标。 */
  icon?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  hoverable: true,
  icon: false,
});

const external = computed((): boolean => {
  try {
    new URL(props.to); // 此时给定一个参数，如果不是绝对地址，会报错
  } catch {
    return false; // 报错了，不是绝对地址
  }
  return true; // 没报错，是绝对地址
});
</script>

<template>
  <NuxtLink v-slot='{ navigate }' :to='to' custom :external='external'>
    <Link
      v-bind='$attrs'
      :href='to'
      :hoverable='hoverable'
      :icon='icon'
      :target='external ? "_blank" : undefined'
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
