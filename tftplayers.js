const TFTPlayers = {
    DOPED0NG: {
      riotID: 'DOPED0NG',
      riotTag: '6317',
      puuid: 'p1LCebVw1ogrwAHoN3nlGUF87GYfVYyjvMPPq7H9FRiuAUHmEm0OBllYXzu1KuNqKGLXoolMmTEYQA'
    },
    BigBird: {
      riotID: 'Big Bird',
      riotTag: 'jwong',
      puuid: 'GTFX_027pWmIddJ6L2J-xgp9OuxophllT3MB8kgO5sxjj40Ge9HI8UBNeqnPs3IzaWxe1tEzqmrPWA'
    },
    AustinoGambino: {
      riotID: 'austinogambino',
      riotTag: '4fun',
      puuid: 'f6CBRoizf_pbfJXHan5qrpSzuDTCTTRQ9X31-kbRabiJAu7LhFwdtbwZaaW-c0k2UwM3KA-JtjYgrQ'
    },
    mikey: {
      riotID: 'mikey',
      riotTag: 'dog',
      puuid: 'N9uK-01gw39oEikaWBsieBSJxONpFzfsqR6jscdSfYZnnd8MqbKrBTU-QgfWySUwdwmQdcmIN3vc8g'
    },
    mommykisser: {
      riotID: 'm0mmykisser',
      riotTag: 'mwah',
      puuid: 'mZMkotKdBv6CzsA984SeAO9I9MD84tjaI8lkk0OhV8Bt9kLcaAqz3Zq444KTNz5_sktglUV2UHYssA'
    },
    SillySalmon: {
      riotID: 'Silly Salmon',
      riotTag: 'uwu',
      puuid: 'D1sr9N3AiGdfTMrSSu-Zkof0zuLjYTOTPkY1Jw_Fq8ummVt7NjeoF83g0Yx2sIi1OxRjCShQBzK1_w'
    },
    Bubbaa: {
      riotID: 'Bubbaa',
      riotTag: 'NA1',
      puuid: 'R45svvw8boWvWDEt8AZ74NFuOYJaPaRTT2CVHCBHjByV_vbiNxYeOnGYhN2EV17O1NQUkvDmcVzk8g'
    }
  };

export function getTFTPlayers() {
    return Object.keys(TFTPlayers);
}

// Function to convert TFT players object to an array
function convertTFTPlayersToArray(players) {
  return Object.keys(players).map(key => players[key]);
}

// Function to convert TFT players object to an array with identifiers
function convertTFTPlayersToArrayWithIdentifiers(players) {
  return Object.keys(players).map(key => ({ identifier: key, ...players[key] }));
}

export function getPlayerRiotID(playerInput) {
  const data = convertTFTPlayersToArrayWithIdentifiers(TFTPlayers)
  for (const key in data){
    if (data[key].identifier.toLowerCase() === playerInput.toLowerCase() ) {
      return data[key].riotID;
    }
  }
  return null;
}

export function getPlayerPuuid(riotID) {
  const data = convertTFTPlayersToArray(TFTPlayers)
  for (const key in data){
    if (data[key].riotID.toLowerCase() === riotID.toLowerCase() ) {
      return data[key].puuid;
    }
  }
  return null;
}

export function retrieveSoloTFTRanked(rankedDetails) {
  for (const key in rankedDetails) {
    if (rankedDetails[key].queueType === "RANKED_TFT"){
      return rankedDetails[key]
    }
  }
}

// RIOT API Requests
/**
 * Input: RIOT puuid 
 * Output: Most recent matchID
*/
export async function fetchMatchHistory(puuid) {
  try {
    const response = await fetch(`https://americas.api.riotgames.com/tft/match/v1/matches/by-puuid/${puuid}/ids?start=0&count=1&api_key=${process.env.RIOT_API_KEY}`)
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
/**
 * Input: RIOT matchID 
 * Output: Recent match details
*/
export async function fetchGame(matchID) {
  try {
    const response = await fetch(`https://americas.api.riotgames.com/tft/match/v1/matches/${matchID}?api_key=${process.env.RIOT_API_KEY}`)
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
/**
 * Input: RIOT puuid 
 * Output: Summoner ID
*/
export async function fetchSummonerID(puuid) {
  try {
    const response = await fetch(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}?api_key=${process.env.RIOT_API_KEY}`)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data.id
  } catch (error) {
    console.error('Error:', error); // Handle errors
    return null
  }
}
/**
 * Input: RIOT Summoner ID 
 * Output: Ranked Details
*/
export async function fetchRankedDetails(summonerID) {
  try {
    const response = await fetch(`https://na1.api.riotgames.com/tft/league/v1/entries/by-summoner/${summonerID}?api_key=${process.env.RIOT_API_KEY}`)
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
/**
 * Input: RIOT puuid 
 * Output: Boolean if user is in game
*/
export async function fetchInCurrentGame(puuid) {
  try {
    const response = await fetch(`https://na1.api.riotgames.com/lol/spectator/tft/v5/active-games/by-puuid/${puuid}?api_key=${process.env.RIOT_API_KEY}`)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (data.gameId) {
      return true
    }
    else{
      return false
    }
  } catch (error) {
    console.error('Error:', error); // Handle errors
    return null
  }
}


