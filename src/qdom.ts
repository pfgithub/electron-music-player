export function $scss(data: TemplateStringsArray) {
    const styleValue = data[0];
    const styleElem = el.style(styleValue);
    document.head.appendChild(styleElem);
}

export type ElementResolveable =
    | Node
    | string
    | ElementResolveableArray
    | null
    | undefined
    | false
    | QElement;
export interface ElementResolveableArray extends Array<ElementResolveable> {} // avoid circular reference
export class QElement {
    node: ElementResolveable;
}

export class TextBind {
    constructor(_v: string) {}
}

export type BindAttributes<ElementType extends HTMLElement> = {
    [event in keyof HTMLElementEventMap]: (
        this: ElementType,
        ev: HTMLElementEventMap[event],
    ) => void;
};

export type ElementAttributes<ElementType extends HTMLElement> = {
    [key: string]: string | TextBind | undefined | BindAttributes<ElementType>;
    // $: BindAttributes<ElementType>;
    // $capture: BindAttributes<ElementType>;
};
/*
If we weren't restricted by typescript, the syntax would be

attribute: "value"
$click: (e) => {}
$capture_click: (e) => {}

but we instead must:

attribute: "value"
$: {click: (e) => {}}
$capture: {click: (e) => {}}
*/

export function tb(
    literals: TemplateStringsArray,
    ...placeholders: string[]
): TextBind {
    const result = literals.reduce(
        (total, current, i) =>
            total +
            current +
            (Object.prototype.hasOwnProperty.call(placeholders, i)
                ? placeholders[i]
                : ""),
    );
    return new TextBind(result); // in the future we may want nested textbinds
}

export function resolveElement(elem: ElementResolveable): Node[] {
    if (typeof elem === "string") {
        return [document.createTextNode(elem)];
    }
    if (Array.isArray(elem)) {
        return elem.flatMap(e => resolveElement(e));
        // WARNING: 2019 feature that could be replicated easily with
        // .reduce((t, e) => (t.push(...e), t), [])
    }
    if (elem == null || elem === false) {
        return [];
    }
    if (elem instanceof QElement) {
        return resolveElement(elem.node);
    }
    return [elem];
}

export type ElementCreator<K extends keyof HTMLElementTagNameMap> = (
    params: ElementAttributes<HTMLElementTagNameMap[K]> | ElementResolveable,
    ...children: ElementResolveable[]
) => HTMLElementTagNameMap[K];

export function elementCreator<K extends keyof HTMLElementTagNameMap>(
    key: K,
): ElementCreator<K> {
    return (
        params:
            | ElementAttributes<HTMLElementTagNameMap[K]>
            | ElementResolveable,
        ...children: ElementResolveable[]
    ) => {
        if (
            params instanceof Node ||
            typeof params === "string" ||
            Array.isArray(params) ||
            params == null ||
            params === false ||
            params instanceof QElement
        ) {
            children.push(params);
            params = {};
        }
        let el = document.createElement(key);
        if (params.$) {
            (<(keyof HTMLElementEventMap)[]>Object.keys(params.$)).forEach(
                eventName => {
                    let attrValue = (<BindAttributes<HTMLElementTagNameMap[K]>>(
                        (<ElementAttributes<HTMLElementTagNameMap[K]>>params).$!
                    ))[eventName]; // oh no what have we done
                    el.addEventListener(eventName, <any>attrValue);
                },
            );
            delete params.$;
        }
        if (params.$capture) {
            (<(keyof HTMLElementEventMap)[]>(
                Object.keys(params.$capture)
            )).forEach(eventName => {
                let attrValue = (<BindAttributes<HTMLElementTagNameMap[K]>>(
                    (<ElementAttributes<HTMLElementTagNameMap[K]>>params)
                        .$capture!
                ))[eventName]; // oh no what have we done
                el.addEventListener(eventName, <any>attrValue, {
                    capture: true,
                });
            });
            delete params.$capture;
        }
        Object.keys(params).forEach(attrName => {
            let attrValue = (<ElementAttributes<HTMLElementTagNameMap[K]>>(
                params
            ))[attrName];
            if (attrValue == null) {
                el.removeAttribute(attrName);
                return;
            }
            el.setAttribute(
                attrName,
                attrValue instanceof TextBind ? "textbindtodo" : `${attrValue}`,
            );
        });
        children.forEach(child =>
            resolveElement(child).forEach(resolved => el.appendChild(resolved)),
        );
        return el;
    };
}

export let el: {
    [key in keyof HTMLElementTagNameMap]: ElementCreator<key>;
} = new Proxy(<any>{}, {
    get: (target, key: keyof HTMLElementTagNameMap, reciever) => {
        if (typeof key === "string") {
            return elementCreator(key);
        }
        return Reflect.get(target, key, reciever);
    },
});
