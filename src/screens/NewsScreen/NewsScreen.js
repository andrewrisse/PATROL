import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import styles from "./styles";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import axios from "axios";
import * as Linking from "expo-linking";

import { Card } from "react-native-elements";
import { Alert } from "react-native";

const NewsScreen = () => {
  const [articles, setArticles] = useState();
  const [loading, setLoading] = useState(false);

  const getNewsArticles = async () => {
    const newsUrl =
      "https://us-central1-patrol-677d2.cloudfunctions.net/getNews";
    await axios.get(newsUrl).then((response) => {
      setArticles(response.data);
    });
  };

  useEffect(() => {
    setLoading(true);
    getNewsArticles()
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        Alert.alert("Error getting news articles!");
      });
  }, []);

  const handlePress = async (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size={"large"} color={"#f5ab33"} />
      ) : (
        <KeyboardAwareScrollView
          style={{ flex: 1, width: "100%" }}
          keyboardShouldPersistTaps="always"
        >
          <Text style={styles.title} title={"TopHeadlines"}>
            Top Headlines
          </Text>
          {articles &&
            articles.map((article, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handlePress(article.url)}
              >
                <Card>
                  <Card.Title>{article.title}</Card.Title>
                  <Card.Divider />
                  {article.photo && (
                    <Card.Image source={{ uri: article.photo }} />
                  )}
                </Card>
              </TouchableOpacity>
            ))}
        </KeyboardAwareScrollView>
      )}
    </View>
  );
};

export default NewsScreen;
