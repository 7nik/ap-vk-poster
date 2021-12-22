import App from './App.svelte';
import SETTINGS from "./settings";

// @ts-ignore
const darkTheme = unsafeWindow.site_theme === "second";

// @ts-ignore
let app: Svelte2TsxComponent;

const a = document.createElement("a");
a.href = "#";
a.title = "Сделать пост в ВК с этой картинкой";
a.innerHTML =
	`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
		<path fill="${darkTheme ? "white" : "black"}" d="M11.1,0 C20.1,0 11.9,0 20.9,0 C29.9,0 32,2.1 32,11.1 C32,20.1 32,11.9 32,20.9 C32,29.9 29.9,32 20.9,32 C11.9,32 20.1,32 11.1,32 C2.1,32 0,29.9 0,20.9 C0,11.9 0,16.1 0,11.1 C0,2.1 2.1,0 11.1,0 M26.2,11 C26.4,10.5 26.2,10.2 25.5,10.2 L23.2,10.2 C22.6,10.2 22.3,10.5 22.2,10.8 C22.2,10.8 21,13.7 19.3,15.6 C18.7,16.1 18.5,16.3 18.2,16.3 C18,16.3 17.8,16.1 17.8,15.6 L17.8,11 C17.8,10.4 17.7,10.2 17.2,10.2 L13.5,10.2 C13.1,10.2 12.9,10.4 12.9,10.7 C12.9,11.3 13.7,11.4 13.8,13 L13.8,16.4 C13.8,17.2 13.7,17.3 13.4,17.3 C12.6,17.3 10.7,14.4 9.5,11.1 C9.3,10.4 9.1,10.2 8.5,10.2 L6.2,10.2 C5.5,10.2 5.4,10.5 5.4,10.8 C5.4,11.4 6.2,14.5 9,18.6 C11,21.3 13.7,22.8 16.2,22.8 C17.6,22.8 17.8,22.5 17.8,21.9 L17.8,19.8 C17.8,19.2 18,19 18.4,19 C18.8,19 19.4,19.2 20.8,20.5 C22.3,22.1 22.6,22.8 23.5,22.8 L25.8,22.8 C26.5,22.8 26.8,22.5 26.6,21.8 C26.4,21.2 25.7,20.2 24.7,19.1 C24.1,18.5 23.3,17.8 23.1,17.4 C22.7,17 22.8,16.8 23.1,16.4 C23.1,16.4 25.9,12.4 26.2,11 M11.1,0 Z"/>
	</svg>`;
a.style.margin = "0 10px";
a.onclick = startApp;

const ya_share2 = document.getElementById("ya_share2");
if (ya_share2) {
	ya_share2.parentNode?.insertBefore(a, ya_share2);
	ya_share2.style.minWidth = "0";
} else {
	console.error("Couldn't find the #ya_share2 element to insert the button");
}

// @ts-ignore
AnimePictures?.hotkeys?.push({
	descr: "make post to vk",
	// @ts-ignore
	hotkey: SETTINGS.hotkey,
	pages: ["/pictures/view_post"],
	selectors: [],
	action: startApp,
}, {
	descr: "decline making of VK post",
	hotkey: "Escape",
	pages: ["/"], // all pages
	selectors: [],
	action: () => app.$destroy(),
});

function startApp (ev: Event) {
	ev.preventDefault();
	app = new App({
		target: document.body,
		props: {
			darkTheme,
			close: () => app.$destroy(),
		},
	});
}
