import "dotenv/config";
import { capitalize, InstallGlobalCommands } from "./utils.js";
import { fbFetchUsers } from "./utils/firebase.js";

// Get the player choices from tftplayers.js
async function createPlayerSummonerID() {
  const choices = await fbFetchUsers();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice.riotId + choice.riotTag),
      label: capitalize(choice.riotId + choice.riotTag),
      value: choice.summonerID,
    });
  }

  return commandChoices;
}

async function createPlayerPUUID() {
  const choices = await fbFetchUsers();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice.riotId + choice.riotTag),
      label: capitalize(choice.riotId + choice.riotTag),
      value: choice.puuid,
    });
  }

  return commandChoices;
}

// Modal test command
const REGISTER_COMMAND = {
  name: "register",
  description: "register user",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const LEADERBOARD = {
  name: "leaderboard",
  description: "view tft leaderboard",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

const USER_RANK = {
  name: "tft-rank",
  description: "Return the user's TFT rank",
  options: [
    {
      type: 3,
      name: "user",
      description: "Select player",
      required: true,
      choices: await createPlayerSummonerID(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

const USER_MATCH_HISTORY = {
  name: "match-history",
  description: "Return the user's match history",
  options: [
    {
      type: 3,
      name: "user",
      description: "Select player",
      required: true,
      choices: await createPlayerPUUID(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

const ALL_COMMANDS = [
  USER_RANK,
  USER_MATCH_HISTORY,
  REGISTER_COMMAND,
  LEADERBOARD,
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
