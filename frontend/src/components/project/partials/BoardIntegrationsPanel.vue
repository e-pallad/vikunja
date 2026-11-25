<template>
	<aside
		class="board-panel d-print-none"
		:class="{'is-collapsed': !isOpen}"
		:aria-labelledby="headingId"
	>
		<BaseButton
			v-if="!isOpen"
			class="board-panel__reopen"
			:aria-label="t('integrations.showPanel')"
			:title="t('integrations.showPanel')"
			@click="isOpen = true"
		>
			<Icon icon="angle-left" />
			<span
				:id="headingId"
				class="board-panel__reopen-label"
			>{{ t('integrations.title') }}</span>
		</BaseButton>

		<template v-else>
			<header class="board-panel__header">
				<h2
					:id="headingId"
					class="board-panel__title"
				>
					{{ t('integrations.title') }}
				</h2>
				<span
					v-if="activeCount > 0"
					class="board-panel__connected"
				>
					<span
						class="board-panel__dot is-active"
						aria-hidden="true"
					/>
					{{ t('integrations.connected', {count: activeCount}) }}
				</span>
				<BaseButton
					class="board-panel__collapse"
					:aria-label="t('integrations.hidePanel')"
					:title="t('integrations.hidePanel')"
					@click="isOpen = false"
				>
					<Icon icon="angle-right" />
				</BaseButton>
			</header>

			<ul class="board-panel__list">
				<li
					v-for="item in items"
					:key="item.id"
				>
					<RouterLink
						:to="item.to"
						class="board-panel__card"
					>
						<span class="board-panel__card-head">
							<span
								class="board-panel__tile"
								aria-hidden="true"
							>
								<Icon :icon="item.icon" />
							</span>
							<span class="board-panel__card-text">
								<span class="board-panel__name">{{ item.name }}</span>
								<span class="board-panel__purpose">{{ t(`integrations.purpose.${item.id}`) }}</span>
							</span>
							<span
								class="board-panel__state"
								:class="`is-${item.state}`"
							>{{ stateLabel(item.state) }}</span>
						</span>
						<span class="board-panel__detail">{{ item.detail }}</span>
					</RouterLink>
				</li>
			</ul>

			<h3 class="board-panel__subtitle">
				{{ t('integrations.recent') }}
			</h3>
			<ul
				v-if="recentTasks.length > 0"
				class="board-panel__recent"
			>
				<li
					v-for="task in recentTasks"
					:key="task.id"
				>
					<RouterLink
						:to="{name: 'task.detail', params: {id: task.id}}"
						class="board-panel__recent-link"
					>
						<span class="board-panel__recent-title">{{ task.title }}</span>
						<time
							v-if="task.updated"
							:datetime="task.updated"
							class="board-panel__recent-time"
						>{{ t('integrations.updated', {since: formatDateSince(task.updated)}) }}</time>
					</RouterLink>
				</li>
			</ul>
			<p
				v-else-if="recentQuery.isSuccess.value"
				class="board-panel__empty"
			>
				{{ t('integrations.recentEmpty') }}
			</p>

			<RouterLink
				:to="webhookSettingsRoute"
				class="board-panel__manage"
			>
				{{ t('integrations.manage') }}
				<Icon icon="arrow-right" />
			</RouterLink>
		</template>
	</aside>
</template>

<script setup lang="ts">
import {computed, useId} from 'vue'
import {useI18n} from 'vue-i18n'
import {useQuery} from '@tanstack/vue-query'
import {useStorage} from '@vueuse/core'

import BaseButton from '@/components/base/BaseButton.vue'
import Icon from '@/components/misc/Icon'
import {tasksQuery} from '@/client/queries/tasks'
import {useIntegrationsStatus} from '@/composables/useIntegrationsStatus'
import {formatDateSince} from '@/helpers/time/formatDate'

const props = defineProps<{
	projectId: number,
}>()

const {t} = useI18n({useScope: 'global'})
const headingId = useId()
const isOpen = useStorage('boardIntegrationsPanelOpen', true)
const {items, activeCount, stateLabel, webhookSettingsRoute} = useIntegrationsStatus()

const RECENT_COUNT = 5
const recentQuery = useQuery(computed(() => ({
	...tasksQuery({
		project: props.projectId,
		params: {
			sort_by: ['updated'],
			order_by: ['desc'],
			per_page: RECENT_COUNT,
		},
	}),
	retry: false,
	meta: {handlesError: true},
	enabled: isOpen.value && props.projectId > 0,
})))
const recentTasks = computed(() => (recentQuery.data.value?.items ?? []).slice(0, RECENT_COUNT))
</script>

<style lang="scss" scoped>
.board-panel {
	flex: 0 0 300px;
	display: flex;
	flex-direction: column;
	gap: .625rem;
	min-block-size: 0;
	overflow-y: auto;
	padding-block-end: 1rem;

	&.is-collapsed {
		flex-basis: 2.5rem;
	}

	@media screen and (width <= 1100px) {
		display: none;
	}
}

.board-panel__reopen {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: .75rem;
	padding: .75rem 0;
	border-radius: 10px;
	background: var(--kanban-column-background);
	color: var(--grey-600);
	font-size: .8125rem;
	font-weight: 600;

	&:hover {
		color: var(--text-strong);
	}
}

.board-panel__reopen-label {
	writing-mode: vertical-rl;
}

.board-panel__header {
	display: flex;
	align-items: center;
	gap: .5rem;
}

.board-panel__title {
	margin: 0;
	font-size: .9375rem;
	font-weight: 650;
	color: var(--text-strong);
}

.board-panel__connected {
	display: inline-flex;
	align-items: center;
	gap: .375rem;
	margin-inline-start: auto;
	padding: .125rem .5rem;
	border-radius: 999px;
	background: var(--done-badge-background);
	color: var(--done-badge-text);
	font-size: .6875rem;
	font-weight: 600;
}

.board-panel__collapse {
	margin-inline-start: auto;
	padding: .25rem .375rem;
	border-radius: 6px;
	color: var(--grey-500);

	.board-panel__connected + & {
		margin-inline-start: 0;
	}

	&:hover {
		background: var(--kanban-column-background);
		color: var(--text-strong);
	}
}

.board-panel__dot {
	inline-size: 7px;
	block-size: 7px;
	border-radius: 50%;
	background: var(--success-dark, var(--success));
}

.board-panel__list,
.board-panel__recent {
	list-style: none;
	margin: 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	gap: .5rem;
}

.board-panel__card {
	display: flex;
	flex-direction: column;
	gap: .5rem;
	padding: .75rem;
	border: 1px solid var(--surface-border);
	border-radius: 12px;
	background: var(--kanban-card-background);
	color: var(--text);
	transition: border-color $transition;

	&:hover {
		border-color: var(--grey-300);
	}
}

.board-panel__card-head {
	display: flex;
	align-items: flex-start;
	gap: .625rem;
}

.board-panel__tile {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	flex: none;
	inline-size: 2rem;
	block-size: 2rem;
	border: 1px solid var(--surface-border);
	border-radius: 8px;
	background: var(--white);
	color: var(--text-strong);
	font-size: .8125rem;
}

.board-panel__card-text {
	display: flex;
	flex-direction: column;
	min-inline-size: 0;
	flex: 1;
}

.board-panel__name {
	font-size: .875rem;
	font-weight: 650;
	color: var(--text-strong);
}

.board-panel__purpose,
.board-panel__detail {
	font-size: .75rem;
	color: var(--text-muted);
}

.board-panel__state {
	flex: none;
	padding: .125rem .5rem;
	border-radius: 999px;
	font-size: .6875rem;
	font-weight: 600;
	white-space: nowrap;

	&.is-active {
		background: var(--done-badge-background);
		color: var(--done-badge-text);
	}

	&.is-off,
	&.is-unknown {
		background: var(--kanban-column-background);
		color: var(--grey-600);
	}
}

.board-panel__subtitle {
	margin: .5rem 0 0;
	font-size: .8125rem;
	font-weight: 650;
	color: var(--text-strong);
}

.board-panel__recent {
	gap: 0;
	border: 1px solid var(--surface-border);
	border-radius: 12px;
	background: var(--kanban-card-background);
	overflow: hidden;

	li + li {
		border-block-start: 1px solid var(--surface-border);
	}
}

.board-panel__recent-link {
	display: flex;
	flex-direction: column;
	gap: .125rem;
	padding: .625rem .75rem;
	color: var(--text);

	&:hover {
		background: var(--site-background);
	}
}

.board-panel__recent-title {
	font-size: .8125rem;
	font-weight: 500;
	line-height: 1.35;
	color: var(--text-strong);
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.board-panel__recent-time,
.board-panel__empty {
	font-size: .75rem;
	color: var(--text-muted);
}

.board-panel__manage {
	display: inline-flex;
	align-items: center;
	gap: .375rem;
	margin-block-start: auto;
	padding-block-start: .5rem;
	font-size: .8125rem;
	font-weight: 600;
}
</style>
