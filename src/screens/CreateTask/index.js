import React, { Fragment, useEffect, useState, useRef } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { CalendarList } from 'react-native-calendars';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { v4 as uuidv4 } from 'uuid';
import { Routes } from '@calendar/navigation';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from "expo-notifications";
import * as Permissions from "expo-permissions";

async function getiOSNotificationPermission() {
  const { status } = await Permissions.getAsync(
    Permissions.NOTIFICATIONS
  );
  if (status !== 'granted') {
    await Permissions.askAsync(Permissions.NOTIFICATIONS);
  }
}

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});


const { width: vw } = Dimensions.get('window');
// moment().format('YYYY/MM/DD')

const styles = StyleSheet.create({
  createTaskButton: {
    width: 252,
    height: 48,
    alignSelf: 'center',
    marginTop: 40,
    borderRadius: 5,
    justifyContent: 'center'
  },
  separator: {
    height: 0.5,
    width: '100%',
    backgroundColor: '#979797',
    alignSelf: 'center',
    marginVertical: 20
  },
  notes: {
    color: '#9CAAC4',
    fontSize: 16,
    fontWeight: '600'
  },
  notesContent: {
    height: 0.5,
    width: '100%',
    backgroundColor: '#e8b7d4',
    alignSelf: 'center',
    marginVertical: 20
  },

  title: {
    height: 25,
    borderColor: '#e9765b',
    borderLeftWidth: 1,
    paddingLeft: 8,
    fontSize: 19
  },
  taskContainer: {
    height: 400,
    width: 327,
    alignSelf: 'center',
    borderRadius: 20,
    shadowColor: '#ea4492',
    backgroundColor: '#cfe3d4',
    marginTop: 15,
    shadowOffset: {
      width: 3,
      height: 3
    },
    shadowRadius: 20,
    shadowOpacity: 0.2,
    elevation: 5,
    padding: 22
  },
  calenderContainer: {
    marginTop: 30,
    width: 350,
    height: 350,
    alignSelf: 'center'
  },
  newTask: {
    color: '#f7765b',
    // alignSelf: 'center',
    fontSize: 30,
    // width: 120,
    // height: 60,
    textAlign: 'center'
  },
  backButton: {
    flexDirection: 'row',

    marginTop: 20,
    width: '100%',
    alignItems: 'center'
  },
  container: {
    flex: 1,
    backgroundColor: '#fffbed'
  }
});

export default function CreateTask({ navigation }) {
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) =>
      setExpoPushToken(token)
    );

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log(response);
      });

    return () => {
      Notifications.removeNotificationSubscription(
        notificationListener.current
      );
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  async function registerForPushNotificationsAsync() {
    getiOSNotificationPermission();
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        alert("Failed to get push token for push notification!");
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log(token);
    } else {
      alert("Must use physical device for Push Notifications");
    }
  
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: true,
        lightColor: "#FF231F7C",
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });
    }
  
    return token;
  }

  const [pickerMode, setPickerMode] = useState(false);
  const [isAlarmSet, setAlarmSet] = useState(false);
  const [taskText, setTaskText] = useState('');
  const [notesText, setNotesText] = useState('');
  const [selectedDay, setSelectedDay] = useState();
  const [currentDay, setCurrentDay] = useState('');
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [hh, seth] = useState("");
  const [mm, setm] = useState("");
  const [minDate, setminDate] = useState(new Date().getFullYear() + "-" +( (new Date().getMonth()+1) > 9 ? (new Date().getMonth()+1) : "0"+(new Date().getMonth()+1) )+ "-" +((new Date().getDate()) > 9 ? (new Date().getDate()) : "0"+(new Date().getDate())));
  const [visibleHeight, setVisibleHeight] = useState(
    Dimensions.get('window').height
  );

  const handleAlarmSet = () => {
    setAlarmSet(!isAlarmSet);
  };

  const createNoti = async () => {
    try {
      const trigger = new Date(currentDay);
      trigger.setHours(hh);
      trigger.setMinutes(mm);
      trigger.setSeconds(0);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: taskText,
          body: notesText,
          // sound: 'default',
        },
        trigger,
      });
      console.log("notif id on scheduling",id);
      await createData(id);
    }
    catch (error) {
      console.log(error);
    }
  }

  const createData = async (id) => {
    try {
      let temp = await AsyncStorage.getItem('item');
      let temp_1 = JSON.parse(temp);
      if (!(currentDay in temp_1)) {
        let task = {
          [currentDay]: [
            { key: uuidv4(), name: taskText, note: notesText, time: time, alarm: isAlarmSet, holiday: false, date: currentDay, id: id}
          ]
        }
        let newItem = { ...temp_1, ...task }
        AsyncStorage.setItem('item', JSON.stringify(newItem));
        console.log("tasK:",task);
      }
      else{
        let task = { key: uuidv4(), name: taskText, note: notesText, time: time, alarm: isAlarmSet, holiday: false, date: currentDay, id: id}
        temp_1[currentDay].push(task);
        AsyncStorage.setItem('item', JSON.stringify(temp_1));
        console.log("tasK:",task);
      }


      setTaskText('');
      setNotesText('');
      setCurrentDay('');
      setTime('');
      setAlarmSet(false);
      setAlarmTime(new Date());


      
      navigation.navigate(Routes.HOME, { reload: true });
    }
    catch (error) {
      Alert(error);
    }
  }

  

  if (time == "") {
    let h = new Date().getHours();
    let m = new Date().getMinutes();
    seth(h);
    setm(m);
    var ampm = 'น.';
    if (m < 10) {
      setTime(h + ":0" + m + " " + ampm);
    }
    else {
      setTime(h + ":" + m + " " + ampm);
    }
  }

  const onChange = date => {
    const currentDate = date;
    if (currentDate !== undefined) {
      let h = currentDate.getHours();
      let m = currentDate.getMinutes();
      seth(h);
      setm(m);
      var ampm = 'น.';
      if (m < 10) {
        setTime(h + ":0" + m + " " + ampm);
      }
      else {
        setTime(h + ":" + m + " " + ampm);
      }
      setDate(currentDate);
    }
    setPickerMode(false);
  };

  const hideDateTimePicker = () => {
    setPickerMode(false)
  }

  return (
    <Fragment>
      <DateTimePicker
        isVisible={pickerMode}
        onConfirm={onChange}
        onCancel={hideDateTimePicker}
        locale="en_GB"
        mode="time"
        value={date}
      />

      <SafeAreaView style={styles.container}>
        <View
          style={{
            height: visibleHeight
          }}
        >
          <ScrollView
            contentContainerStyle={{
              paddingBottom: 100
            }}
          >
            <View style={styles.backButton}>
              <TouchableOpacity
                onPress={() => navigation.navigate(Routes.HOME)}
                style={{ marginRight: vw / 2 - 120, marginLeft: 20 }}
              >
                <Image
                  style={{ height: 25, width: 40 }}
                  source={require('../../../assets/back.png')}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              <Text style={styles.newTask}>New Task</Text>
            </View>
            <View style={styles.calenderContainer}>
              <CalendarList
                style={{
                  width: 350,
                  height: 350
                }}
                minDate={minDate}
                horizontal
                pastScrollRange={0}
                pagingEnabled
                calendarWidth={350}
                onDayPress={(day) => {
                  setSelectedDay({
                    [day.dateString]: {
                      selected: true,
                      selectedColor: '#f9c449'
                    }
                  });
                  setCurrentDay(day.dateString);
                  setAlarmTime(day.dateString);
                }}
                monthFormat="yyyy MMMM"
                hideArrows
                markingType="custom"
                theme={{
                  selectedDayBackgroundColor: '#ffff',
                  selectedDayTextColor: '#c73b66',
                  todayTextColor: '#ffff',
                  backgroundColor: '#89a282',
                  calendarBackground: '#89a282',
                  dayTextColor: '#ffff',
                  monthTextColor: '#ffff',
                  textDisabledColor: '#5d6e1e'

                }}
                markedDates={selectedDay}
              />
            </View>
            <View style={styles.taskContainer}>
              <TextInput
                style={styles.title}
                onChangeText={setTaskText}
                value={taskText}
                placeholder="What do you need to do?"
              />
              {/* <Text
                style={{
                  fontSize: 14,
                  color: '#BDC6D8',
                  marginVertical: 10
                }}
              >
                Suggestion
              </Text> */}
              {/*  */}
              <View style={styles.notesContent} />
              <View>
                <Text style={styles.notes}>Notes</Text>
                <TextInput
                  style={{
                    height: 25,
                    fontSize: 19,
                    marginTop: 3
                  }}
                  onChangeText={setNotesText}
                  value={notesText}
                  placeholder="Enter notes about the task."
                />
              </View>
              <View style={styles.separator} />
              <View>
                <Text
                  style={{
                    color: '#dc8665',
                    fontSize: 16,
                    fontWeight: '600'
                  }}
                >
                  Times
                </Text>
                <TouchableOpacity
                  onPress={() => setPickerMode(true)}
                  style={{
                    height: 25,
                    marginTop: 3
                  }}
                >
                  <Text style={{ fontSize: 19 }}>
                    {time}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.separator} />
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <View>
                  <Text
                    style={{
                      color: '#dc8665',
                      fontSize: 16,
                      fontWeight: '600'
                    }}
                  >
                    Alarm
                  </Text>
                  <View
                    style={{
                      height: 25,
                      marginTop: 3
                    }}
                  >
                    <Text style={{ fontSize: 19 }}>
                      {time}
                    </Text>
                  </View>
                </View>
                <Switch value={isAlarmSet} onValueChange={handleAlarmSet}
                  trackColor={{ false: "#767577", true: "#ff7b89" }}
                />
              </View>
            </View>
            <TouchableOpacity
              disabled={taskText === '' || currentDay === ''}
              style={[
                styles.createTaskButton,
                {
                  backgroundColor:
                    taskText === '' ? 'rgba(255, 99, 1,0.6)' : '#f29078'
                }
              ]}
              onPress={async () => {
                if (isAlarmSet) {
                  await createNoti();
                }
                else {
                  await createData("none");
                }
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  textAlign: 'center',
                  color: '#fff'
                }}
              >
                ADD YOUR TASK
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    </Fragment>
  );
}
