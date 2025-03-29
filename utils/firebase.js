// Import the necessary Firebase modules

export async function fbUpdateUserTimeStamp(riotName) {
  try {
    const response = await fetch(
      `https://tftdiscord-772bc-default-rtdb.firebaseio.com/tftUsers/${riotName}/lastViewed.json`,
      { method: "PUT", body: JSON.stringify(Date.now()) }
    );

    if (!response.ok) {
      return new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("error: ", error);
    alert("failed to update user lastviewed date to firebase db");
    return null;
  }
}

export async function fbUpdateUserRank(riotName, soloRankedDetails) {
  try {
    const response = await fetch(
      `https://tftdiscord-772bc-default-rtdb.firebaseio.com/tftUsers/${riotName}/rankedDetails.json`,
      {
        method: "PATCH",
        body: JSON.stringify({
          leaguePoints: soloRankedDetails.leaguePoints,
          rank: soloRankedDetails.rank,
          tier: soloRankedDetails.tier,
        }),
      }
    );

    if (!response.ok) {
      return new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("error: ", error);
    alert("failed to update user lastviewed date to firebase db");
    return null;
  }
}

export async function fbFetchUsers() {
  try {
    const response = await fetch(
      "https://tftdiscord-772bc-default-rtdb.firebaseio.com/tftUsers.json"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    const users = Object.values(data);
    return users;
  } catch (error) {
    console.error("error: ", error);
    alert("failed to fetch users from firebase db");
    return null;
  }
}

export async function fbAddUser(
  riotId,
  riotTag,
  puuid,
  summonerID,
  rankedDetails
) {
  try {
    const response = await fetch(
      `https://tftdiscord-772bc-default-rtdb.firebaseio.com/tftUsers/${
        riotId + riotTag
      }.json`,
      {
        method: "PUT",
        body: JSON.stringify({
          riotId: riotId,
          riotTag: riotTag,
          puuid: puuid,
          summonerID: summonerID,
          lastViewed: Date.now(),
          rankedDetails: {
            rank: rankedDetails.rank,
            tier: rankedDetails.tier,
            leaguePoints: rankedDetails.leaguePoints,
          },
        }),
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("error: ", error);
    alert("failed to save user to firebase db");
    return null;
  }
}

export async function fbFindRiotNameByPUUID(puuid) {
  try {
    const response = await fetch(
      `https://tftdiscord-772bc-default-rtdb.firebaseio.com/tftUsers.json`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    const users = Object.values(data);
    const user = users.find((user) => user.puuid === puuid);
    return user.riotId;
  } catch (error) {
    console.error("error: ", error);
    alert("failed to find user by puuid in firebase db");
    return null;
  }
}

export async function fbDeleteUser(riotName) {
  try {
    const response = await fetch(
      `https://tftdiscord-772bc-default-rtdb.firebaseio.com/tftUsers/${riotName}.json`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    console.error("error: ", error);
    alert("failed to delete user from firebase db");
    return null;
  }
}

export async function fbGetAllUsers() {
  try {
    const response = await fetch(
      "https://tftdiscord-772bc-default-rtdb.firebaseio.com/tftUsers.json"
    );
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = response.json();
    return data;
  } catch (err) {
    console.log("Error due to ", err);
    return null;
  }
}
