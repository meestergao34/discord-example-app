/**
 * Input: RIOT ID and RIOT TAG
 * Output: RIOT Account PUUID
 */
export async function fetchPUUID(riotId, riotTag) {
  try {
    const response = await fetch(
      `https://americas.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${riotId}/${riotTag}?api_key=${process.env.REACT_APP_RIOT_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error); // Handle errors
    alert("Failed to fetch Riot Account");
    return null;
  }
}

/**
 * Input: RIOT puuid
 * Output: Most recent matchID
 */
export async function fetchMatchHistory(puuid, start, count) {
  try {
    const response = await fetch(
      `https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}&api_key=${process.env.REACT_APP_RIOT_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error); // Handle errors
    return null;
  }
}

/**
 * Input: RIOT matchID
 * Output: Recent match details
 */
export async function fetchGame(matchID) {
  try {
    const response = await fetch(
      `https://americas.api.riotgames.com/tft/match/v1/matches/${matchID}?api_key=${process.env.REACT_APP_RIOT_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error); // Handle errors
    alert("Error:" + error.message);
    return null;
  }
}

/**
 * Input: RIOT puuid
 * Output: Summoner ID
 */
export async function fetchSummonerID(puuid) {
  try {
    const response = await fetch(
      `https://na1.api.riotgames.com/tft/summoner/v1/summoners/by-puuid/${puuid}?api_key=${process.env.REACT_APP_RIOT_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error("Error:", error); // Handle errors
    return null;
  }
}

/**
 * Input: RIOT Summoner ID
 * Output: Ranked Details
 */
export async function fetchRankedDetails(summonerID) {
  try {
    const response = await fetch(
      `https://na1.api.riotgames.com/tft/league/v1/entries/by-summoner/${summonerID}?api_key=${process.env.REACT_APP_RIOT_API_KEY}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error:", error); // Handle errors
    return null;
  }
}
