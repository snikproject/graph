// cytoscape-context-menus extension does not have type hints
export interface MenuItem {
	content: string;
	id: string;
	selector?: "node" | "node:compound" | "edge";
	submenu?: Array<MenuItem>;
	onClickFunction?(event: Event | { target: any }): void;
}
