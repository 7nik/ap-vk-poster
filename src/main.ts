import type { SvelteComponent, mount } from 'svelte';
import App from './App.svelte';
// import SETTINGS from "./settings";

const style = document.createElement("style");
style.textContent = `
	#share-vk {
		margin: 0px 10px;
		/* turn grey filling into black */
		filter: contrast(2);
		vertical-align: middle;
		display: inline-block;
		height: 32px;
	}
	#share-vk svg {
		fill: var(--messages-users-name, #808080);
	}
`;
document.head.append(style);

const btn = document.createElement("a");
btn.id = "share-vk";
btn.href = "#";
btn.title = "Сделать пост в ВК с этой картинкой";
btn.innerHTML =
	`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
		<path d="M11.1 0h9.8C29.9 0 32 2.1 32 11.1v9.8c0 9-2.1 11.1-11.1 11.1h-9.8C2.1 32 0 29.9 0 20.9v-9.8C0 2.1 2.1 0 11.1 0m15.1 11c.2-.5 0-.8-.7-.8h-2.3c-.6 0-.9.3-1 .6 0 0-1.2 2.9-2.9 4.8-.6.5-.8.7-1.1.7-.2 0-.4-.2-.4-.7V11c0-.6-.1-.8-.6-.8h-3.7c-.4 0-.6.2-.6.5 0 .6.8.7.9 2.3v3.4c0 .8-.1.9-.4.9-.8 0-2.7-2.9-3.9-6.2-.2-.7-.4-.9-1-.9H6.2c-.7 0-.8.3-.8.6 0 .6.8 3.7 3.6 7.8 2 2.7 4.7 4.2 7.2 4.2 1.4 0 1.6-.3 1.6-.9v-2.1c0-.6.2-.8.6-.8.4 0 1 .2 2.4 1.5 1.5 1.6 1.8 2.3 2.7 2.3h2.3c.7 0 1-.3.8-1-.2-.6-.9-1.6-1.9-2.7-.6-.6-1.4-1.3-1.6-1.7-.4-.4-.3-.6 0-1 0 0 2.8-4 3.1-5.4M11.1 0Z"/>
	</svg>`;
btn.onclick = startApp;

// @ts-ignore
// AnimePictures?.hotkeys?.push({
// 	descr: "make post to vk",
// 	// @ts-ignore
// 	hotkey: SETTINGS.hotkey,
// 	pages: ["/pictures/view_post"],
// 	selectors: [],
// 	action: startApp,
// }, {
// 	descr: "decline making of VK post",
// 	hotkey: "Escape",
// 	pages: ["/"], // all pages
// 	selectors: [],
// 	action: () => app.$destroy(),
// });

function isDarkTheme () {
	return getComputedStyle(document.documentElement)
    	.getPropertyValue("--messages-users-name") === "#fff";
}

let app: SvelteComponent;
function startApp (ev: Event) {
	ev.preventDefault();
	app = mount(App, {
    		target: document.body,
    		props: {
    			darkTheme: isDarkTheme(),
    			close: () => app.$destroy(),
    		},
    	});
}

// add the button
setInterval(() => {
	if (!document.body.contains(btn)) {
		document.querySelector("span.rating")?.append(btn);
	}
}, 300);
