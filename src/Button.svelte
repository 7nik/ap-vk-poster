<script lang="ts">
    export let disabled = false;
    export let error = false;
</script>

<button class:error disabled={disabled} on:click>
    <slot/>
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
