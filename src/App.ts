import { $scss } from "./qdom";

$scss`
@font-face {
  font-family: 'buttons';
  src: url('font/buttons.eot');
  src: url('font/buttons.eot') format('embedded-opentype'),
       url('font/buttons.woff2') format('woff2'),
       url('font/buttons.woff') format('woff'),
       url('font/buttons.ttf') format('truetype'),
       url('font/buttons.svg') format('svg');
  font-weight: normal;
  font-style: normal;
}
.fonticon {
	font-family: "buttons";
}
.menubtn{
	font-size: 1.2em;
	color: var(--foreground);
	width: 60px;
	height: 60px;
	padding: 0;
	margin: 0;
}
.nowplaying {
    background: var(--background);
    border-radius: 0 0 10px 10px;
	position: sticky;
	top: 0;
	display: flex;
	-webkit-app-region: drag;
	& > * {
		-webkit-app-region: no-drag;
	}
}
`;

export function hack() {
    return `
$> /var/bin/sudo hack https://www.google.com/
==== hacking google.com ====
nFDJkfsdo879y8JAPIMOS08uufndijosf987ybakjno
jknfd9y8hsf*Uh0nhuf78ynioujfd8husanjfioacdi
nfjYU80fdsanoj978*(&Hnhodfsainou78fd87asoin

exploting /etc/hosts [==============] done!
hacking dictionary [================] done!
coding vb.net [==============-------] 3 sec
`;
}
