import type {ApiToken, Webhook} from '@/client/generated'
import {isApiTokenExpired} from '@/helpers/apiToken'

export type WebhookService = 'n8n' | 'slack'

// Vikunja stores only a target URL per webhook, so the service is inferred from it.
export function webhookService(webhook: Webhook): WebhookService | null {
	let url: URL
	try {
		url = new URL(webhook.target_url ?? '')
	} catch {
		return null
	}
	const haystack = `${url.hostname}${url.pathname}`.toLowerCase()
	if (haystack.includes('n8n')) {
		return 'n8n'
	}
	if (haystack.includes('slack')) {
		return 'slack'
	}
	return null
}

export function countWebhooksByService(webhooks: Webhook[]): Record<WebhookService, number> {
	const counts: Record<WebhookService, number> = {
		n8n: 0,
		slack: 0,
	}
	for (const webhook of webhooks) {
		const service = webhookService(webhook)
		if (service) {
			counts[service]++
		}
	}
	return counts
}

export function countActiveMcpTokens(tokens: ApiToken[], now: number = Date.now()): number {
	return tokens.filter(token => token.permissions?.mcp?.includes('access') && !isApiTokenExpired(token, now)).length
}

const PRIVATE_HOST = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|\[?::1\]?$)|\.(local|lan|internal|home\.arpa)$/

export function isLocalHost(hostname: string): boolean {
	return PRIVATE_HOST.test(hostname.toLowerCase())
}
