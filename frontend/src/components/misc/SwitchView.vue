<template>
	<component
		:is="is"
		class="switch-view"
	>
		<slot />
	</component>
</template>

<script setup lang="ts">
import type {Component} from 'vue'

withDefaults(defineProps<{
	is?: string | Component,
}>(), {
	is: 'div',
})
</script>

<style lang="scss" scoped>
.switch-view {
	background: var(--kanban-column-background);
	display: inline-flex;
	gap: 2px;
	border-radius: 10px;
	font-size: .8125rem;
	padding: 3px;
}

::v-slotted(.switch-view-button) {
	padding: .375rem .75rem;
	display: block;
	white-space: nowrap;
	border-radius: 8px;
	font-weight: 550;
	color: var(--grey-600);
	transition: all 100ms;

	&:hover {
		color: var(--text-strong);
		background: var(--kanban-column-count-background);
	}

	&.is-active {
		color: var(--text-strong);
		background: var(--white);
		font-weight: 600;
		box-shadow: var(--shadow-xs);
	}
}
</style>
