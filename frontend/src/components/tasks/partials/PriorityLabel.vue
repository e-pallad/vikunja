<template>
	<span
		v-if="!done && (showAll || priority >= minimumPriority)"
		:class="{
			'negligible': priority <= priorities.LOW,
			'not-so-high': priority > priorities.LOW && priority < priorities.HIGH,
			'high-priority': priority >= priorities.HIGH
		}"
		class="priority-label"
	>
		<span class="icon">
			<Icon
				v-if="priority >= priorities.HIGH"
				icon="exclamation-circle"
			/>
			<Icon
				v-else
				icon="exclamation"
			/>
		</span>
		<span>
			<template v-if="priority === priorities.UNSET">{{ $t('task.priority.unset') }}</template>
			<template v-if="priority === priorities.LOW">{{ $t('task.priority.low') }}</template>
			<template v-if="priority === priorities.MEDIUM">{{ $t('task.priority.medium') }}</template>
			<template v-if="priority === priorities.HIGH">{{ $t('task.priority.high') }}</template>
			<template v-if="priority === priorities.URGENT">{{ $t('task.priority.urgent') }}</template>
			<template v-if="priority === priorities.DO_NOW">{{ $t('task.priority.doNow') }}</template>
		</span>
	</span>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {PRIORITIES as priorities} from '@/constants/priorities'
import {useAuthStore} from '@/stores/auth'
	
withDefaults(defineProps<{
	priority: number,
	showAll?: boolean,
	done?: boolean
}>(), {
	showAll: false,
	done: false,
})

const authStore = useAuthStore()

const minimumPriority = computed(() => {
	return authStore.settings.frontend_settings.minimum_priority || priorities.MEDIUM
})
</script>

<style lang="scss" scoped>
// Tinted pills with dark text: readable at small sizes, unlike coloured text on white
.priority-label {
	--pill-bg: hsl(220, 80%, 94%);
	--pill-text: hsl(224, 62%, 40%);

	display: inline-flex;
	align-items: center;
	gap: .25rem;
	padding: .0625rem .4375rem;
	border-radius: 5px;
	background: var(--pill-bg);
	color: var(--pill-text);
	font-size: .75rem;
	font-weight: 600;
	line-height: 1.5;
	vertical-align: middle;
}

.high-priority {
	--pill-bg: hsl(7, 78%, 93%);
	--pill-text: hsl(7, 62%, 36%);

	inline-size: auto !important; // To override the width set in tasks
}

.not-so-high {
	--pill-bg: hsl(39, 86%, 92%);
	--pill-text: hsl(36, 83%, 26%);
}

:global(.dark) .priority-label {
	--pill-bg: hsla(220, 80%, 60%, .18);
	--pill-text: hsl(220, 90%, 80%);
}

:global(.dark) .high-priority {
	--pill-bg: hsla(7, 78%, 60%, .2);
	--pill-text: hsl(7, 90%, 80%);
}

:global(.dark) .not-so-high {
	--pill-bg: hsla(39, 86%, 55%, .2);
	--pill-text: hsl(39, 90%, 75%);
}

.icon {
	inline-size: auto !important;
	block-size: auto;
	padding: 0;
	font-size: .6875rem;
}
</style>
