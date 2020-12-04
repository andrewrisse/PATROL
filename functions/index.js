const functions = require("firebase-functions");
const axios = require("axios");
const moment = require("moment");

const getCountrySlugs = () => {
  const urlForCountrySlugs = "https://api.covid19api.com/countries";
  return axios.get(urlForCountrySlugs).then((response) => {
    return response.data;
  });
};

const getSpecificCountrySlug = async (country) => {
  let countrySlugs = await getCountrySlugs();
  for (let i = 0; i < countrySlugs.length; i++) {
    if (countrySlugs[i]["Country"] === country) {
      return countrySlugs[i]["Slug"];
    }
  }
  throw new functions.https.HttpsError(
    "internal",
    "Error getting country slugs"
  );
};

const parseForCityStateDataOverTime = (dataArr, city = undefined, state) => {
  let parsedStateDataArr = [];
  for (let i = 0; i < dataArr.length; i++) {
    //Get specific state data out of dataArr
    if (dataArr[i]["Province"] === state) {
      parsedStateDataArr.push(dataArr[i]);
    }
  }

  if (city) {
    let parsedCityDataArr = [];
    for (let j = 0; j < parsedStateDataArr.length; j++) {
      //Get specific city data
      if (parsedStateDataArr[j]["City"] === city) {
        parsedCityDataArr.push(parsedStateDataArr[j]);
      }
    }

    return parsedCityDataArr.length > 0
      ? parsedCityDataArr
      : parsedStateDataArr;
  } else {
    return parsedStateDataArr;
  }
};

const getSpecificLocationData = async (requestData) => {
  let country = requestData.country;
  const state = requestData.administrative_area_level_1;
  const city = requestData.locality;

  if (country === "United States") {
    country = "United States of America";
  }

  const slug = await getSpecificCountrySlug(country);
  let yesterday = moment().subtract(1, "days").startOf("day").format();
  let twoWeeksAgo = moment().subtract(2, "weeks").startOf("day").format();
  yesterday = yesterday.slice(0, yesterday.indexOf("+"));
  twoWeeksAgo = twoWeeksAgo.slice(0, twoWeeksAgo.indexOf("+"));
  const urlForCountryData = `https://api.covid19api.com/country/${slug}/status/confirmed?from=${twoWeeksAgo}Z&to=${yesterday}Z`;
  return axios.get(urlForCountryData).then((response) => {
    const dataToReturn = parseForCityStateDataOverTime(
      response.data,
      city,
      state
    );
    return dataToReturn;
  });
};


//Returns location data for the city and state over the last two weeks. If data for the city is not available,
// it returns all state data
exports.getLocationData = functions.https.onRequest(async (req, res) => {
  const data = await getSpecificLocationData(req.body);
  res.send(data);
});

exports.getGlobalTrends = functions.https.onRequest((req, res) => {
  const urlForCountryData = `https://api.covid19api.com/summary`;
  axios
    .get(urlForCountryData)
    .then((response) => {
      res.send(response.data["Global"]);
      return;
    })
    .catch((err) => {
      throw new functions.https.HttpsError(
        "internal",
        `Error getting global trends: ${err.message}`
      );
    });
});

exports.getNews = functions.https.onRequest(async(req, res) => {
  const twoWeeksAgo = moment().subtract(2,"weeks").startOf("day").format("YYYY[-]MM[-]DD")
  const newsUrl1 = `http://newsapi.org/v2/top-headlines?country=us&q=covid&from=${twoWeeksAgo}&sortBy=publishedAt&apiKey=${functions.config().news.key}`
  const newsUrl2 = `http://newsapi.org/v2/top-headlines?country=us&q=coronavirus&from=${twoWeeksAgo}&sortBy=publishedAt&apiKey=${functions.config().news.key}`


  return axios.get(newsUrl1).then(response1 => {
    const result1 = response1.data;
    return axios.get(newsUrl2).then(response2 => {
      const result2 = response2.data;
      const combinedResult = [...result1.articles, ...result2.articles];
      const finalResults = [];
      for( let i = 0; i< combinedResult.length; i++){
        finalResults.push({title:combinedResult[i].title, url: combinedResult[i].url, photo: combinedResult[i].urlToImage});
      }
      res.send(finalResults)
      return;
    })

  })
})


