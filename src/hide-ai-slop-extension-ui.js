const { h1, h3, table, div, tr, td, th, input, text, i } = van.tags

class InterfaceElementsBuilder {
	constructor() {}

	createContainer() {
		return div(this.createHeader(), this.createDedication())
	}

	createHeader() {
		return h1('Hide AI Slop')
	}

	createDedication() {
		return h3('With ❤️ to Hania')
	}
}

const interfaceElementsBuilder = new InterfaceElementsBuilder()
van.add(document.body, interfaceElementsBuilder.createContainer())
