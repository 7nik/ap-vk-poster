<script lang="ts">
    import Button from "./Button.svelte";
	import SETTINGS from "./settings";
	import { plural, getPostInfo, proposeDateByStep, proposeDateBySchedule, downscale } from "./Utils";
	import VkApi from "./vkApi";

	export let close = () => {};

	type PostPreview = {
		preview: string,
		link: string,
		date: number,
	};

	const timezone = new Date().getTimezoneOffset();
	let ready = false;
	let postponed: boolean | null = true; // null - cannot postpone
	let previews: PostPreview[] = [];
	let pubtimeStr: string;
	$: pubtimeDate = pubtimeStr ? new Date(pubtimeStr+"Z") : null;
	let offset = "";
	$: {
		const lastPostDate = previews[0]?.link
			? previews[0]?.date
			: previews[1]?.date;
		if (!postponed || !lastPostDate || !pubtimeDate) {
			offset = "";
			break $;
		}
		let diff = pubtimeDate.getTime() - lastPostDate;
		let str: (string|number)[] = [" после последнего поста"];
		let n;
		if (diff < 60000) { // less than 1 minute
			offset = "раньше последнего  поста";
			break $;
		}
		diff = Math.round(diff/60000); // to minutes
		n = diff%60;
		if (n && diff) {
			str = [" ", n, " ", plural(n, ["минуту", "минуты", "минут"]), ...str];
		}
		diff = Math.floor(diff/60); // hours
		n = diff%24;
		if (n) {
			str = [" ", n, " ", plural(n, ["час", "часа", "часов"]), ...str];
		}
		diff = Math.floor(diff/24); // days
		if (diff) {
			str = [diff, " ", plural(diff, ["день", "дня", "дней"]), ...str];
		}
		str = ["через ", ...str];
		offset = str.join("");
	}

	// get post info
	let message = "";
	let previewUrl = "";
	let source = "";
	let error = "";

	let picture: Promise<File> = getPostInfo().then(async (post) => {
		({ message, previewUrl, source, error } = post);
		let resp: GM.Response<void> = await GM.xmlHttpRequest({
			method: "GET",
			url: previewUrl,
			// @ts-ignore - it's supported in TM
			responseType: "arraybuffer",
		}) as any;
		if (resp.status < 400) {
			const file = new File([resp.response], "photo.jpg", { type: "image/jpeg" });
			if (SETTINGS.imgSize === "orig" && SETTINGS.imgScale) {
				return downscale(file, SETTINGS.imgScale);
			}
			return file;
		}
		resp = await GM.xmlHttpRequest({
			method: "GET",
			url: `${previewUrl}.avif`,
			// @ts-ignore - it's supported in TM
			responseType: "arraybuffer",
		}) as any;
		if (resp.status < 400) {
			error = "Ошибка скачивания картинки";
		}
		const file = new File([resp.response], "photo.avif", { type: "image/jpeg" });
		if (SETTINGS.imgSize === "orig" && SETTINGS.imgScale) {
			return downscale(file, SETTINGS.imgScale);
		}
		// VK doesn't understands avif so convert it
		return downscale(file);
	});

	const Vk = new VkApi(SETTINGS.APP_ID, ["photos", "wall"]);

	// upload photo
	let wallPhoto = picture.then((pic) => Vk.photos.uploadWallPhoto({
		file: pic,
		group_id: SETTINGS.gid,
		description: source,
	})).then((photo) => { ready = true; return photo; });

	(async function init() {
		// get date of the last scheduled post or current date
		let posts;
		try {
			posts = (await Vk.wall.get({
				owner_id: -SETTINGS.gid,
				filter: "postponed",
				count: 100,
			})).items;
		} catch (ex: any) {
            if (ex?.message?.startsWith("#15:")) {
                // user cannot make postponed posts here
                postponed = null;
				return;
            }
			console.error(ex);
			error = "Ошибка подключения к ВК";
			return;
		}
		posts.sort((a, b) => b.date - a.date);

		const scheduler = SETTINGS.scheduleMethod === "step"
			? proposeDateByStep
			: proposeDateBySchedule;
		pubtimeStr = scheduler(posts[0]?.date*1000).toISOString().slice(0, -1);

		await picture;
		// generate previews of scheduled posts including the current one
		previews = posts.map(post => {
			if (!post.attachments) return null;
			for (let att of post.attachments) {
				if (att.type == "photo") {
					const photo = att.photo.sizes.find(s => s.type === "m");
					if (!photo) return null;
					return {
						preview: photo.url,
						link: `https://vk.com/wall${post.owner_id}_${post.id}`,
						date: (post.date - timezone*60)*1000
					}
				}
			}
			return null;
		}).filter((p): p is PostPreview => p !== null);
		previews.unshift({
			preview: previewUrl,
			link: "",
			date: pubtimeDate?.getTime() ?? 0,
		});
		if (pubtimeDate) {
			previews = previews.sort((a, b) => b.date - a.date);
		}
	})();

	async function makePost() {
		// post the message and the picture to vk
		try {
			const { id, owner_id} = await wallPhoto;
			const publish_date = postponed && pubtimeDate
				? pubtimeDate.getTime()/1000 + timezone*60
				: 0;
			await Vk.wall.post({
				owner_id: -SETTINGS.gid,
				from_group: 1,
				message: message,
				signed: SETTINGS.signPost ? 1 : 0,
				attachments: `photo${owner_id}_${id}`,
				publish_date,
				copyright: source,
				topic_id: SETTINGS.addTopic ? 1 /* Art category */ : 0
			});
			close();
		} catch (ex: any) {
			console.error(ex);
			alert(ex.message ?? ex);
		}
	}
</script>

<div class="container">
    <textarea bind:value={message}></textarea>
    <!-- svelte-ignore a11y-img-redundant-alt -->
    <!-- <img src="{previewUrl}" alt="Picture to post"/> -->
    <div class="publish_date">
        <label>
            <input type="checkbox" bind:checked={postponed} disabled={postponed===null}/>
            отложенная запись
        </label>
		<Button
			on:click={makePost}
			disabled={!ready}
			error={error !== ""}
		>
			{error || (ready ? "Опубликовать пост" : "Подготовка")}
		</Button>
        <br>
        <input type="datetime-local" bind:value={pubtimeStr} disabled={!postponed} />
        <br>
        <span>{offset}</span>
    </div>
	<br>
    {#if previews.length > 1}
        Список запланированных постов:
        <div class="previews">
            {#each previews as preview (preview)}
                {#if preview.link}
                    <a href={preview.link} target="_blank"
                        title={new Date(preview.date).toUTCString()}
                    >
                        <img src={preview.preview} alt="Post preview">
                    </a>
                {:else}
                    <div>
                        <img src={preview.preview} alt="Post preview"
                            title={new Date(preview.date).toUTCString()}
                        >
                    </div>
                {/if}
            {/each}
        </div>
    {/if}
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
	}
	img {
		max-width: 130px;
		max-height: 130px;
	}
	textarea {
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
		min-height: 120px;
	}
	.publish_date {
		display: inline-block;
		vertical-align: top;
		margin-top: 5px;
		line-height: 2em;
	}
	.publish_date input {
		color: black;
	}
	.publish_date :global button {
		margin-top: 5px;
		float: right;
	}
	.previews {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 5px;
		max-height: 280px;
		overflow-y: auto;
	}
	.previews :last-child {
		margin-right: auto;
	}
	.previews > div {
		border: 3px solid green;
		margin-bottom: 5px;
		line-height: 0;
	}
</style>
