<script lang="ts">
    import { run } from 'svelte/legacy';

    import { findTag } from "./Utils";




    interface Props {
        /**
     * The placeholder to display in the input field
     */
        placeholder?: string;
        /**
     * The entered tag id
     */
        tagId?: number|null;
        /**
     * The field value
     */
        value?: string;
    }

    let { placeholder = "", tagId = $bindable(null), value = $bindable("") }: Props = $props();

    type AutocompleteTag = {
        c: number, // tag category
        id: number, // tag id
        t: string, // tag name where the matched part is wrapped by `<b>`
        t2: string | null, // if it's alias, main tag
        name: string,
    }

    let inputElem: HTMLInputElement = $state();
    let tags: AutocompleteTag[] = $state([]);
    let selTag: AutocompleteTag|null = $state(null);
    let focused = $state(false);
    let show = $derived(focused && tags.length > 0);
    run(() => {
        tagId = tags.find((t) => t.name === value.trim())?.id ?? null;
    });

    let timer: number;
    function autocomplete () {
        let tagName = value;
        if (tagName) {
            clearTimeout(timer);
            timer = setTimeout(loadAutocomplete, 200, tagName);
        }
    }

    async function loadAutocomplete (tagName: string) {
        tags = (await findTag(tagName))
            .map(t => ({...t, name: t.t2 ? t.t2 : t.t.replace("<b>","").replace("</b>","") }));
        selTag = null;
    }

    function selectTag (ev: KeyboardEvent | MouseEvent) {
        // choose the clicked tag
        if (ev instanceof MouseEvent) {
            const elem = (ev.target as HTMLElement).closest("li");
            const list = elem?.parentNode?.children;
            if (!elem || !list) return;
            selTag = tags[[...list].indexOf(elem)];
        // choose the selected tag
        } else if (ev.key === "ArrowRight" || ev.key === "Tab") {
            if (selTag) {
                // if (autoAppend) value += delimiters[0];
                insertTag(selTag.name);
                // tags = [];
                selTag = null;
                // (ev.target as HTMLInputElement).selectionStart =
                //     (ev.target as HTMLInputElement).selectionEnd = value.length;
                ev.preventDefault();
            }
            return;
            // select another tag
        } else if (ev.key === "ArrowDown") {
            selTag = selTag
                ? tags[Math.min(tags.indexOf(selTag)+1, tags.length-1)]
                : tags[0];
            ev.preventDefault();
        } else if (ev.key === "ArrowUp") {
            selTag = selTag
                ? tags[Math.max(tags.indexOf(selTag)-1, 0)]
                : tags[tags.length-1];
            ev.preventDefault();
        } else {
            return;
        }
        // display the selected tag in the field
        // const pos = getLastDelimPos();
        // value = (pos ?  value.slice(0, pos) : "") + (selTag?.name ?? "");
        insertTag(selTag?.name ?? "");
    }

    function insertTag (tagName: string) {
        const { selectionStart, selectionEnd } = inputElem;
        value = tagName;
        inputElem.value = value;
        inputElem.selectionStart = selectionStart;
        inputElem.selectionEnd = selectionEnd;
    }

    export {
    	placeholder,
    	tagId,
    	value,
    }
</script>

<svelte:options accessors={true} />

<div>
    <input {placeholder}
        type="search"
        autocomplete="off"
        bind:value
        bind:this={inputElem}
        onkeydown={selectTag}
        oninput={autocomplete}
        onfocus={() => focused = true}
        onblur={() => focused = false}
    />
    <ul class="autocomplite" class:show>
        {#each tags as tag }
            <li
                class="cat-{tag.c}"
                class:autocomplite_active="{tag === selTag}"
                onmousedown={selectTag}
            >
                {@html tag.t2 ? `${tag.t} → ${tag.t2}` : tag.t}
            </li>
        {/each}
    </ul>
</div>

<style>
    div {
        display: inline-block;
        position: relative;
    }
    input {
        width: 100%;
        height: 100%;
        box-sizing: border-box;
    }
    ul {
        position: absolute;
        top: 100%;
        height: 0;
        width: 100%;
    }
    ul.autocomplite {
        visibility: hidden;
    }
    ul.autocomplite.show {
        visibility: visible;
    }
    li {
        background: var(--autocomplite-background);
    }
    li:hover, li.autocomplite_active {
        background: var(--autocomplite-background-active);
    }
    .cat-1 {
        color: #006699;
    }
    .cat-3, .cat-5, .cat-6 {
        color: green;
    }
    .cat-4 {
        color: darkorange;
        font-style: italic;
    }
</style>
