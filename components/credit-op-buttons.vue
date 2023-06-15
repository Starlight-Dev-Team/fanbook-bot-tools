<script lang="ts" setup>
export interface Props {
  add: boolean;
  remove: boolean;
}
export interface Events {
  (event: 'add'): void;
  (event: 'remove'): void;
}
defineProps<Props>();
defineEmits<Events>();
</script>

<template>
  <div>
    <AButton
      class='w-min h-min bg-transparent'
      type='primary'
      shape='circle'
      @click='() => $emit("add")'
    >
      <template #icon>
        <IconPlusCircleFill class='button-add' :size='24' />
      </template>
    </AButton>
    <AButton
      v-if='remove'
      class='w-min h-min bg-transparent'
      type='primary'
      shape='circle'
      @click='() => $emit("remove")'
    >
      <template #icon>
        <IconMinusCircleFill class='button-remove' :size='24' />
      </template>
    </AButton>
  </div>
</template>

<style lang="postcss" scoped>
.button-add {
  color: rgb(var(--primary-5));
}
.button-remove {
  color: rgb(var(--danger-6));
}
</style>
