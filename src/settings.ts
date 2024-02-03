const DEFAULT_SETTINGS = {

    // ========== USER SETTINGS ==========

    mainMessage:
`$ARTIST_WORD$: $ARTIST_NAME$  「хорошее качество ↓
$LINK$`,
    bonusMessages:
`anime-pictures.net/android_app - наше удобное андроид приложение для просмотра аниме картинок
anime-pictures.net/android_app - наше мобильное приложение для сёрфинга по сотням аниме картинок
anime-pictures.net/android_app - андроид приложение для просмотра и скачивания картинок в HD
Ещё больше на сайте anime-pictures.net и в андроид приложении anime-pictures.net/android_app
Наше мобильное приложение для картинок anime-pictures.net/android_app
Больше картинок в вашем мобильном приложении anime-pictures.net/android_app
Скачивать и смотреть картинки в HD на андроиде можно через наше приложение anime-pictures.net/android_app это бесплатно и без рекламы
У нас доступно мобильное приложение для картинок anime-pictures.net/android_app
Лучший источник новых картинок anime-pictures.net и андроид приложение anime-pictures.net/android_app
Пополняйте ваши коллекции в нашем приложении anime-pictures.net/android_app
Смотрите больше картинок на сайте anime-pictures.net и в мобильном приложении anime-pictures.net/android_app
Скачивайте наше мобильное приложение по ссылке anime-pictures.net/android_app что бы смотреть картинки в HD где угодно
Доступ к крупнейшей аниме арт библиотеке с вашего телефона anime-pictures.net/android_app
Так же у нас есть приложение для телефона anime-pictures.net/android_app
anime-pictures.net/android_app - наше приложение, что бы найти картинки под настроение`,
    bonusMessageOdds: 1/5, // add a bonus message to, in average, 1 of 5 posts

    postponed: true,
    scheduleMethod: "step",
    // for step scheduling
    stepTime: 61, // minutes; value added to date of the last post to schedule next one
    stepTimeDeviation: 0, // minutes; max deviation of stepTime; 0 - no randomization
    dayStarts: 1205, // 0.00-23.59; "day" starts at 05:06
    dayEnds: 902, // 0.00-23.59; "day" ends at 00:00
    // scheduling by list of values
    schedule: [ 17, 219, 405, 725, 1205, 1609 ],

    gid: 15035509,
    signPost: true,
    addSource: true,
    addTopic: true,
    imgSize: "big" as "small"|"medium"|"big"|"large"|"orig",
    imgScale: 0, // size of the bigger side, 0 - no scale
    maxErotic: 1 as 0 | 1 | 2 | 3,
    forbiddenTags: [] as number[],

    hotkey: "À", // key "`" a.k.a. ё; hotkey to call the post maker, requires "AP hotkeys"

    // ========== SYSTEM SETTINGS ==========

    APP_ID: "6733020",
};

const SETTINGS: typeof DEFAULT_SETTINGS = {
    ...DEFAULT_SETTINGS,
    ...JSON.parse(localStorage.AP_VK_Poster_Settings ?? "{}"),
}

export default SETTINGS;
