<script lang="ts">
	import type { Snippet } from 'svelte';
    import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		error?: boolean;
		children?: Snippet;
	}

	let { error = false, children, ...rest }: Props = $props();
</script>

<button class:error {...rest}>
    {@render children?.()}
</button>

<style>
  	button {
		background-clip: padding-box;
		background-color: var(--button-background-color);
		border: 1px solid #fff;
		border-radius: 3px;
		box-shadow: 0 5px 10px rgba(0,0,0,.2);
		color: var(--button-color);
		cursor: pointer;
		font-weight: 400;
		padding: 0.3rem 0.5rem;
    	box-sizing: border-box;
	}
	button:disabled {
		background-color: grey;
	}
	button.error {
		color: red;
	}
</style>
