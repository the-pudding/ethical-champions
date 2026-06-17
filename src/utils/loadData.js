import loadCsv from "$utils/loadCsv.js";
import loadJson from "$utils/loadJson.js";
import chartData from "$runes/chartData.svelte.js";

export default async function loadData() {
	const dnpRaw = await loadCsv("assets/data/web-affected-players.csv");
	const playersRaw = await loadCsv("assets/data/web-players.csv");
	const seasonsRaw = await loadCsv("assets/data/web-dnp-by-season.csv");
	const heads = await loadJson("assets/data/web-heads.json");

	const dnp = dnpRaw.map((d) => ({
		...d,
		season: +d.season,
		dpm: +d.dpm,
		missingDpm: +d.dpm * +d.amount,
		round: +d.round,
		game: +d.game
	}));

	const players = playersRaw.map((d) => ({
		...d,
		season: +d.season,
		dpm: +d.dpm
	}));

	const seasons = seasonsRaw.map((d) => ({
		season: +d.season,
		winner: d.winner
	}));

	chartData.dnp = dnp;
	chartData.players = players;
	chartData.heads = heads;
	chartData.seasons = seasons;
}
