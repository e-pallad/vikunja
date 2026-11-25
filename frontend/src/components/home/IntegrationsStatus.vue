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
import {computed, useId} from 'vue'
import {useI18n} from 'vue-i18n'
import {useQuery} from '@tanstack/vue-query'
import type {RouteLocationRaw} from 'vue-router'
import type {IconProp} from '@fortawesome/fontawesome-svg-core'

import {allApiTokensQuery, mcpInfoQuery} from '@/client/queries/apiTokens'
import {webhooksQuery} from '@/client/queries/webhooks'
import {countActiveMcpTokens, countWebhooksByService} from '@/helpers/integrations'
import {useBaseStore} from '@/stores/base'
import {useConfigStore} from '@/stores/config'

type IntegrationState = 'active' | 'off' | 'unknown'

const {t} = useI18n({useScope: 'global'})
const headingId = useId()
const baseStore = useBaseStore()
const configStore = useConfigStore()

// The sidebar shows an unknown state on failure; a toast on every page would be noise.
const QUIET = {
	retry: false,
	meta: {handlesError: true},
} as const

const mcpInfo = useQuery({
	...mcpInfoQuery(),
	...QUIET,
})
const tokens = useQuery({
	...allApiTokensQuery(),
	...QUIET,
})

const webhooksEnabled = computed(() => configStore.webhooks_enabled)
const projectId = computed(() => baseStore.currentProjectId)
const userWebhooks = useQuery(computed(() => ({
	...webhooksQuery({kind: 'user'}, 1),
	...QUIET,
	enabled: webhooksEnabled.value,
})))
const projectWebhooks = useQuery(computed(() => ({
	...webhooksQuery({
		kind: 'project',
		projectId: projectId.value,
	}, 1),
	...QUIET,
	enabled: webhooksEnabled.value && projectId.value > 0,
})))

const webhookCounts = computed(() => countWebhooksByService([
	...(userWebhooks.data.value?.items ?? []),
	...(projectWebhooks.data.value?.items ?? []),
]))
const webhooksLoaded = computed(() => webhooksEnabled.value && userWebhooks.isSuccess.value)

const webhookSettingsRoute = computed<RouteLocationRaw>(() => projectId.value > 0
	? {
		name: 'project.settings.webhooks',
		params: {projectId: projectId.value},
	}
	: {name: 'user.settings.webhooks'})

function webhookItem(id: 'n8n' | 'slack', name: string, icon: IconProp) {
	const count = webhookCounts.value[id]
	let state: IntegrationState = 'unknown'
	let detail = t('integrations.unavailable')
	if (count > 0) {
		state = 'active'
		detail = t('integrations.webhooks', count)
	} else if (webhooksLoaded.value && projectId.value <= 0) {
		// Most webhooks are per project, so without one open "none" would be a guess.
		detail = t('integrations.perProject')
	} else if (webhooksLoaded.value && projectWebhooks.isSuccess.value) {
		state = 'off'
		detail = t('integrations.noWebhook')
	}
	return {
		id,
		name,
		icon,
		state,
		detail,
		to: webhookSettingsRoute.value,
	}
}

const items = computed(() => {
	const mcpCount = countActiveMcpTokens(tokens.data.value ?? [])
	const mcpReady = mcpInfo.isSuccess.value && tokens.isSuccess.value
	const mcpState: IntegrationState = mcpReady ? (mcpCount > 0 ? 'active' : 'off') : 'unknown'
	return [
		webhookItem('n8n', 'n8n', 'sitemap'),
		{
			id: 'mcp',
			name: 'Claude MCP',
			icon: 'asterisk' as IconProp,
			state: mcpState,
			detail: !mcpReady
				? t('integrations.unavailable')
				: mcpCount > 0 ? t('integrations.mcpTokens', mcpCount) : t('integrations.noMcpToken'),
			to: {name: 'user.settings.mcp'} as RouteLocationRaw,
		},
		webhookItem('slack', 'Slack', 'hashtag'),
	]
})

function stateLabel(state: IntegrationState) {
	return t(`integrations.state.${state}`)
}
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
