import SETTINGS from "./settings";

function plural (n: number, [singular, paucal, plural]: string[]) {
    if ((n % 10) === 1 && (n % 100) !== 11) {
        return singular;
    }
    if ((n % 10) >= 2 && (n % 10) <= 4 && ((n % 100) < 10 || (n % 100) > 20)) {
        return paucal;
    }
    return plural;
};

function makeMessage (artists: string[], postSimpleUrl: string) {
    let msg = SETTINGS.mainMessage.replaceAll(/\$\w+\$/g, ($$: string) => {
        switch ($$) {
            case "$ARTIST_WORD$": return artists.length == 1 
                ? "Художник"
                : artists.length > 1 ? "Художники" : "";
            case "$ARTIST_NAME$": return artists.join(", ");
            case "$LINK$": return postSimpleUrl;
            default: return $$;
        }
    });
    if (Math.random() < SETTINGS.bonusMessageOdds) {
        const list = SETTINGS.bonusMessages.split("\n");
        msg += "\n\n" + list[Math.floor(Math.random()*list.length)];
    }
    return msg.replace(/^[\s:-]+/, "");
}

function getPostInfo () {
	const artists = Array.from(document.querySelectorAll(".tags li.orange a"))
        .map((a) => a.textContent ?? "")
        .filter((s) => s !== "tagme (artist)");
    const loc = window.location;
    const simpleUrl = loc.host + loc.pathname + "?lang=ru";
    const fullUrl = loc.origin + loc.pathname + "?lang=ru";
    const previewUrl = (document.querySelector("link[rel='image_src']") as HTMLAnchorElement).href;
    const message = makeMessage(artists, simpleUrl);

    return {
        message,
        previewUrl,
        source: fullUrl,
    }
}

function proposeDateByStep (lastPostDate: number) {
    const date = new Date(Math.max(lastPostDate, Date.now()));
    // add the default shift to the next postponing
    date.setMinutes(date.getMinutes() + SETTINGS.stepTime, 0, 0);
    // generate scheduled time
    const time = date.getHours()*60 + date.getMinutes();
    // if it is "night" and
    // day ends before 00:00
    if (SETTINGS.dayEnds > SETTINGS.dayStarts && (time >= SETTINGS.dayEnds || time < SETTINGS.dayStarts)) {
        date.setHours(0, SETTINGS.dayStarts);
        if (time > SETTINGS.dayEnds) date.setDate(date.getDate()+1);
    // day ends after or at 00:00
    } else if (time >= SETTINGS.dayEnds && time < SETTINGS.dayStarts) {
        date.setHours(0, SETTINGS.dayStarts);
    }

    // compensate timezone for correct converting to UTC
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date;
}

function proposeDateBySchedule (lastPostDate: number) {
    const date = new Date(Math.max(lastPostDate, Date.now()));
    date.setSeconds(0, 0);
    // select the next time in the schedule
    const currTime = date.getHours()*60 + date.getMinutes();
    const nextTime = SETTINGS.schedule.find((t) => t > currTime);
    if (nextTime) {
        date.setHours(0, nextTime);
    } else if (SETTINGS.schedule[0]) {
        date.setHours(0, SETTINGS.schedule[0]);
        date.setDate(date.getDate()+1);
    }

    // compensate timezone for correct converting to UTC
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date;
}

export { plural, getPostInfo, proposeDateByStep, proposeDateBySchedule };
