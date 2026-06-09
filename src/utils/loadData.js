import loadCsv from "$utils/loadCsv.js";
import loadJson from "$utils/loadJson.js";
import chartData from "$runes/chartData.svelte.js";

export default async function loadData() {
	const dnpRaw = await loadCsv("assets/data/web-dnp-players.csv");
	const playersRaw = await loadCsv("assets/data/web-players.csv");
	const heads = await loadJson("assets/data/web-heads.json");

	const dnp = dnpRaw.map((d) => ({
		...d,
		season: +d.season,
		dpm: +d.dpm,
		round: +d.round,
		game: +d.game
	}));

	const players = playersRaw.map((d) => ({
		...d,
		season: +d.season,
		dpm: +d.dpm
	}));

	chartData.dnp = dnp;
	chartData.players = players;
	chartData.heads = heads;
}
