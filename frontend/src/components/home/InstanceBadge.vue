<template>
	<div
		class="instance-badge"
		:title="host"
	>
		<span
			class="instance-badge__dot"
			aria-hidden="true"
		/>
		<span class="instance-badge__kind">
			{{ isLocal ? t('integrations.localInstance') : t('integrations.selfHosted') }}
		</span>
		<span class="instance-badge__host">{{ host }}</span>
	</div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import {useI18n} from 'vue-i18n'

import {useConfigStore} from '@/stores/config'
import {isLocalHost} from '@/helpers/integrations'

const {t} = useI18n({useScope: 'global'})
const configStore = useConfigStore()

const url = computed(() => new URL(configStore.apiBase))
const host = computed(() => url.value.host)
const isLocal = computed(() => isLocalHost(url.value.hostname))
</script>

<style lang="scss" scoped>
.instance-badge {
	display: flex;
	align-items: center;
	gap: .5rem;
	margin: 0 .75rem .75rem;
	padding: .4375rem .625rem;
	border: 1px solid var(--surface-border);
	border-radius: 8px;
	background: var(--white);
	font-size: .75rem;
	color: var(--grey-700);
	min-inline-size: 0;
}

.instance-badge__dot {
	flex: none;
	inline-size: 7px;
	block-size: 7px;
	border-radius: 50%;
	background: var(--done-badge-text);
	box-shadow: 0 0 0 3px var(--done-badge-background);
}

.instance-badge__kind {
	font-weight: 600;
	white-space: nowrap;
}

.instance-badge__host {
	margin-inline-start: auto;
	color: var(--text-muted);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	min-inline-size: 0;
}
</style>
