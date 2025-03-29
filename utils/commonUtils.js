export const getFormattedDate = (timestamp) => {
  var a = new Date(timestamp);
  var months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  return month + " " + date + " " + year;
};

export const getPlacement = (placement) => {
  switch (placement) {
    case 1:
      return "1st";
    case 2:
      return "2nd";
    case 3:
      return "3rd";
    default:
      return `${placement}th`;
  }
};

export const getComp = (traits) => {
  traits.sort((a, b) => b.num_units - a.num_units);
  return `${traits[0].name}`;
};

export const retrieveSoloTFTRanked = (rankedDetails) => {
  return rankedDetails.find((detail) => detail.queueType === "RANKED_TFT");
};

const tiers = [
  "CHALLENGER",
  "MASTER",
  "DIAMOND",
  "EMERALD",
  "PLATINUM",
  "GOLD",
  "SILVER",
  "BRONZE",
];

const rankings = ["I", "II", "III", "IV"];

export const sortUsers = (users) => {
  return [...users].sort((a, b) => {
    const rankingA = rankings.indexOf(a.rankedDetails.rank);
    const rankingB = rankings.indexOf(b.rankedDetails.rank);
    const tierA = tiers.indexOf(a.rankedDetails.tier);
    const tierB = tiers.indexOf(b.rankedDetails.tier);
    if (tierA !== tierB) {
      return tierA - tierB;
    } else if (rankingA !== rankingB) {
      return rankingA - rankingB;
    }
    return b.rankedDetails.leaguePoints - a.rankedDetails.leaguePoints;
  });
};
