import {describe, it, expect} from 'vitest'

import {
	countActiveMcpTokens,
	countWebhooksByService,
	isLocalHost,
	webhookService,
} from './integrations'

describe('webhookService', () => {
	it('detects n8n by host or path', () => {
		expect(webhookService({target_url: 'https://n8n.example.com/webhook/abc'})).toBe('n8n')
		expect(webhookService({target_url: 'http://192.168.1.5:5678/webhook/n8n-intake'})).toBe('n8n')
	})

	it('detects slack incoming webhooks', () => {
		expect(webhookService({target_url: 'https://hooks.slack.com/services/T0/B0/x'})).toBe('slack')
	})

	it('ignores unknown and invalid urls', () => {
		expect(webhookService({target_url: 'https://example.com/hook'})).toBeNull()
		expect(webhookService({target_url: 'not a url'})).toBeNull()
		expect(webhookService({})).toBeNull()
	})
})

describe('countWebhooksByService', () => {
	it('counts per service', () => {
		expect(countWebhooksByService([
			{target_url: 'https://n8n.example.com/a'},
			{target_url: 'https://n8n.example.com/b'},
			{target_url: 'https://hooks.slack.com/services/x'},
			{target_url: 'https://example.com'},
		])).toEqual({
			n8n: 2,
			slack: 1,
		})
	})
})

describe('countActiveMcpTokens', () => {
	const now = new Date('2026-11-25T12:00:00Z').getTime()

	it('counts unexpired tokens with mcp access only', () => {
		expect(countActiveMcpTokens([
			{permissions: {mcp: ['access']}},
			{permissions: {mcp: ['access']}, expires_at: '2026-12-01T00:00:00Z'},
			{permissions: {mcp: ['access']}, expires_at: '2026-01-01T00:00:00Z'},
			{permissions: {tasks: ['read_all']}},
		], now)).toBe(2)
	})
})

describe('isLocalHost', () => {
	it('recognises private and loopback hosts', () => {
		for (const host of ['localhost', '127.0.0.1', '192.168.178.10', '10.0.0.2', '172.20.1.1', 'nas.local', 'box.lan']) {
			expect(isLocalHost(host)).toBe(true)
		}
	})

	it('treats public hosts as remote', () => {
		for (const host of ['vikunja.example.com', '172.32.0.1', '8.8.8.8']) {
			expect(isLocalHost(host)).toBe(false)
		}
	})
})
