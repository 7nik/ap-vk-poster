<script lang="ts">
    import { getContext } from "svelte";
    import SETTINGS from "./settings";

    const light = !getContext("darkTheme");

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

    let dayStart = timeToStr(SETTINGS.dayStarts);
    $: saveTime(dayStart, "dayStarts");
    let dayEnd = timeToStr(SETTINGS.dayEnds);
    $: saveTime(dayEnd, "dayEnds");
    let time = new Date().toTimeString().slice(0, 5);

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

    let section = "message";
</script>

<div>
    <ul>
        <li class:sel={section === "message"}>
            <label>
                <input type="radio" name="section" bind:group={section} value="message">
                Шаблон текст поста
            </label>
        </li>
        <li class:sel={section === "posttime"}>
            <label>
                <input type="radio" name="section" bind:group={section} value="posttime">
                Время отложенного поста
            </label>
        </li>
        <li class:sel={section === "postoptions"}>
            <label>
                <input type="radio" name="section" bind:group={section} value="postoptions">
                Общие настройки поста
            </label>
        </li>
    </ul>
    
    {#if section === "message"}

        Шаблон текст к посту:
        <textarea bind:value={SETTINGS.mainMessage} on:change={save}></textarea>
        <br>
        Бонусные сообщения:
        <textarea bind:value={SETTINGS.bonusMessages} on:change={save}></textarea>
        Шанс добавления бонусного сообщения:
        {Math.round(SETTINGS.bonusMessageOdds*100)}%
        <input type="range" 
            min=0 max=1 step=0.01 
            bind:value={SETTINGS.bonusMessageOdds} 
            on:change={save}>

    {:else if section === "posttime"}

        <label>
            <input type="checkbox" bind:checked={SETTINGS.postponed} on:change={save}>
            Делать пост отложенным по-умолчанию
        </label>
        <br>
        <section>
            Метод выбора времени:
            <label>
                <input type="radio" 
                    bind:group={SETTINGS.scheduleMethod} 
                    on:change={save}
                    name="method" 
                    value="step" >
                    шаг
                </label>
                <label>
                <input type="radio" 
                    bind:group={SETTINGS.scheduleMethod} 
                    on:change={save}
                    name="method" 
                    value="scedule" >
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
                    on:change={save}
                >
            </label>
            <label>
                Размер отклонений, минут: 
                <input type="number" 
                    min="0"
                    max={SETTINGS.stepTime}
                    bind:value={SETTINGS.stepTimeDeviation}
                    on:change={save}
                >
            </label>
            <label>
                Начало дня: 
                <input type="time" bind:value={dayStart}>
            </label>
            <label>
                Конец дня: 
                <input type="time" bind:value={dayEnd}>
            </label>
        {:else}
            <label>
                <input type="time" bind:value={time}>
                <button on:click={addTime}>Добавить время</button>
            </label>
            Список времён для публикации:
            <section>
                {#each SETTINGS.schedule as time, i}
                    <span class="time">
                        {timeToStr(time)}
                        <span class="icon_delete" class:light on:click={() => removeTime(i)}></span>
                    </span>
                {/each}
            </section>
        {/if}

    {:else if section === "postoptions"}
        <label>
            ID группы для публикации: 
            <input type="number" bind:value={SETTINGS.gid} on:change={save}>
        </label>
        <label>
            <input type="checkbox" bind:checked={SETTINGS.signPost} on:change={save}>
            Указывать автора поста
        </label>
        <label>
            <input type="checkbox" bind:checked={SETTINGS.addSource} on:change={save}>
            Добавлять источник поста
        </label>
        <label>
            <input type="checkbox" bind:checked={SETTINGS.addTopic} on:change={save}>
            Добавлять категорию "Арт"
        </label>

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
    }
    .icon_delete.light {
        filter: invert(1);
    }
</style>
