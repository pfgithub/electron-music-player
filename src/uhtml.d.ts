// this is already in node_modules/uhtml/index.d.ts so idk why it's not working

declare module "uhtml" {
	export type TemplateFunction<T> = (
		template: TemplateStringsArray,
		...values: any[]
	) => T;

	export interface Tag<T> extends TemplateFunction<Hole> {
		for(object: object, id?: string): TemplateFunction<T>;
		node: TemplateFunction<T>;
	}

	export type Renderable = Hole | HTMLElement | SVGElement;

	export const html: Tag<HTMLElement>;
	export const svg: Tag<SVGElement>;
	export function render<T extends Node>(
		node: T,
		renderer: (() => Renderable) | Renderable,
	): T;

	/**
	 * Used for internal purposes, should be created using
	 * the `html` or `svg` template tags.
	 */
	export class Hole {
		constructor(type: string, template: TemplateStringsArray, values: any[]);
		readonly type: string;
		readonly template: TemplateStringsArray;
		readonly values: readonly any[];
	}
}