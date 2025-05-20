<script lang="ts">
	import { self, preventDefault } from 'svelte/legacy';

    import { Undo2, Settings as SettingsIcon } from '@lucide/svelte';
	import { onMount, setContext } from "svelte";
	import PostMaker from "./PostMaker.svelte";
	import Settings from "./Settings.svelte";

	interface Props {
		darkTheme?: boolean;
		close?: any;
	}

	let { darkTheme = false, close = () => {} }: Props = $props();

	setContext("darkTheme", darkTheme);

	let showSettings = $state(false);
	let elem: HTMLElement;
	let className = $state("");

	let Icon = $derived(showSettings ? Undo2 : SettingsIcon);

	onMount(() => {
		className = elem.closest("#sidebar")
			? "sidebar_block"
			: "post_content";
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div class="post_maker" onclick={self(close)}>
	<div bind:this={elem} class={className}>
		<div class="title">
			Создание поста для Вконтакте
			<span title="Настройки"
				onclick={preventDefault(() => showSettings = !showSettings)}
			>
				<Icon color={darkTheme ? "white" : "black"} cursor="pointer" />
			</span>
		</div>
		<div class="body">
			{#if showSettings}
				<Settings/>
			{:else}
				<PostMaker {close} />
			{/if}
		</div>
	</div>
</div>

<style>
	.post_maker {
		position: fixed;
		top: 0;
		margin: 0;
		height: 100%;
		width: 100%;
		display: flex;
    	align-items: center;
		z-index: 100;
		background: rgba(0,0,0,0.75);
	}
	span {
		float: right;
		margin: 4px 5px 0 0;
		cursor: pointer;
	}
</style>
