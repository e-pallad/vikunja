<template>
	<section
		class="integrations"
		:aria-labelledby="headingId"
	>
		<h2
			:id="headingId"
			class="integrations__heading"
		>
			{{ t('integrations.title') }}
		</h2>
		<ul class="integrations__list">
			<li
				v-for="item in items"
				:key="item.id"
			>
				<RouterLink
					:to="item.to"
					class="integrations__item"
				>
					<span
						class="integrations__tile"
						aria-hidden="true"
					>
						<Icon :icon="item.icon" />
					</span>
					<span class="integrations__text">
						<span class="integrations__name">{{ item.name }}</span>
						<span class="integrations__detail">{{ item.detail }}</span>
					</span>
					<span
						class="integrations__dot"
						:class="`is-${item.state}`"
						role="img"
						:aria-label="stateLabel(item.state)"
					/>
				</RouterLink>
			</li>
		</ul>
	</section>
</template>

<script setup lang="ts">
import {useId} from 'vue'
import {useI18n} from 'vue-i18n'

import {useIntegrationsStatus} from '@/composables/useIntegrationsStatus'

const {t} = useI18n({useScope: 'global'})
const headingId = useId()
const {items, stateLabel} = useIntegrationsStatus()
</script>

<style lang="scss" scoped>
.integrations {
	margin-block-start: 1.25rem;
}

.integrations__heading {
	margin: 0 1.25rem .375rem;
	font-size: .6875rem;
	font-weight: 600;
	letter-spacing: .06em;
	text-transform: uppercase;
	color: var(--text-muted);
}

.integrations__list {
	list-style: none;
	margin: 0;
	padding: 0;
}

.integrations__item {
	display: flex;
	align-items: center;
	gap: .625rem;
	margin-inline: .5rem;
	padding: .375rem .75rem;
	min-block-size: 44px;
	box-sizing: border-box;
	border-radius: 8px;
	color: $vikunja-nav-color;
	transition: background-color $transition;

	&:hover {
		background: var(--kanban-column-background);
		color: var(--text-strong);
	}
}

.integrations__tile {
	flex: none;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	inline-size: 1.5rem;
	block-size: 1.5rem;
	border-radius: 6px;
	border: 1px solid var(--surface-border);
	background: var(--white);
	color: var(--grey-600);
	font-size: .6875rem;
}

.integrations__text {
	display: flex;
	flex-direction: column;
	min-inline-size: 0;
	line-height: 1.25;
}

.integrations__name {
	font-size: .875rem;
	font-weight: 500;
}

.integrations__detail {
	font-size: .75rem;
	color: var(--text-muted);
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.integrations__dot {
	flex: none;
	margin-inline-start: auto;
	inline-size: 8px;
	block-size: 8px;
	border-radius: 50%;
	box-sizing: border-box;

	&.is-active {
		background: var(--done-badge-text);
		box-shadow: 0 0 0 3px var(--done-badge-background);
	}

	&.is-off {
		border: 1.5px solid var(--grey-400);
	}

	&.is-unknown {
		background: var(--grey-300);
	}
}
</style>
