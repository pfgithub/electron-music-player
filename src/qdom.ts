export function $scss(data: TemplateStringsArray) {
    const styleValue = data[0];
    const styleElem = document.createElement("style");
    styleElem.appendChild(document.createTextNode(styleValue));
    document.head.appendChild(styleElem);
}
