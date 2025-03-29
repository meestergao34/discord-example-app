import "dotenv/config";
import express from "express";
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from "discord-interactions";
import {
  fbFetchUsers,
  fbAddUser,
  fbUpdateUserRank,
  fbFindRiotNameByPUUID,
} from "./utils/firebase.js";
import {
  fetchPUUID,
  fetchSummonerID,
  fetchRankedDetails,
  fetchMatchHistory,
  fetchGame,
} from "./utils/riotAPIs.js";
import { MessageComponentTypes } from "discord-interactions";
import {
  retrieveSoloTFTRanked,
  getFormattedDate,
  getPlacement,
  sortUsers,
} from "./utils/commonUtils.js";

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post(
  "/interactions",
  verifyKeyMiddleware(process.env.PUBLIC_KEY),
  async function (req, res) {
    // Interaction type and data
    const { type, id, data } = req.body;

    /**
     * Handle verification requests
     */
    if (type === InteractionType.PING) {
      return res.send({ type: InteractionResponseType.PONG });
    }

    /**
     * Handle slash command requests
     * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
     */
    if (type === InteractionType.APPLICATION_COMMAND) {
      const { name } = data;

      if (name === "leaderboard") {
        const users = await fbFetchUsers();
        // update each user's rank
        for (let user of users) {
          const rankedDetails = await fetchRankedDetails(user.summonerID);
          const soloRankedDetails = retrieveSoloTFTRanked(rankedDetails);
          fbUpdateUserRank(user.riotId + user.riotTag, soloRankedDetails);
        }
        // refetch users and sort by rank
        const updatedUsers = await fbFetchUsers();
        const sortedUsers = sortUsers(updatedUsers);
        const leaderboardString =
          "\n" +
          sortedUsers
            .map(
              (user, index) =>
                `${index + 1}: ${user.riotId} - ${user.rankedDetails.tier} ${
                  user.rankedDetails.rank
                } ${user.rankedDetails.leaguePoints} LP`
            )
            .join("\n");

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            // Game and Ranked details
            content: "Leaderboard" + leaderboardString,
          },
        });
      }

      if (name === "match-history") {
        const puuid = req.body.data.options[0].value;
        const matchHistory = await fetchMatchHistory(puuid, 0, 3);
        let recentMatchDetails = [];
        for (let match of matchHistory) {
          const matchDetails = await fetchGame(match);
          const formattedDate = getFormattedDate(
            matchDetails.info.game_datetime
          );
          const set = matchDetails.info.tft_set_number;
          let userMatchDetails = matchDetails.info.participants.find(
            (u) => u.puuid === puuid
          );
          userMatchDetails = {
            ...userMatchDetails,
            date: formattedDate,
            tft_set_number: set,
          };
          recentMatchDetails.push(userMatchDetails);
        }
        const matchDetailsString =
          "\n" +
          recentMatchDetails
            .map(
              (match) =>
                `Date: ${match.date} - Placement: ${getPlacement(
                  match.placement
                )}`
            )
            .join("\n");

        const riotName = await fbFindRiotNameByPUUID(puuid);

        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            // Game and Ranked details
            content: `${riotName}` + matchDetailsString,
          },
        });
      }

      if (name === "register") {
        return res.send({
          type: InteractionResponseType.MODAL,
          data: {
            custom_id: "register_modal",
            title: "Register User",
            components: [
              {
                // Text inputs must be inside of an action component
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    // See https://discord.com/developers/docs/interactions/message-components#text-inputs-text-input-structure
                    type: MessageComponentTypes.INPUT_TEXT,
                    custom_id: "riot_id",
                    style: 1,
                    label: "Enter RIOT ID",
                  },
                ],
              },
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: [
                  {
                    type: MessageComponentTypes.INPUT_TEXT,
                    custom_id: "riot_tag",
                    // Bigger text box for input
                    style: 1,
                    label: "Enter RIOT Tag (ex: NA1)",
                  },
                ],
              },
            ],
          },
        });
      }

      if (name === "tft-rank") {
        const summonerID = req.body.data.options[0].value;
        const rankedDetails = await fetchRankedDetails(summonerID);
        const soloRankedDetails = retrieveSoloTFTRanked(rankedDetails);
        // Find user in FB by summonerID and return riotName
        const users = await fbFetchUsers();
        const riotUser = users.find((user) => user.summonerID === summonerID);
        const riotName = riotUser.riotId + riotUser.riotTag;
        fbUpdateUserRank(riotName, soloRankedDetails);
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            // Game and Ranked details
            content: `Player: ${riotUser.riotId} Rank: ${soloRankedDetails.tier} ${soloRankedDetails.rank} ${soloRankedDetails.leaguePoints} LP`,
          },
        });
      }

      console.error(`unknown command: ${name}`);
      return res.status(400).json({ error: "unknown command" });
    }
    /**
     * Handle modal submissions
     */
    if (type === InteractionType.MODAL_SUBMIT) {
      // custom_id of modal
      const modalId = data.custom_id;

      if (modalId === "register_modal") {
        let riotID = data.components.find(
          (input) => input.components[0].custom_id === "riot_id"
        ).components[0].value;
        let riotTag = data.components.find(
          (input) => input.components[0].custom_id === "riot_tag"
        ).components[0].value;

        // Check if user already submitted
        const registeredUsers = await fbFetchUsers();
        const existingUser = registeredUsers.find(
          (user) => user.riotId === riotID && user.riotTag === riotTag
        );
        if (existingUser) {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `User already registered.`,
            },
          });
        }

        const puuid = await fetchPUUID(riotID, riotTag);
        if (puuid) {
          const summonerID = await fetchSummonerID(puuid.puuid);
          const rankedDetails = await fetchRankedDetails(summonerID);
          const soloRankedDetails = retrieveSoloTFTRanked(rankedDetails);
          fbAddUser(
            riotID,
            riotTag,
            puuid.puuid,
            summonerID,
            soloRankedDetails
          );

          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `${riotID}#${riotTag} has been registered.`,
            },
          });
        } else {
          return res.send({
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            data: {
              content: `Incorrect RIOT ID or Tag. Unable to register.`,
            },
          });
        }
      }
    }

    console.error("unknown interaction type", type);
    return res.status(400).json({ error: "unknown interaction type" });
  }
);

app.listen(PORT, () => {
  console.log("Listening on port", PORT);
});
