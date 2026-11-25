<template>
	<header
		:class="{ 'has-background': background, 'menu-active': menuActive }"
		aria-label="main navigation"
		class="navbar d-print-none"
		:style="{'--sidebar-width': sidebarWidthStyle}"
	>
		<RouterLink
			:to="{ name: 'home' }"
			class="logo-link"
			:aria-label="$t('navigation.home')"
		>
			<Logo
				width="164"
				height="48"
			/>
		</RouterLink>

		<MenuButton class="menu-button" />

		<div
			v-if="currentProject?.id"
			class="project-title-wrapper"
		>
			<div class="project-title-stack">
				<nav
					class="project-breadcrumb"
					:aria-label="$t('project.projects')"
				>
					<RouterLink :to="{name: 'projects.index'}">
						{{ $t('project.projects') }}
					</RouterLink>
					<template
						v-for="parent in breadcrumb"
						:key="parent.id"
					>
						<span aria-hidden="true">/</span>
						<RouterLink :to="{name: 'project.index', params: {projectId: parent.id}}">
							{{ getProjectTitle(parent) }}
						</RouterLink>
					</template>
				</nav>
				<span class="project-title">
					{{ currentProject.title === '' ? $t('misc.loading') : getProjectTitle(currentProject) }}
				</span>
			</div>

			<BaseButton
				v-if="!isEditorContentEmpty(currentProject.description)"
				:to="{ name: 'project.info', params: { projectId: currentProject.id } }"
				class="project-title-button"
			>
				<span class="is-sr-only">{{ $t('project.description') }}</span>
				<Icon icon="circle-info" />
			</BaseButton>

			<ProjectSettingsDropdown
				v-if="canWriteCurrentProject && currentProject.id !== -1"
				class="project-title-dropdown"
				:project="currentProject"
			>
				<template #trigger="{ toggleOpen, open }">
					<BaseButton
						class="project-title-button"
						:aria-expanded="open"
						@click="toggleOpen"
					>
						<span class="is-sr-only">{{ $t('project.openSettingsMenu') }}</span>
						<Icon
							icon="ellipsis-h"
							class="icon"
						/>
					</BaseButton>
				</template>
			</ProjectSettingsDropdown>
		</div>

		<div
			v-else-if="pageTitle"
			class="project-title-wrapper"
		>
			<span class="project-title">{{ pageTitle }}</span>
		</div>

		<div
			id="header-view-switch"
			class="header-view-switch"
		/>

		<div class="navbar-end">
			<TimerBadge />
			<OpenQuickActions />
			<div
				id="header-view-actions"
				class="header-view-actions"
			/>
			<XButton
				v-if="currentProject?.id && canWriteCurrentProject && currentProject.id > 0"
				class="header-action"
				variant="secondary"
				:to="{name: 'project.settings.share', params: {projectId: currentProject.id}}"
			>
				{{ $t('project.share.share') }}
			</XButton>
			<XButton
				class="header-action"
				icon="plus"
				@click="baseStore.setQuickActionsActive(true, true)"
			>
				{{ $t('quickActions.cmds.newTask') }}
			</XButton>
			<Notifications />
			<Dropdown>
				<template #trigger="{ toggleOpen, open }">
					<BaseButton
						class="username-dropdown-trigger"
						variant="secondary"
						:shadow="false"
						:aria-expanded="open"
						@click="toggleOpen"
					>
						<UserAvatar
							:user="authStore.info"
							:size="40"
							class="avatar"
						/>
						<span class="username">{{ authStore.userDisplayName }}</span>
						<span
							class="mis-1 dropdown-icon icon is-small"
							:style="{
								transform: open ? 'rotate(180deg)' : 'rotate(0)',
							}"
						>
							<Icon icon="chevron-down" />
						</span>
					</BaseButton>
				</template>

				<DropdownItem :to="{ name: 'user.settings' }">
					{{ $t('user.settings.title') }}
				</DropdownItem>
				<DropdownItem
					v-if="adminPanelEnabled && authStore.info?.is_admin"
					:to="{ name: 'admin.overview' }"
				>
					{{ $t('admin.title') }}
				</DropdownItem>
				<DropdownItem
					v-if="imprintUrl"
					:href="imprintUrl"
				>
					{{ $t('navigation.imprint') }}
				</DropdownItem>
				<DropdownItem
					v-if="privacyPolicyUrl"
					:href="privacyPolicyUrl"
				>
					{{ $t('navigation.privacy') }}
				</DropdownItem>
				<DropdownItem @click="baseStore.setKeyboardShortcutsActive(true)">
					{{ $t('keyboardShortcuts.title') }}
				</DropdownItem>
				<DropdownItem :to="{ name: 'about' }">
					{{ $t('about.title') }}
				</DropdownItem>
				<DropdownItem @click="authStore.logout()">
					{{ $t('user.auth.logout') }}
				</DropdownItem>
			</Dropdown>
		</div>
	</header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import { PERMISSIONS as Permissions } from '@/constants/permissions'
import { PRO_FEATURE } from '@/constants/proFeatures'

import ProjectSettingsDropdown from '@/components/project/ProjectSettingsDropdown.vue'
import Dropdown from '@/components/misc/Dropdown.vue'
import DropdownItem from '@/components/misc/DropdownItem.vue'
import Notifications from '@/components/notifications/Notifications.vue'
import TimerBadge from '@/components/time-tracking/TimerBadge.vue'
import Logo from '@/components/home/Logo.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import MenuButton from '@/components/home/MenuButton.vue'
import OpenQuickActions from '@/components/misc/OpenQuickActions.vue'
import UserAvatar from '@/components/misc/UserAvatar.vue'

import { getProjectTitle } from '@/helpers/getProjectTitle'
import { isEditorContentEmpty } from '@/helpers/editorContentEmpty'

import { useBaseStore } from '@/stores/base'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/auth'
import {useCurrentProject} from '@/composables/useCurrentProject'
import {useProjects} from '@/composables/useProjects'
import {useSidebarResize} from '@/composables/useSidebarResize'

const baseStore = useBaseStore()
const {currentProject} = useCurrentProject()
const background = computed(() => baseStore.background)
const canWriteCurrentProject = computed(() =>
	currentProject.value?.max_permission !== null &&
	currentProject.value?.max_permission !== undefined &&
	currentProject.value.max_permission > Permissions.READ,
)
const menuActive = computed(() => baseStore.menuActive)
const {sidebarWidthStyle} = useSidebarResize()

const {getAncestors} = useProjects()
// Ancestors without the project itself, so the header reads "Projects / Parent"
const breadcrumb = computed(() => currentProject.value?.id
	? getAncestors(currentProject.value).slice(0, -1)
	: [])

// Standalone pages (no project) surface their route's title in the header.
const route = useRoute()
const { t } = useI18n()
const pageTitle = computed(() => {
	const title = route.meta.title as string | undefined
	return title ? t(title) : ''
})

const authStore = useAuthStore()

const configStore = useConfigStore()
const imprintUrl = computed(() => configStore.legal.imprint_url)
const privacyPolicyUrl = computed(() => configStore.legal.privacy_policy_url)
const adminPanelEnabled = computed(() => configStore.isProFeatureEnabled(PRO_FEATURE.ADMIN_PANEL))
</script>

<style lang="scss" scoped>
$user-dropdown-width-mobile: 5rem;

.navbar {
	--navbar-button-min-width: 40px;
	--navbar-gap-width: 1rem;
	--navbar-icon-size: 1.25rem;

	position: fixed;
	inset-block-start: 0;
	inset-inline-start: 0;
	inset-inline-end: 0;
	z-index: 30;

	display: flex;
	justify-content: space-between;
	gap: var(--navbar-gap-width);
	min-block-size: $navbar-height;

	background: var(--sidebar-background);
	border-block-end: 1px solid var(--surface-border);

	@media screen and (min-width: $tablet) {
		padding-inline: 1.5rem 1rem;
		align-items: stretch;
		background: var(--site-background);
		border-block-end-color: transparent;
		transition: inset-inline-start $transition-duration;

		// The sidebar carries the logo and spans the full height, so the header starts beside it
		&.menu-active {
			inset-inline-start: var(--sidebar-width);

			.logo-link {
				display: none;
			}
		}
	}

	&.menu-active {
		@media screen and (max-width: $tablet) {
			z-index: 0;
		}
	}

	// FIXME: notifications should provide a slot for the icon instead, so that we can style it as we want
	:deep() {
		.trigger-button {
			color: var(--grey-400);
			font-size: var(--navbar-icon-size);
		}
	}
}

.logo-link {
	display: none;

	@media screen and (min-width: $tablet) {
		align-self: stretch;
		display: flex;
		align-items: center;
		margin-inline-end: .5rem;
	}
}

.menu-button {
	align-self: stretch;
	flex: 0 0 auto;

	@media screen and (max-width: $tablet) {
		margin-inline-start: 1rem;
	}
}

.project-title-wrapper {
	display: flex;
	align-items: center;
	flex: 0 1 auto;

	// this makes the truncated text of the project title work
	// inside the flexbox parent
	min-inline-size: 0;

	@media screen and (min-width: $tablet) {
		padding-inline: 0 .25rem;
	}
}

.project-title-stack {
	display: flex;
	flex-direction: column;
	justify-content: center;
	min-inline-size: 0;
}

.project-breadcrumb {
	display: none;
	gap: .3rem;
	font-size: .75rem;
	line-height: 1.2;
	color: var(--text-muted);
	white-space: nowrap;

	a {
		color: inherit;

		&:hover {
			color: var(--text-strong);
		}
	}

	@media screen and (min-width: $tablet) {
		display: flex;
	}
}

.header-view-switch {
	display: none;
	align-items: center;
	min-inline-size: 0;
	flex: 0 1 auto;

	&:empty {
		display: none;
	}

	@media screen and (min-width: $tablet) {
		display: flex;
	}
}

.header-view-actions {
	display: none;
	align-items: center;

	@media screen and (min-width: $tablet) {
		display: flex;
		margin-inline-start: .5rem;
	}

	&:empty {
		display: none;
	}
}

.header-action {
	align-self: center;
	block-size: 2.25rem;
	margin-inline-start: .5rem;
	white-space: nowrap;

	@media screen and (max-width: $tablet) {
		display: none;
	}
}

.project-title {
	font-size: 1rem;
	// We need the following for overflowing ellipsis to work
	text-overflow: ellipsis;
	overflow: hidden;
	white-space: nowrap;

	@media screen and (min-width: $tablet) {
		font-size: 1.3125rem;
		font-weight: 700;
		letter-spacing: -.015em;
		color: var(--text-strong);
	}
}

.project-title-dropdown {
	align-self: stretch;

	.project-title-button {
		flex-grow: 1;
	}
}

.project-title-button {
	align-self: stretch;
	min-inline-size: var(--navbar-button-min-width);
	display: flex;
	place-items: center;
	justify-content: center;
	font-size: var(--navbar-icon-size);
	color: var(--grey-400);
}

.navbar-end {
	flex: 0 0 auto;
	margin-inline-start: auto;
	display: flex;
	align-items: stretch;

	>* {
		min-inline-size: var(--navbar-button-min-width);
	}
}

.username-dropdown-trigger {
	padding-inline-start: .75rem;
	display: inline-flex;
	align-items: center;
	font-size: .85rem;
	font-weight: 700;
	gap: .5rem;
	
	:deep(.avatar) {
		margin-inline-end: 0;
	}
	
	[dir="rtl"] & {
		flex-direction: row-reverse;
	}

	@media screen and (max-width: $tablet) {
		padding-inline-end: .5rem;
	}

	@media screen and (min-width: $tablet) {
		padding-inline-end: .75rem;
	}
}

.username {
	display: none;
}

.dropdown-icon {
	transition: transform $transition;
}

.avatar {
	border-radius: 100%;
	vertical-align: middle;
	block-size: 32px;
	inline-size: 32px;
	margin-inline-end: .25rem;
}
</style>
