import { StatusBar } from "expo-status-bar";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import * as Location from "expo-location";
import "react-native-get-random-values";
import { v4 as uuid } from "uuid";
import { Fontisto } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Rain: "rain",
  Snow: "snow",
};

export default function App() {
  const [errorMsg, setErrorMsg] = useState(null);
  const [region, setRegion] = useState("loading...");
  const [days, setDays] = useState([]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        console.error(errorMsg);
        return;
      }

      const {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync({ accuracy: 5 });
      const location = await Location.reverseGeocodeAsync(
        { latitude, longitude },
        { useGoogleMaps: false }
      );
      setRegion(location[0].region);

      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${process.env.EXPO_PUBLIC_WEATHER_API}&units=metric`
      );
      const weatherJson = await weatherResponse.json();
      setDays(
        weatherJson.list.filter((day) => {
          if (day.dt_txt.includes("06:00:00")) return day;
        })
      );
    })();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.city}>
        <Text style={styles.cityName}>{region}</Text>
      </View>
      <ScrollView
        pagingEnabled
        horizontal
        contentContainerStyle={styles.weather}
        showsHorizontalScrollIndicator={false}
      >
        {days.length === 0 ? (
          <View style={styles.day}>
            <ActivityIndicator color="white" size="large" />
          </View>
        ) : (
          days.map((day, index) => {
            return (
              <View key={uuid()} style={styles.day}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text style={styles.temp}>
                    {parseFloat(day.main.temp).toFixed(1)}
                  </Text>
                  <Fontisto
                    name={icons[day.weather[0].main]}
                    size={38}
                    color="black"
                  />
                </View>
                <Text style={styles.description}>{day.weather[0].main}</Text>
                <Text style={styles.tinyText}>
                  {day.weather[0].description}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "tomato",
  },
  city: {
    flex: 1.2,
    alignItems: "center",
    justifyContent: "center",
  },
  cityName: {
    fontSize: 68,
    fontWeight: "500",
  },
  weather: {},
  day: {
    width: SCREEN_WIDTH,
    alignItems: "center",
  },
  temp: {
    marginTop: 50,
    fontSize: 128,
  },
  description: {
    marginTop: -30,
    fontSize: 60,
  },
  tinyText: {
    fontSize: 20,
  },
});
