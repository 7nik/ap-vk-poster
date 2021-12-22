<script lang="ts">
	import { onMount, setContext } from "svelte";
	import PostMaker from "./PostMaker.svelte";
	import Settings from "./Settings.svelte";

	export let darkTheme = false;
	export let close = () => {};

	setContext("darkTheme", darkTheme);

	let showSettings = false;
	let elem: HTMLElement;
	let className = "";
	onMount(() => {
		className = elem.closest("#sidebar")
			? "sidebar_block"
			: "post_content";
	});
</script>

<div class="post_maker" on:click|self={close}>
	<div bind:this={elem} class={className}>
		<div class="title">
			Создание поста для Вконтакте
			<span title="Настройки" 
				on:click|preventDefault={() => showSettings = !showSettings} 
			>
				{showSettings ? "🔙" : "⚙"}
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
		margin-right: 5px;
		font-size: 150%;
		cursor: pointer;
	}
</style>
