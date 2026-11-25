<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton.vue'
import {useBaseStore} from '@/stores/base'
import {onBeforeUnmount, onMounted} from 'vue'
import {eventToShortcutString} from '@/helpers/shortcut'
import {isAppleDevice} from '@/helpers/isAppleDevice'

const baseStore = useBaseStore()

// See https://github.com/github/hotkey/discussions/85#discussioncomment-5214660
function openQuickActionsViaHotkey(event: KeyboardEvent) {
	const shortcutString = eventToShortcutString(event)
	if (!shortcutString) return

	// On macOS, use Cmd+K (Meta+K), on other platforms use Ctrl+K (Control+K)
	const expectedShortcut = isAppleDevice() ? 'Meta+KeyK' : 'Control+KeyK'
	if (shortcutString !== expectedShortcut) return
	
	event.preventDefault()

	openQuickActions()
}

onMounted(() => {
	document.addEventListener('keydown', openQuickActionsViaHotkey)
})

onBeforeUnmount(() => {
	document.removeEventListener('keydown', openQuickActionsViaHotkey)
})

function openQuickActions() {
	baseStore.setQuickActionsActive(true)
}
</script>

<template>
	<BaseButton
		class="trigger-button search-pill"
		:title="$t('keyboardShortcuts.quickSearch')"
		@click="openQuickActions"
	>
		<Icon icon="search" />
		<span class="search-pill__label">{{ $t('navigation.searchTasks') }}</span>
		<kbd class="search-pill__key">{{ isAppleDevice() ? '⌘K' : 'Ctrl K' }}</kbd>
	</BaseButton>
</template>

<style lang="scss" scoped>
.search-pill__label,
.search-pill__key {
	display: none;
}

@media screen and (min-width: $tablet) {
	.search-pill {
		align-self: center;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: .5rem;
		block-size: 2.25rem;
		inline-size: 2.25rem;
		border: 1px solid var(--surface-border);
		border-radius: 8px;
		background: var(--white);
		font-size: .8125rem !important;
		color: var(--text-muted) !important;
		transition: border-color $transition;

		&:hover {
			border-color: var(--grey-300);
		}
	}
}

// Wide screens have room for the full search field
@media screen and (width >= 1440px) {
	.search-pill {
		justify-content: flex-start;
		inline-size: 15rem;
		padding-inline: .75rem .5rem;
	}

	.search-pill__label {
		display: inline;
		flex: 1;
		text-align: start;
	}

	.search-pill__key {
		display: inline;
		padding: 0 .375rem;
		border: 1px solid var(--surface-border);
		border-radius: 4px;
		background: var(--site-background);
		font-family: inherit;
		font-size: .6875rem;
		color: var(--text-muted);
	}
}
</style>
