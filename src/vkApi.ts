type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;

type bool = 0|1;
type ErrorResponse = {
    error: {
        error_code: number,
        error_msg: string,
        request_params: { key:string, value:string}[],
    }
}
type GoodResponse<T> = {
    response: T,
}
type VKResponse<T> = XOR<GoodResponse<T>, ErrorResponse>
type ListResponse<T> = {
    count: number,
    items: T[],
}

/**
 * Photo sizes
 * @see https://vk.com/dev/photo_sizes
 */
type PhotoSize = {
    type: "s"|"m"|"x"|"o"|"p"|"q"|"r"|"y"|"z"|"w"
    url: string,
    width: number,
    height: number,
}

/**
 * Obsolete attachments, for posts created before 2013
 * @see https://vk.com/dev/objects/attachments_w
 */
 type ObsoleteAttachment = {
    id: number,
    owner_id: number,
    photo_130: string, // url
    photo_604: string, // url
}
type PostedPhotoAttachment = ObsoleteAttachment;
type GraffitiAttachment = ObsoleteAttachment;
type ApplicationAttachment = ObsoleteAttachment;

/**
 * Photo attachment for API 5.77+
 * @see https://vk.com/dev/objects/photo
 */
type PhotoAttachment = {
    id: number,
    album_id: number,
    owner_id: number,
    user_id?: number, // uploader, 100 is community
    text: string, // description
    date: number, // upload date in unix time
    sizes: PhotoSize[],
    width?: number, // original width
    height?: number, // original height
}

/**
 * Video attachment for API 5.0+
 * @see https://vk.com/dev/objects/video
 */
type VideoAttachment = {
    id: number,
    owner_id: number,
    title: string,
    description: string,
    duration: number, // in seconds
    photo_130: string, // preview 130x98
    photo_320: string, // preview 320x240
    photo_640?: string, // preview 640x408
    photo_800?: string, // preview 800x450
    date: number, // upload date, unix time
    adding_date: number, // date of adding, unix time
    views: number,
    comments: number,
    player: string, // url to page with Flash/HTML5 player with this video
    access_key: string, 
    processing?: 1, // video still is processing
    live?: 1, // it's live video
    upcoming?: 1, // translation will start soon
    is_favorite?: true,
}

/**
 * Audio attachment for API 5.0+
 * @see https://vk.com/dev/objects/audio
 */
type AudioAttachment = {
    id: number,
    owner_id: number,
    artist: string,
    title: string,
    duration: number, // seconds
    url: string, // link to MP3 for your IP
    lyrics_id?: number,
    album_id?: number,
    genre_id: number, // see https://vk.com/dev/objects/audio_genres
    date: number, // upload date in unix time 
    no_search?: 1, // is hidden from search
}

/**
 * Document attachment for API 5.0+
 * @see https://vk.com/dev/objects/doc
 */
type DocumentAttachment = {
    id: number,
    owner_id: number,
    title: string,
    size: number, // in bytes
    ext: string, // extension
    url: string,
    date: number, // upload date in unix time
    type:  
        1 | // text documents;
        2 | // archives;
        3 | // gif;
        4 | // images;
        5 | // audio;
        6 | // video;
        7 | // e-books;
        8 , // unknown.
    preview: {
        photo?: {
            sizes: PhotoSize[],
        },
        graffiti?: {
            src: string,
            width: number,
            height: number,
        },
        audio_msg?: {
            duration: number,
            waveform: number[], // array for sound visualization
            link_ogg: string,
            link_mp3: string,
        }
    },
}

/**
 * Link attachment for API 5.40+
 * @see https://vk.com/dev/objects/link
 */
type LinkAttachment = {
    url: string,
    title: string,
    caption?: string,
    description: string,
    photo?: PhotoAttachment,
    is_external: bool,
    product?: {
        price: {
            // maybe wrong schema
            amount: number, // price in cents
            currency: {
                id: number, // currency id
                name: string,
            },
            text: string, // price description
        }
    },
    button?: object,
    preview_page: string, // id of wiki page for preview
    preview_url: string,
}

/**
 * Note attachment for API 5.0+
 * @see https://vk.com/dev/objects/note
 */
type NoteAttachment = {
    id: number,
    user_id: number,
    title: string,
    text: string,
    date: number,
    comments: number,
    read_comments: number,
}

/**
 * Poll attachment
 * @see https://vk.com/dev/objects/poll
 */
type PollAttachment = {
    id: number,
    owner_id: number,
    created: number,
    question: string,
    votes: number,
    answers: {
        id: number,
        text: string,
        votes: number,
        rate: number,
    }[],
    anonymous: boolean,
    multiple: boolean,
    answer_ids: number[],
    end_date: number,
    closed: boolean,
    is_board: boolean,
    can_edit: boolean,
    can_vote: boolean,
    can_report: boolean,
    can_share: boolean,
    author_id: number,
    photo: PhotoAttachment,
    background: {
        id: number,
        type: "gradient",
        angle: number,
        color: string,
        points: {
            position: number,
            color: string,
        }
    } | {
        id: number,
        type: "tile",
        color: string,
        width: number,
        height: number,
        images: PhotoSize[],
    },
    friends: number[],
}

/**
 * Wiki page attachment for API 5.20+
 * @see https://vk.com/dev/objects/page
 */
type WikiPageAttachment = {
    id: number,
    group_id: number,
    creator_id: number,
    title: string,
    current_user_can_edit: bool,
    current_user_can_edit_access: bool,
    who_can_view: 0|1|2,
    who_can_edit: 0|1|2,
    edited: number,
    created: number,
    editor_id: number,
    views: number,
    parent?: string,
    parent2?: string,
    source?: string,
    html?: string,
    view_url: string
}

/**
 * Album attachment
 * @see https://vk.com/dev/objects/attachments_w
 */
type PhotoAlbumAttachment = {
    id: number,
    thumb: PhotoAttachment,
    owner_id: number,
    title: string,
    description: string,
    created: number,
    updated: number,
    size: number
}

/**
 * Photo list attachment
 * @see https://vk.com/dev/objects/attachments_w
 */
type PhotoListAttachment = string[]; // photo ids

/**
 * Market item attachment for API 5.20+
 * @see https://vk.com/dev/objects/attachments_w
 */
type MarketItemAttachment = {
    id: number,
    owner_id: number,
    title: string,
    description: string,
    price: {
        amount: number, // price in cents
        currency: {
            id: number, // currency id
            name: string,
        },
        text: string, // price description
    },
    category: {
        id: number,
        name: string,
        section: {
            id: number,
            name: string,
        },
    },
    thumb_photo: string,
    date: number,
    availability: 0|1|2,
    is_favorite: boolean,
}

/**
 * Market album
 * @see https://vk.com/dev/objects/market_album
 */
type MarketAlbumAttachment = {
    id: number,
    owner_id: number,
    title: string,
    is_main: boolean,
    is_hidden: boolean,
    photo: PhotoAttachment,
    count: number
}

/**
 * Sticker attachment for API 5.74+
 * @see https://vk.com/dev/objects/page
 */
type StickerAttachment = {
    product_id: number,
    sticker_id: number,
    images: {
        url: string,
        width: number,
        height: number,
    }[],
    images_with_background: {
        url: string,
        width: number,
        height: number,
    }[],
    animation_url: string,
    is_allowed: boolean
}

/**
 * Pretty cards attachment
 * @see https://vk.com/dev/objects/attachments_w
 */
type PrettyCardsAttachment = {
    card_id: string,
    link_url: string,
    title: string,
    images: PhotoSize[],
    button: object,
    price: string,
    price_old: string,
}

/**
 * Event attachment
 * @see https://vk.com/dev/objects/attachments_w
 */
type EventAttachment = {
    id: number,
    time: number,
    member_status: 0|1|2,
    is_favorite: boolean,
    address: string,
    text: string,
    button_text: string,
    friends: number[]
}

/**
 * Attachment with its type
 * @see https://vk.com/dev/objects/attachments_w
 */
type Attachment = {
    type: "photo",
    photo: PhotoAttachment,
} | {
    type: "posted_photo",
    posted_photo: PostedPhotoAttachment,
} | {
    type: "video",
    video: VideoAttachment,
} | {
    type: "audio",
    audio: AudioAttachment,
} | {
    type: "doc",
    doc: DocumentAttachment,
} | {
    type: "graffiti",
    graffiti: GraffitiAttachment,
} | {
    type: "link",
    link: LinkAttachment,
} | {
    type: "note",
    note: NoteAttachment,
} | {
    type: "app",
    app: ApplicationAttachment,
} | {
    type: "poll",
    poll: PollAttachment,
} | {
    type: "page",
    page: WikiPageAttachment,
} | {
    type: "album",
    album: PhotoAlbumAttachment
} | {
    type: "photos_list",
    photos_list: PhotoListAttachment,
} | {
    type: "market",
    market: MarketItemAttachment,
} | {
    type: "market_album",
    market_album: MarketAlbumAttachment,
} | {
    type: "sticker",
    sticker: StickerAttachment,
} | {
    type: "pretty_cards",
    pretty_cards: PrettyCardsAttachment
} | {
    type: "event",
    event: EventAttachment,
} | { 
// General attachment - stub for unknown attachments
    type: Exclude<"photo"|"posted_photo"|"video"|"audio"|"doc"|"graffiti"|"link"|
        "note"|"app"|"poll"|"page"|"album"|"photos_list"|"market"|"market_album"|
        "sticker"|"pretty_cards"|"event", string>,
    [prop: string]: any,
};

/**
 * @see https://vk.com/dev/objects/post
 */
type WallPost = {
    id: number, // post id
    owner_id: number, // wall owner
    from_id: number, // post author
    created_by?: number, // who posted the post in a community
    date: number, // post date in unix time
    text: string, // post text
    reply_owner_id?: number, // replied post's owner id
    reply_post_id?: number, // replied post's id
    friend_only?: 1, // friends only post
    comments: {
        count: number,
        can_post?: bool, // whether the current user can comment
        groups_can_post: bool, // whether communities can comment this post
    },
    copyright?: {
        id: number,
        link: string,
        name: string,
        type: string,
    }
    likes: {
        count: number,
        user_likes?: bool, // post is liked
        can_like?: bool, // user can like the post
        can_repost?: bool, // user can repost the post
    },
    reposts: {
        count: number,
        user_reposted?: bool, // whether the user reposted the post 
    },
    views: {
        count: number,
    }
    post_type: "post" | "copy" | "reply" | "postpone" | "suggest",
    post_source?: {
        type: "vk" | "widget" | "api" | "rss" | "sms",
        platform?: "android" | "iphone" | "wphone",
        data?: "profile_activity" | "profile_photo" | "comments" | "like" | "poll",
        url?: string,
    },
    attachments?: Attachment[],
    geo?: {
        type: string,
        coordinates: string,
        place: object,
    },
    signer_id?: number, // who published the post by the community name
    copy_history?: WallPost[], // repost history
    can_pin?: bool, // can current user pin the post
    can_delete?: bool, // can current user delete the post
    can_edit?: bool, // can current user edit the post
    is_pinned?: bool, // is the post pinned
    marked_as_ads?: bool, // is post marked as ad
    is_favorite?: true, // the post is added to favorites
    donut: {
        is_donut: boolean, // donut only post
        paid_duration: number, // how long id donut only
        placeholder: object, // content for non-donut users
        can_publish_free_copy: boolean,
        edit_mode: "all"|"duration", // what can be edited in the post
    },
    postponed_id?: number,
}

/**
 * @see https://vk.com/dev/wall.get
 */
type WallGetParams_ = Partial<{
    // owner_id: number, // negative for community
    // domain: string, // user or community short address.
    offset: number, // offset for post search
    count: number, // number of posts to return, max 100
    filter: "owner"|"others"|"all"|"postponed"|"suggests", // def. "all"
    extended: bool, // weather return `wall`, `profiles`, and `groups` fields, def. off
    fields: string, // list of extra fields
}>
type WallGetParams = WallGetParams_ & XOR<{ owner_id:number }, { domain: string }>;

/**
 * @see https://vk.com/dev/wall.post
 */
type WallPostParams = Partial<{
    owner_id: number, // negative for community, post creator, def. current user
    friend_only: bool, // friend only post, def. off
    from_group: bool, // post by the community name, def. off
    message: string, // text of the post
    attachments: string, // list of comma-separated id of attachments
    services: string,
    signed: bool, // for post community whether to show author, def. off
    publish_date: number, // postpone the post, unix time
    lat: number, // geo: latitude
    long: number, // geo: longitude
    place_id: number, // id of the location
    post_id: number, // publish this postponed or suggested post
    guid: string,
    mark_as_ads: bool, // def. off
    close_comments: bool,
    donut_paid_duration: number, // how long post is donut-only
    mute_notifications: bool,
    copyright: string,
    topic_id: number,
}>

/**
 * @see https://vk.com/dev/photos.saveWallPhoto
 */
type PhotoSavingOnWallParams_ = {
    // user_id: number, // user to save
    // group_id: number, // community to save
    photo: string, // answer of uploading to the server
    server: number,
    hash: string,
    latitude?: number,
    longitude?: number,
    caption?: string, // photo description
}
type PhotoSavingOnWallParams = PhotoSavingOnWallParams_ & XOR<{ user_id: number }, { group_id: number }>;


type PhotoUploadOnWallParams = {
    file: Blob, // file of photo to upload
    group_id: number, // community to upload the photo
    description?: string, // photo's description
    latitude?: number,
    longitude?: number,
};


/**
 * List of user access permissions.
 * @see https://vk.com/dev/permissions
 */
const SCOPES = {
    notify: 1,
    friends: 2,
    photos: 4,
    audio: 8,
    video: 16,
    stories: 64,
    pages: 128,
    status: 1024,
    notes: 2048,
    messages: 4096,
    wall: 8192,
    ads: 32768,
    offline: 65536,
    docs: 131072,
    groups: 262144,
    notifications: 524288,
    stats: 1048576,
    email: 4194304,
    market: 134217728,
}

function GM_XHR (options: Record<string, any>): Promise<any> {
    return new Promise(function (resolve, reject) {
        // @ts-ignore
        GM.xmlHttpRequest({
            method: "GET",
            // @ts-ignore
            responseType: "json",
            ...options,
            onload: (xhr) => resolve(xhr.response),
            onerror: reject,
        });
    });
}

/**
 * Opens a popup window for confirmation of an action.
 * If the popup get closed, returns `null`.
 * If the popup's origin matches with the site's, returns the current URL of the popup.
 * @param url URL of confirmation page
 * @param height popup height
 * @param width popup width
 * @returns the redirected URL if it has the same origin
 */
function confirmAction (url: string, width: number, height: number): Promise<Location | null> {
    const top = window.screenY + ((window.outerHeight - height) / 2.5);
    let left = window.screenX + ((window.outerWidth - width) / 2);
    // @ts-ignore - i'll believe to VkOpenApi
    left = window.screen && window.screenX && screen.left && screen.left > 1000 ? 0 : left; // FF with 2 monitors fix
    const features = `width=${width},height=${height},left=${left},top=${top}`;
    const popup = window.open(url, "VkApi_ConfirmWindow", features);
    if (!popup) throw new Error("Couldn't open the popup window");
    return new Promise((resolve) => {
        setTimeout(function check() {
            if (popup.closed) {
                resolve(null);
                return;
            }
            try {
                if (popup.location.origin === window.location.origin) {
                    resolve(popup.location);
                    popup.close();
                } else if (popup.location.href === "about:blank") {
                    setTimeout(check, 100);
                } else {
                    console.log(popup.location.href);
                    resolve(null);
                }
            } catch (ex) {
                setTimeout(check, 100);
            }
        }, 500);
    });
} 

class VkApi {
    #appid: string;
    #scope: number;
    #v: string;
    #token: {
        value: string,
        expires: number,
        scope: number,
    } = {
        value: "",
        expires: Infinity,
        scope: 0,
    };
    #updateTokenPromise: Promise<string> | undefined;

    wall;
    photos;
    
    /**
     * Get the valid access token.
     */
    async #getToken (revoke = false): Promise<string> {
        // get stored token
        if (!this.#token.value) {
            this.#token = JSON.parse(localStorage["VK_API_"+this.#appid] ?? "{}");
            if ((this.#token.scope&this.#scope) !== this.#scope) {
                // set it expired
                this.#token.expires = 0;
            }
        }
        // return stored token if it's valid
        if (!revoke && this.#token.expires > Date.now()) {
            return this.#token.value;
        }

        if (this.#updateTokenPromise) return await this.#updateTokenPromise;

        const params = {
            client_id: this.#appid,
            redirect_uri: window.location.origin + "/",
            display: "popup",
            scope: this.#scope.toString(),
            response_type: "token",
            v: "5.131",
        };
        const url = `https://oauth.vk.com/authorize?${new URLSearchParams(params)}`;

        const self = this;
        this.#updateTokenPromise = new Promise(function (resolve, reject) {
            function setToken (querystring: string) {
                const data = new URLSearchParams(querystring);
                if (data.has("error")) {
                    reject("Authorization error: " + data.get("error_description"));
                } else {
                    self.#token.value = data.get("access_token") ?? "";
                    self.#token.expires = Date.now() + Number(data.get("expires_in"))*1000 - 60000;
                    self.#token.scope = self.#scope;
                    localStorage["VK_API_"+self.#appid] = JSON.stringify(self.#token);
                    self.#updateTokenPromise = undefined;
                    resolve(self.#token.value);
                }
            }
            // @ts-ignore
            GM.xmlHttpRequest({
                url,
                method: "GET",
                onload: (xhr) => {
                    if (xhr.finalUrl.startsWith("https://oauth.vk.com/auth_redirect")) {
                        setToken(xhr.responseText.split("#")[2].split("'")[0]);
                    } else {
                        confirmAction(url, 665, 370).then((loc) => {
                            if (loc) {
                                setToken(loc.hash.slice(1));
                            } else {
                                self.#updateTokenPromise = undefined;
                                reject("The popup window was closed");
                            }
                        });
                    }
                },
                onerror: (xhr) => {
                    self.#updateTokenPromise = undefined;
                    reject(xhr);
                },
            });
        });
        return this.#updateTokenPromise;
    }

    /**
     * Call a VK API method
     * @param name the method name
     * @param options the method params
     * @returns the API response
     */
    async call<T = any> (name: string, options: Record<string, any>, retry = 0): Promise<T> {
        let access_token = await this.#getToken();
        const queryParams = { ...options, v: this.#v, access_token };
        const queryString = Object.entries(queryParams)
            .map((pair) => pair.map(encodeURIComponent).join("="))
            .join("&");
        const resp: VKResponse<any> = queryString.length < 1500
            ? await GM_XHR({ 
                url: `https://api.vk.com/method/${name}?${queryString}`,
            })
            : await GM_XHR({
                url: `https://api.vk.com/method/${name}`,
                method: "POST",
                data: queryString,
                headers: {
                    'Content-type': 'application/x-www-form-urlencoded',
                },
            });
        if (resp.error) {
            const code = resp.error.error_code;
            if (code >= 3 && code <= 5) {
                if (retry < 3) {
                    access_token = await this.#getToken(true);
                    return this.call(name, options, retry + 1);
                }
            }
            throw new Error(`#${code}: ${resp.error.error_msg}`);
        }
        return resp.response;
    }

    constructor (appid: string, scope: number | (keyof typeof SCOPES)[] = 0, v = "5.131") {
        if (!appid) throw new Error("No Application ID was provided!");
        if (!v.toString().startsWith("5")) {
            console.warn("The lib may not work with VK API other than 5.xx");
        }
        this.#appid = appid;
        this.#scope = Array.isArray(scope)
            ? scope.reduce((sc, str) => sc + SCOPES[str], 0) 
            : scope;
        this.#v = v;

        const call = this.call.bind(this);
        this.wall = {
            /**
             * Returns a list of posts on a user wall or community wall.
             * @param options wall params
             * @returns list of the posts
             */
            get (options: WallGetParams): Promise<ListResponse<WallPost>> {
                return call("wall.get", options);
            },
            /**
             * Adds a new post on a user wall or community wall. 
             * Can also be used to publish suggested or scheduled posts.
             * @param options the post's data
             * @returns id of the post
             */
            async post (options: WallPostParams): Promise<number> {
                const confirmParams = {
                    ...options,
                    act: "wall_post_box",
                    method: "wall.post",
                    widget: 4, 
                    aid: appid,
                    text: options.message,
                    method_access: "_" + Math.random().toString(16).slice(2),
                };
                // @ts-ignore - everything will automatically cast to strings
                const url = `https://vk.com/al_apps.php?${new URLSearchParams(confirmParams)}`;
                await confirmAction(url, 560, 450);

                return (await call("wall.post", {
                    ...options,
                    method_access: confirmParams.method_access,
                })).post_id;
            }
        };
        this.photos = {
            /**
             * Returns the server address for photo upload onto a user's wall.
             * @param group_id the target community's id
             */
            async getWallUploadServer (group_id: number): Promise<string> {
                return (await call("photos.getWallUploadServer", { group_id })).upload_url;
            },
            /**
             * Saves a photo to a user's or community's wall after being uploaded.
             * @param options photo data to save the photo
             * @returns list with data of the saved photo
             */
            async saveWallPhoto (options: PhotoSavingOnWallParams): Promise<PhotoAttachment[]> {
                return call("photos.saveWallPhoto", options);
            },
            /**
             * Uploads and saves a photo (file) to the community
             * @param options photo data
             * @returns photo meta
             */
            async uploadWallPhoto (options: PhotoUploadOnWallParams): Promise<PhotoAttachment> {
                const uploadUrl = await this.getWallUploadServer(options.group_id);
            
                const form = new FormData();
                form.append("photo", options.file);
                const photoData = await GM_XHR({
                    method: "POST",
                    url: uploadUrl,
                    data: form,
                });

                if (photoData.photo == "null" || photoData.photo == "[]") {
                    throw "Image uploading error";
                }

                const photos = await this.saveWallPhoto({
                    group_id: options.group_id,
                    server: photoData.server,
                    photo: photoData.photo,
                    hash: photoData.hash,
                    caption: options.description ?? "",
                    latitude: options.latitude ?? 0,
                    longitude: options.longitude ?? 0,
                });

                return photos[0];
            }
        };
    }
}

export default VkApi;
