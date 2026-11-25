<template>
	<div
		v-if="isDone"
		class="is-done"
		:class="{ 'is-done--small': variant === 'small' }"
	>
		{{ $t('task.attributes.done') }}
	</div>
</template>

<script lang="ts" setup>
withDefaults(defineProps<{
	isDone?: boolean
	variant?: 'default' | 'small'
}>(), {
	isDone: false,
	variant: 'default',
})
</script>


<style lang="scss" scoped>
.is-done {
  background: var(--done-badge-background);
  color: var(--done-badge-text);
  padding: .5rem;
  font-weight: 600;
  line-height: 1;
  border-radius: 5px;
  text-align: center;
}

.is-done--small {
	padding: .2rem .3rem;
}
</style>
