import MicroModal from "micromodal";
import { Graph } from "../browser/graph";
import { View } from "../browser/view";
import log from "loglevel";

/** Shows how any two subontologies are interconnected. The user chooses two subontologies and gets shown all pairs between them. */
export function subOntologyConnectivity(): void {
	MicroModal.show("subontology-connectivity");
	const form = document.getElementById("subontology-connectivity-form") as HTMLFormElement;
	if (form.listener) {
		return;
	}
	form.listener = async (e: Event) => {
		e.preventDefault();
		MicroModal.close("subontology-connectivity");
		const connect = new View();
		await connect.initialized;
		const subs: Array<string> = [(form[0] as any).value, (form[1] as any).value];
		log.debug(`Showing connectivity between the subontologies ${subs[0]} and ${subs[1]}.`);
		const subGraphs = subs.map((s) => connect.state.cy.nodes(`[source="${s}"]`));
		const connections = subGraphs[0].edgesWith(subGraphs[1]);
		const nodes = connections.connectedNodes();
		Graph.setVisible(connect.state.cy.elements(), false);
		Graph.setVisible(nodes, true);
		Graph.setVisible(nodes.edgesWith(nodes), true);
		nodes
			.layout({
				name: "concentric",
				fit: true,
				levelWidth: function () {
					return 1;
				},

				minNodeSpacing: 60,
				concentric: function (layoutNode: any) {
					if (subGraphs[0].contains(layoutNode)) {
						return 2;
					}
					return 1;
				},
			})
			.run();
	};
	form.addEventListener("submit", form.listener);
}
