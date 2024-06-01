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

async function getPostInfo () {
    const postId = window.location.pathname.match(/\/posts\/(\d+)/)?.[1];
    if (!postId) {
        alert("Ошибка загрузки информации");
        throw new Error("No postId");
    }

    const post: {
        post: {
            id: number,
            erotics: 0|1|2|3,
            small_preview: string,
            medium_preview: string,
            big_preview: string,
            large_preview: string, // in fact doesn't exist
        },
        tags: Array<{
            tag: {
                id: number,
                tag: string,
                tag_ru: string,
            },
            relation: { removetime: string|null },
        }>,
        file_url: string,
    } = await fetch(`https://api.anime-pictures.net/api/v3/posts/${postId}`, { credentials: "include" }).then((resp) => resp.json());
    post.post.large_preview = post.post.big_preview.replace("_bp.", "_lp.");

	const artists = Array.from(document.querySelectorAll(".tags li.orange a"))
        .map((a) => a.textContent ?? "")
        .filter((s) => s !== "tagme (artist)");
    const previewUrl = SETTINGS.imgSize === "orig"
        ? `https://anime-pictures.net/pictures/get_image/${post.file_url}`
        : post.post[`${SETTINGS.imgSize}_preview`];
    const message = makeMessage(artists, `anime-pictures.net/posts/${postId}?lang=ru`);

    let error = "";
    if (post.post.erotics > SETTINGS.maxErotic) {
        error = "Слишком эротично";
    }
    const tags = post.tags.filter((t) => SETTINGS.forbiddenTags.includes(t.tag.id))
    if (tags.length > 0) {
        error = `Есть запрещённые теги: ${tags.map(({ tag }) => tag.tag_ru || tag.tag).join(", ")}`;
    }

    return {
        message,
        previewUrl,
        source: `https://anime-pictures.net/posts/${postId}?lang=ru`,
        error,
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
        img.addEventListener("error", (ev) => reject(ev.message ?? "Failed to parse the image"));
        img.addEventListener("load", () => resolve(img));
        img.src = src;
    });
    URL.revokeObjectURL(src);
    const height = img.naturalHeight || img.offsetHeight || img.height;
    const width = img.naturalWidth || img.offsetWidth || img.width;

    if (height <= size && width <= size && !imgFile.name.endsWith(".avif")) {
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

async function getTag (id: number): Promise<{
    id: number,
    tag: string,
    tag_ru: string,
    tag_en: string,
    num: number,
    num_pub: number,
    type: number,
    description_en: string,
    description_ru: string,
    description_jp: string,
    alias: number|null,
    parent: number|null,
    views: number,
}> {
    const json = await fetch(`https://api.anime-pictures.net/api/v3/tags/${id}`).then((resp) => resp.json());
    return json.tag;
}

async function findTag (tag: string): Promise<{
    c: number, // tag category
    id: number, // tag id
    t: string, // tag name where the matched part is wrapped by `<b>`
    t2: string | null, // if it's alias, main tag
}[]> {
    const form = new FormData();
    form.append("tag", tag);
    const json = await fetch(`https://api.anime-pictures.net/api/v3/tags:autocomplete?tag=${tag}`).then((resp) => resp.json());
    return json.tags;
}

export {
    plural,
    getPostInfo,
    getTag,
    findTag,
    proposeDateByStep,
    proposeDateBySchedule,
    downscale,
};
