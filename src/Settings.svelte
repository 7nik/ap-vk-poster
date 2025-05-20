<script lang="ts">
    import SETTINGS from "./settings";
    import VkApi from "./vkApi";
    import Button from "./Button.svelte";
    import { getTag } from "./Utils";
    import TagsField from "./TagsField.svelte";

    function save () {
        localStorage.AP_VK_Poster_Settings = JSON.stringify(SETTINGS);
    }

    function saveTime (time: string, prop: string) {
        let [h,m] = time.split(":");
        let t = +h*60 + +m;
        // @ts-ignore
        SETTINGS[prop] = t;
        save();
    }

    function timeToStr (time: number) {
        let h = Math.floor(time/60).toString();
        let m = (time % 60).toString();
        return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`
    }

    function addTime () {
        let [h,m] = time.split(":");
        let t = +h*60 + +m;
        SETTINGS.schedule.push(t);
        SETTINGS.schedule = SETTINGS.schedule.sort((a,b) => a-b)
            .filter((x, i, arr) => x !== arr[i+1]);
        save();
    }

    function removeTime (i: number) {
        SETTINGS.schedule.splice(i, 1);
        SETTINGS.schedule = SETTINGS.schedule;
        save();
    }

    let dayStart = $state(timeToStr(SETTINGS.dayStarts));
    let dayEnd = $state(timeToStr(SETTINGS.dayEnds));
    let time = $state(new Date().toTimeString().slice(0, 5));

	const Vk = new VkApi(SETTINGS.APP_ID, ["photos", "wall"]);

    let groupName = $state("");
    Vk.groups.getById(SETTINGS.gid, []).then((groups) => {
        const group = groups.find(({ id }) => id === SETTINGS.gid);
        if (group && group.screen_name !== groupName) {
            groupName = group.screen_name ?? "";
        }
    });

    let timer: NodeJS.Timeout;
    $effect(() => {
        groupName;
        clearTimeout(timer);
        timer = setTimeout(async () => {
            if (!groupName) return;
            try {
                const groups = await Vk.groups.getById(groupName, []);
                const group = groups.find(({ screen_name }) => screen_name === groupName);
                SETTINGS.gid = group?.id ?? 0;
                save();
            } catch (ex: any) {
                // when no group with such name
                if (ex.message.startsWith("#100:")) {
                    SETTINGS.gid = 0;
                } else {
                    throw ex;
                }
            }
        }, 1000);
    });

    let fTags = $state(SETTINGS.forbiddenTags.map((id) => ({ id, name: "..." })));
    async function loadTags (tags: number[], pos = 0) {
        if (pos >= tags.length) return;
        const tag = await getTag(tags[pos]);
        fTags[pos].name = tag.tag_ru || tag.tag;
        loadTags(tags, pos + 1);
    }
    loadTags(SETTINGS.forbiddenTags);

    let newTagId: number|null = $state(null);
    let newTagName = $state("");
    function addTag () {
        if (!newTagId) return;
        SETTINGS.forbiddenTags = [...SETTINGS.forbiddenTags, newTagId];
        save();
        fTags = [...fTags, { id: newTagId, name: newTagName }];
        newTagName = "";
    }
    function removeTag (id: number) {
        fTags = fTags.filter((t) => t.id !== id);
        SETTINGS.forbiddenTags = fTags.map((t) => t.id);
        save();
    }

    let section = $state("message");
</script>

<div>
    <ul>
        <li class:sel={section === "message"}>
            <label>
                <input type="radio" name="section" bind:group={section} value="message">
                Шаблон текст поста
            </label>
        </li>
        <li class:sel={section === "postTime"}>
            <label>
                <input type="radio" name="section" bind:group={section} value="postTime">
                Время отложенного поста
            </label>
        </li>
        <li class:sel={section === "postOptions"}>
            <label>
                <input type="radio" name="section" bind:group={section} value="postOptions">
                Общие настройки поста
            </label>
        </li>
    </ul>

    {#if section === "message"}

        Шаблон текст к посту:
        <textarea bind:value={SETTINGS.mainMessage} onchange={save}></textarea>
        <br>
        Бонусные сообщения:
        <textarea bind:value={SETTINGS.bonusMessages} onchange={save}></textarea>
        <br>
        Шанс добавления бонусного сообщения:
        {Math.round(SETTINGS.bonusMessageOdds*100)}%
        <input type="range"
            min=0 max=1 step=0.01
            bind:value={SETTINGS.bonusMessageOdds}
            onchange={save}>

    {:else if section === "postTime"}

        <label>
            <input type="checkbox" bind:checked={SETTINGS.postponed} onchange={save}>
            Делать пост отложенным по-умолчанию
        </label>
        <br>
        <section>
            Метод выбора времени:
            <label>
                <input type="radio"
                    bind:group={SETTINGS.scheduleMethod}
                    onchange={save}
                    name="method"
                    value="step" >
                    шаг
                </label>
                <label>
                <input type="radio"
                    bind:group={SETTINGS.scheduleMethod}
                    onchange={save}
                    name="method"
                    value="schedule" >
                расписание
            </label>
        </section>

        {#if SETTINGS.scheduleMethod === "step"}
            <label>
                Размер шага, минут:
                <input type="number"
                    min="1"
                    max="684000"
                    bind:value={SETTINGS.stepTime}
                    onchange={save}
                >
            </label>
            <label>
                Размер отклонений, минут:
                <input type="number"
                    min="0"
                    max={SETTINGS.stepTime}
                    bind:value={SETTINGS.stepTimeDeviation}
                    onchange={save}
                >
            </label>
            <label>
                Начало дня:
                <input type="time" bind:value={dayStart} onchange={() => saveTime(dayStart, "dayStarts")}>
            </label>
            <label>
                Конец дня:
                <input type="time" bind:value={dayEnd} onchange={() => saveTime(dayEnd, "dayEnd")}>
            </label>
        {:else}
            <label>
                <input type="time" bind:value={time}>
                <Button onclick={addTime}>Добавить время</Button>
            </label>
            Список времён для публикации:
            <section>
                {#each SETTINGS.schedule as time, i}
                    <span class="time">
                        {timeToStr(time)}
                        <span class="icon_delete" onclick={() => removeTime(i)}></span>
                    </span>
                {/each}
            </section>
        {/if}

    {:else if section === "postOptions"}
        <label>
            Адрес группы для публикации:
            <input bind:value={groupName}>
            ID: {SETTINGS.gid}
        </label>
        <label>
            <input type="checkbox" bind:checked={SETTINGS.signPost} onchange={save}>
            Указывать автора поста
        </label>
        <label>
            <input type="checkbox" bind:checked={SETTINGS.addSource} onchange={save}>
            Добавлять источник поста
        </label>
        <label>
            <input type="checkbox" bind:checked={SETTINGS.addTopic} onchange={save}>
            Добавлять категорию "Арт"
        </label>
        <label>
            Размер изображения для загрузки:
            <select bind:value={SETTINGS.imgSize} onblur={save}>
                <option value="small">маленький</option>
                <option value="medium">средний</option>
                <option value="big">большой</option>
                <option value="large">огромный</option>
                <option value="orig">оригинал</option>
            </select>
        </label>
        {#if SETTINGS.imgSize === "orig"}
            <label>
                Масштабировать изображение:
                <input type="number" bind:value={SETTINGS.imgScale} onchange={save}>px
            </label>
        {/if}
        <label>
            Максимальный уровень эротики для публикации:
            <select bind:value={SETTINGS.maxErotic} onblur={save}>
                <option value={0}>без эротики</option>
                <option value={1}>лёгкая эротика</option>
                <option value={2}>средняя эротика</option>
                <option value={3}>тяжёлая эротика</option>
            </select>
        </label>
        <form onsubmit={(ev) => { ev.preventDefault(); addTag(); }}>
            Теги запрещающие публикацию:
            <section>
                {#each fTags as tag}
                    <span class="time">
                        {tag.name}
                        <span class="icon_delete" onclick={() => removeTag(tag.id)}></span>
                    </span>
                {/each}
            </section>
            <TagsField
                bind:tagId={newTagId}
                bind:value={newTagName}
            />
            <Button disabled={!newTagId}>Добавить тег</Button>
        </form>
    {/if}
</div>

<style>
    div {
        display: flex;
        flex-direction: column;
        gap: 5px;
        min-height: 50vh;
        max-height: calc(100vh - 75px);
    }
    ul {
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid silver;
        padding-bottom: 10px;
    }
    ul li {
        display: inline;
        padding: 0 5px;
    }
    li.sel {
        background: #8888;
    }
    ul li::marker {
        content: none;
    }
    ul label {
        cursor: pointer;
    }
    ul input {
        display: none;
    }
    textarea {
        resize: vertical;
    }
    textarea:nth-of-type(2) {
        flex-grow: 1;
    }
    .time {
        margin-left: 5px;
    }
    .time:not(:last-child)::after {
        content: ", ";
    }
    .icon_delete {
        cursor: pointer;
        display: inline-block;
        width: 18px;
        height: 18px;
        background-image: url(/assets/styles/icons/delete.svg);
        background-size: contain;
        filter: drop-shadow(0 0 1px #0004);
        vertical-align: text-top;
    }
</style>
