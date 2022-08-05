import FeatureLayer from "@arcgis/core/layers/FeatureLayer"

export const persons = new FeatureLayer({
	url: "https://atviras.vplanas.lt/arcgis/rest/services/VilniausDNR/VilniausDNR/MapServer/3",
	outFields: ["*"],
	title: "Asmenys",
})

export const biography = new FeatureLayer({
	url: "https://atviras.vplanas.lt/arcgis/rest/services/VilniausDNR/VilniausDNR/MapServer/4",
	outFields: ["*"],
	title: "Biografija",
})