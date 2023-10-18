export interface ViewJson {
	version: string;
	title: string;
	graph: object;
}

export interface Session {
	tabs: Array<TabContent>;
	state: any;
	mainGraph: any;
}
