import loadCsv from "$utils/loadCsv.js";
import loadJson from "$utils/loadJson.js";
import chartData from "$runes/chartData.svelte.js";

export default async function loadData() {
	const dnpRaw = await loadCsv("assets/data/web-affected-players.csv");
	const playersRaw = await loadCsv("assets/data/web-players.csv");
	const seasonsRaw = await loadCsv("assets/data/web-dnp-by-season.csv");
	const heads = await loadJson("assets/data/web-heads.json");
	const topPlayersRaw = await loadCsv("assets/data/web-top-players.csv");

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

	// season,winner,gameCount,winnerGameCount,dnpCountDpmGt0,oppDpmGte1,winnerDpmGte1,winnerLowMinutesDPMGte1,oppLowMinutesDPMGte1,fieldDpmGte1,fieldLowMinutesDPMGte1
	const seasons = seasonsRaw
		.map((d) => ({
			season: +d.season,
			winner: d.winner,
			gameCount: +d.gameCount,
			winnerGameCount: +d.winnerGameCount,
			dnpCountDpmGt0: +d.dnpCountDpmGt0,
			winnerDpmGte1: +d.winnerDpmGte1,
			oppDpmGte1: +d.oppDpmGte1,
			winnerLowMinutesDPMGte1: +d.winnerLowMinutesDPMGte1,
			oppLowMinutesDPMGte1: +d.oppLowMinutesDPMGte1,
			fieldDpmGte1: +d.fieldDpmGte1,
			fieldLowMinutesDPMGte1: +d.fieldLowMinutesDPMGte1
		}))
		.map((d) => ({
			...d,
			net:
				(d.winnerDpmGte1 +
					d.winnerLowMinutesDPMGte1 -
					(d.oppDpmGte1 + d.oppLowMinutesDPMGte1)) /
				d.winnerGameCount,
			fieldDpmGte1PerGame: d.fieldDpmGte1 / d.gameCount
		}));

	const topPlayers = topPlayersRaw.map((d) => ({
		...d,
		dpm: +d.dpm
	}));

	chartData.dnp = dnp;
	chartData.players = players;
	chartData.heads = heads;
	chartData.seasons = seasons;
	chartData.topPlayers = topPlayers;
}
