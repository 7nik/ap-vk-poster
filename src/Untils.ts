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

function hasTags (...tags: string[]) {
    return tags.some((tag) => document.querySelector(
        `.tags>li>a[href*="search_tag=${encodeURIComponent(tag)}"]`,
    ));
}

function getPostInfo () {
	const artists = Array.from(document.querySelectorAll(".tags li.orange a"))
        .map((a) => a.textContent ?? "")
        .filter((s) => s !== "tagme (artist)");
    const loc = window.location;
    const simpleUrl = loc.host + loc.pathname + "?lang=ru";
    const fullUrl = loc.origin + loc.pathname + "?lang=ru";
    const previewUrl = SETTINGS.imgSize === "orig"
        ? (document.querySelector("#big_preview")!.closest("a") as HTMLAnchorElement).href
        : (document.querySelector("link[rel='image_src']") as HTMLLinkElement).href
            .replace("_bp", { small:"_sp", medium:"_cp", big:"_bp" }[SETTINGS.imgSize]);
    const message = makeMessage(artists, simpleUrl);

    const erotic = hasTags("hard erotic", "тяжёлая эротика") ? 3
        : hasTags("light erotic", "лёгкая эротика") ? 1
        : hasTags("erotic", "эротика", "エロチック") ? 2
        : 0;

    return {
        message,
        previewUrl,
        source: fullUrl,
        erotic,
    }
}

function proposeDateByStep (lastPostDate: number) {
    const date = new Date(Math.max(lastPostDate || 0, Date.now()));
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
    const date = new Date(Math.max(lastPostDate || 0, Date.now()));
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

async function downscale (imgFile: File, size = 1000) {
    const src = URL.createObjectURL(imgFile);
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.addEventListener("error", (ev) => reject(ev.message));
        img.addEventListener("load", () => resolve(img));
        img.src = src;
    });
    URL.revokeObjectURL(src);
    const height = img.naturalHeight || img.offsetHeight || img.height;
    const width = img.naturalWidth || img.offsetWidth || img.width;

    if (height <= size && width <= size) {
        return imgFile;
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext && canvas.getContext("2d")!;
    size = Math.min(size, Math.max(width, height));
    const [width2, height2] = width >= height
        ? [size, height / width * size]
        : [width / height * size, size];

    canvas.height = height2;
    canvas.width = width2;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(img, 0, 0, width2, height2);

    return new Promise<File>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(new File([blob], "picture.jpg", {
                    type: "image/jpeg",
                    lastModified: Date.now(),
                }));
            } else {
                reject();
            }
        }, "image/jpeg", 1);
    })
}

export { plural, getPostInfo, proposeDateByStep, proposeDateBySchedule, downscale };
