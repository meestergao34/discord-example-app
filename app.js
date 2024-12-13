import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import { getPlayerPuuid, getPlayerRiotID, fetchMatchHistory, fetchGame, fetchSummonerID, fetchRankedDetails, retrieveSoloTFTRanked, fetchInCurrentGame } from './tftplayers.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;


/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
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

    // "test" command
    if (name === 'test') {
      let user;
      async function fetchData() {
        try {
          const response = await fetch(`https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/GTFX_027pWmIddJ6L2J-xgp9OuxophllT3MB8kgO5sxjj40Ge9HI8UBNeqnPs3IzaWxe1tEzqmrPWA/ids?start=0&count=1&api_key=${process.env.RIOT_API_KEY}`)
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          return data
        } catch (error) {
          console.error('Error:', error); // Handle errors
          return null
        }
      }

      try {
        const result = await fetchData()
        const participants = result.info.participants;
        const dopedong = 'p1LCebVw1ogrwAHoN3nlGUF87GYfVYyjvMPPq7H9FRiuAUHmEm0OBllYXzu1KuNqKGLXoolMmTEYQA'
        user = participants.find(u => u.puuid === dopedong)
        console.log(user.riotIdGameName)
        // Send a message into the channel where command was triggered from
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            // Fetches a random emoji to send from a helper function
            content: `${user.riotIdGameName} placed ${user.placement}`,
          },
        });
      } catch (error) {
        console.error('Error:', error); // Handle errors
          return null
      }

       
    }

    if (name === 'tft') {
      const playerInput = data.options[0].value;
      const playerRiotID = getPlayerRiotID(playerInput)
      const user = getPlayerPuuid(playerRiotID)
      try {
        const matchID = await fetchMatchHistory(user)
        const matchDetails = await fetchGame(matchID)
        const summonerID = await fetchSummonerID(user)
        const rankedDetails = await fetchRankedDetails(summonerID)
        const inCurrentGame = await fetchInCurrentGame(user)
        const gameInProgress = inCurrentGame ? 'In Game' : 'Not In Game'
        const soloRankedDetails = retrieveSoloTFTRanked(rankedDetails)
        const participants = matchDetails.info.participants;
        const userMatchDetails = participants.find(u => u.puuid === user)
        // Send a message into the channel where command was triggered from
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            // Game and Ranked details
            content: `${userMatchDetails.riotIdGameName} placed ${userMatchDetails.placement}
            Rank: ${soloRankedDetails.tier} ${soloRankedDetails.rank} - ${soloRankedDetails.leaguePoints} LP
            Status: ${gameInProgress}`,
          },
        });
      } catch (error) {
        console.error('Error:', error); // Handle errors
          return null
      }
      }
    
    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
