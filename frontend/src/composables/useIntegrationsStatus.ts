import {computed} from 'vue'
import {useI18n} from 'vue-i18n'
import {useQuery} from '@tanstack/vue-query'
import type {RouteLocationRaw} from 'vue-router'
import type {IconProp} from '@fortawesome/fontawesome-svg-core'

import {allApiTokensQuery, mcpInfoQuery} from '@/client/queries/apiTokens'
import {webhooksQuery} from '@/client/queries/webhooks'
import {countActiveMcpTokens, countWebhooksByService} from '@/helpers/integrations'
import {useBaseStore} from '@/stores/base'
import {useConfigStore} from '@/stores/config'

export type IntegrationState = 'active' | 'off' | 'unknown'

export function useIntegrationsStatus() {
	const {t} = useI18n({useScope: 'global'})
	const baseStore = useBaseStore()
	const configStore = useConfigStore()

	// Panels show an unknown state on failure; a toast on every page would be noise.
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

	const activeCount = computed(() => items.value.filter(item => item.state === 'active').length)

	return {
		items,
		activeCount,
		projectId,
		webhookSettingsRoute,
		stateLabel,
	}
}
