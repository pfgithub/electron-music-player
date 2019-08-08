export type ElementResolveable = Node | string | ElementResolveableArray
export interface ElementResolveableArray extends Array<ElementResolveable> {} // avoid circular reference

export class TextBind {
	constructor(_v: string) {}
}

export type ElementAttributes = {
	[key: string]: string | TextBind
}

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
				: ''),
	)
	return new TextBind(result) // in the future we may want nested textbinds
}

export function resolveElement(elem: ElementResolveable): Node[] {
	if (typeof elem === 'string') {
		return [document.createTextNode(elem)]
	}
	if (Array.isArray(elem)) {
		return elem.flatMap(e => resolveElement(e))
		// WARNING: 2019 feature that could be replicated easily with
		// .reduce((t, e) => (t.push(...e), t), [])
	}
	return [elem]
}

export type ElementCreator<K extends keyof HTMLElementTagNameMap> = (
	params: ElementAttributes | ElementResolveable,
	...children: ElementResolveable[]
) => HTMLElementTagNameMap[K]

export function elementCreator<K extends keyof HTMLElementTagNameMap>(
	key: K,
): ElementCreator<K> {
	return (
		params: ElementAttributes | ElementResolveable,
		...children: ElementResolveable[]
	) => {
		if (
			params instanceof HTMLElement ||
			typeof params === 'string' ||
			params instanceof Text ||
			Array.isArray(params)
		) {
			children.push(params)
			params = {}
		}
		let el = document.createElement(key)
		Object.keys(params).forEach(attrName => {
			let attrValue = (<ElementAttributes>params)[attrName]
			el.setAttribute(
				attrName,
				attrValue instanceof TextBind ? 'textbindtodo' : attrValue,
			)
		})
		children.forEach(child =>
			resolveElement(child).forEach(resolved => el.appendChild(resolved)),
		)
		return el
	}
}

export let el: {
	[key in keyof HTMLElementTagNameMap]: ElementCreator<key>
} = new Proxy(<any>{}, {
	get: (target, key: keyof HTMLElementTagNameMap, reciever) => {
		if (typeof key === 'string') {
			return elementCreator(key)
		}
		return Reflect.get(target, key, reciever)
	},
})
