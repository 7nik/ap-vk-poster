<script lang="ts">
    import { findTag } from "./Utils";

    /**
     * The placeholder to display in the input field
     */
    export let placeholder = "";
    /**
     * The entered tag id
     */
    export let tagId: number|null = null;
    /**
     * The field value
     */
    export let value = "";

    type AutocompleteTag = {
        c: number, // tag category
        id: number, // tag id
        t: string, // tag name where the matched part is wrapped by `<b>`
        t2: string | null, // if it's alias, main tag
        name: string,
    }

    let inputElem: HTMLInputElement;
    let tags: AutocompleteTag[] = [];
    let selTag: AutocompleteTag|null = null;
    let focused = false;
    $: show = focused && tags.length > 0;
    $: tagId = tags.find((t) => t.name === value.trim())?.id ?? null;

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
</script>

<svelte:options accessors={true} />
<div>
    <input {placeholder}
        type="search"
        autocomplete="off"
        bind:value
        bind:this={inputElem}
        on:keydown={selectTag}
        on:input={autocomplete}
        on:focus={() => focused = true}
        on:blur={() => focused = false}
    />
    <ul class="autocomplite" class:show>
        {#each tags as tag }
            <li
                class="cat-{tag.c}"
                class:autocomplite_active="{tag === selTag}"
                on:mousedown={selectTag}
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
    ul.autocomplite.show {
        visibility: visible;
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
