import React, { Fragment, useEffect, useState, useRef } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Button,
  Pressable
} from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Agenda, CalendarList } from 'react-native-calendars';
import { v4 as uuidv4 } from 'uuid';
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

const styles = StyleSheet.create({
  taskListContent: {
    height: 100,
    width: 327,
    alignSelf: 'center',
    borderRadius: 10,
    shadowColor: '#2E66E7',
    backgroundColor: '#ffffff',
    marginTop: 10,
    marginBottom: 10,
    shadowOffset: {
      width: 3,
      height: 3
    },
    shadowRadius: 5,
    shadowOpacity: 0.2,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  viewTask: {
    position: 'absolute',
    bottom: 40,
    right: 17,
    height: 60,
    width: 60,
    backgroundColor: '#2E66E7',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2E66E7',
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowRadius: 30,
    shadowOpacity: 0.5,
    elevation: 5,
    zIndex: 999
  },
  deleteButton: {
    backgroundColor: '#ff6347',
    width: 100,
    height: 38,

    marginTop: 20,
    borderRadius: 5,
    justifyContent: 'center',
    marginLeft: 260
  },
  updateButton: {
    backgroundColor: '#2E66E7',
    width: 100,
    height: 38,
    marginTop: 20,
    borderRadius: 5,
    justifyContent: 'center',
    marginLeft: 40
  },
  separator: {
    height: 0.5,
    width: '100%',
    backgroundColor: '#979797',
    alignSelf: 'center',
    marginVertical: 20
  },
  notesContent: {
    height: 0.5,
    width: '100%',
    backgroundColor: '#979797',
    alignSelf: 'center',
    marginVertical: 20
  },
  title: {
    height: 25,
    fontSize: 19
  },
  itemContainer: {
    color: '#ccabd8',
  },
  twoButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20
  },
  TButton: {
    width: '40%',
    height: 40
  },
  taskContainer: {
    height: 325,
    width: 327,
    alignSelf: 'center',
    borderRadius: 20,
    shadowColor: '#2E66E7',
    backgroundColor: '#ffffff',
    marginTop: 20,
    shadowOffset: {
      width: 3,
      height: 3
    },

    shadowRadius: 20,
    shadowOpacity: 0.2,
    elevation: 5,
    padding: 22
  },
  centeredView: {
    // flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 22,
    backgroundColor: "#00000000"
  },
  modalView: {
    margin: 20,
    marginTop: 100,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 15,
    padding: 10,
    elevation: 2
  },
  buttonClose: {
    backgroundColor: "#ff6347",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 10,
    textAlign: "center"
  },
  modalText2: {
    textAlign: "left"
  },
  modalText3: {
    marginBottom: 5,
    textAlign: "center"
  },
  alignButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  space: {
    marginRight: 20
  }
});

export default function Home({ navigation, route }) {

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

  const h = {
    '2022-01-01': [
      { name: 'วันขึ้นปีใหม่', holiday: true },
    ],
    '2022-01-03': [
      { name: 'ชดเชยวันขึ้นปีใหม่', holiday: true },
    ],
    '2022-02-16': [
      { name: 'วันมาฆบูชา', holiday: true },
    ],
    '2022-04-06': [
      { name: 'วันจักรี', holiday: true },
    ],
    '2022-05-04': [
      { name: 'วันฉัตรมงคล', holiday: true },
    ],
    '2022-05-15': [
      { name: 'วันวิสาขบูชา', holiday: true },
    ],
    '2022-05-16': [
      { name: 'ชดเชย วันวิสาขบูชา', holiday: true },
    ],
    '2022-06-03': [
      { name: 'วันเฉลิมพระชนมพรรษาสมเด็จพระบรมราชินี', holiday: true },
    ],
    '2022-07-13': [
      { name: 'วันอาสาฬหบูชา', holiday: true },
    ],
    '2022-07-15': [
      { name: 'วันหยุดราชการพิเศษประจำปี', holiday: true },
    ],
    '2022-07-28': [
      { name: 'วันเฉลิมพระชนมพรรษา ร.10', holiday: true },
    ],
    '2022-07-29': [
      { name: 'วันหยุดราชการพิเศษประจำปี', holiday: true },
    ],
    '2022-08-12': [
      { name: 'วันแม่แห่งชาติ', holiday: true },
    ],
    '2022-10-13': [
      { name: 'วันคล้ายวันสวรรคต ร.9', holiday: true },
    ],
    '2022-10-14': [
      { name: 'วันหยุดราชการพิเศษประจำปี', holiday: true },
    ],
    '2022-10-23': [
      { name: 'วันปิยมหาราช', holiday: true },
    ],
    '2022-10-24': [
      { name: 'ชดเชย วันปิยมหาราช', holiday: true },
    ],
    '2022-12-05': [
      { name: 'วันชาติ และ วันพ่อแห่งชาติ', holiday: true },
    ],
    '2022-12-10': [
      { name: 'วันรัฐธรรมนูญ', holiday: true },
    ],
    '2022-12-12': [
      { name: 'ชดเชย วันรัฐธรรมนูญ', holiday: true },
    ],
    '2022-12-30': [
      { name: 'วันหยุดราชการพิเศษประจำปี', holiday: true },
    ],
    '2022-12-31': [
      { name: 'วันสิ้นปี', holiday: true },
    ],
  };

  const [item, setItem] = useState({});

  const getData = async () => {
    try {
      let temp = await AsyncStorage.getItem('item');
      if (temp == null) {
        AsyncStorage.setItem('item', JSON.stringify(h));
      }
      let temp_1 = await AsyncStorage.getItem('item');
      setItem(JSON.parse(temp_1));
    }
    catch (error) {
      Alert(error);
    }
  }
  if (JSON.stringify(route.params) !== undefined) {
    getData();
    route.params = undefined;
    console.log(item);
  }
  if (JSON.stringify(item) === JSON.stringify({})) {
    getData();
    console.log("s");
  }

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTask, setModalTask] = useState(false);
  const [modalItem, setModalItem] = useState([]);
  const [taskItem, setTaskItem] = useState([]);
  const [pickerMode, setPickerMode] = useState(false);
  const [isAlarmSet, setAlarmSet] = useState(false);
  const [taskText, setTaskText] = useState('');
  const [notesText, setNotesText] = useState('');
  const [key, setKey] = useState('');
  const [selectedDay, setSelectedDay] = useState();
  const [currentDay, setCurrentDay] = useState(new Date());
  const [oldcurrentDay, setoldCurrentDay] = useState(new Date());
  const [alarmTime, setAlarmTime] = useState(new Date());
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState("");
  const [hh, seth] = useState("");
  const [mm, setm] = useState("");
  const [minDate, setminDate] = useState(new Date().getFullYear() + "-" + ((new Date().getMonth() + 1) > 9 ? (new Date().getMonth() + 1) : "0" + (new Date().getMonth() + 1)) + "-" + ((new Date().getDate()) > 9 ? (new Date().getDate()) : "0" + (new Date().getDate())));

  const [eventDay, setEventDay] = useState('');
  const [eventDayList, setListEventDay] = useState([]);

  
  const [modalVisibleX, setModalVisibleX] = useState(false);
  const [modalVisibleY, setModalVisibleY] = useState(true);
  const setTwoState = () => {
    setModalVisibleX(!modalVisibleX);
    setModalVisibleY(!modalVisibleY);
    checkEvent();
  }

  const checkEvent = () => {
    console.log('In checkEvent');
    for (var i in item) {
      for (var j in item[i]) {
        if (item[i][j].holiday){
          if (item[i][j].key == minDate){
            eventDayList.push(item[i][j].name)
          }
        }
        else{
           if (item[i][j].date == minDate) {
            eventDayList.push(item[i][j].name)
          }
        }

        if (eventDayList.length != 0){
          var listEvent = '';
          for (const day in eventDayList) {
             listEvent += '\u2022 ' + eventDayList[day] + '\n';
           }
      
           setEventDay(listEvent);
        }

        else{
          setEventDay('วันนี้ไม่มีอะไร ขอให้เป็นวันที่ดี!');
        }
      }
    }
  };
  const handleAlarmSet = () => {
    setAlarmSet(!isAlarmSet);
  };

  const renderItem = (item) => {
    if (item.holiday) {
      return (
        <TouchableOpacity
          onPress={() => passDataToModal(item)}
        >
          <Text style={{
            color: '#b9d4db', fontSize: 18, marginTop: 40, backgroundColor: '#3b5284',
            width: '90%', padding: 10, borderRadius: 10, fontWeight: 'bold', textAlign: 'center'
          }}>{item.name}</Text>
        </TouchableOpacity>
      );
    }
    else {
      return (
        <TouchableOpacity
          onPress={() => passDataToTask(item)}
        >
          <View style={{
            marginTop: 40, backgroundColor: '#3b5284',
            width: '90%', padding: 10, borderRadius: 10, fontWeight: 'bold', textAlign: 'center'
          }}>
            <Text style={{ color: '#b9d4db', fontSize: 18, }}>
              {item.name}
            </Text>
            <Text style={{ color: '#b9d4db', fontSize: 14, }}>
              {item.note}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
  };

  const passDataToModal = (item) => {
    setModalOpen(!modalOpen);
    setModalItem(item);
  }

  const passDataToTask = (item) => {
    setModalTask(!modalTask);
    setTaskItem(item);
  }

  useEffect(() => {
    setTaskText(taskItem.name);
    setNotesText(taskItem.note);
    setTime(taskItem.time);
    setAlarmSet(taskItem.alarm);
    setKey(taskItem.key);
    setCurrentDay(taskItem.date);
  }, [taskItem])

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

  const createData = async (id) => {
    try {
      let temp = await AsyncStorage.getItem('item');
      let temp_1 = JSON.parse(temp);
      if (!(currentDay in temp_1)) {
        let task = {
          [currentDay]: [
            { key: uuidv4(), name: taskText, note: notesText, time: time, alarm: isAlarmSet, holiday: false, date: currentDay, id:id}
          ]
        }
        let newItem = { ...temp_1, ...task }
        AsyncStorage.setItem('item', JSON.stringify(newItem));
      }
      else {
        let task = { key: uuidv4(), name: taskText, note: notesText, time: time, alarm: isAlarmSet, holiday: false, date: currentDay, id:id }
        temp_1[currentDay].push(task);
        AsyncStorage.setItem('item', JSON.stringify(temp_1));
      }


      setTaskText('');
      setNotesText('');
      setCurrentDay('');
      setTime('');
      setAlarmSet(false);
      setAlarmTime(new Date());
      setSelectedDay();
      getData();
    }
    catch (error) {
      Alert(error);
    }
  }

  const updateData = async () => {
    // console.log(currentDay);
    // console.log(taskText);
    // console.log(notesText);
    // console.log(time);
    // console.log(isAlarmSet);
    for (var i in item) {
      for (var j in item[i]) {
        if (item[i][j].key == key) {
          if (item[i][j].date !== currentDay) {
            deleteData();
            createData("none");
          }
          else {
            item[i][j].name = taskText;
            item[i][j].note = notesText;
            item[i][j].time = time;
            item[i][j].alarm = isAlarmSet;
            AsyncStorage.setItem('item', JSON.stringify(item));
          }
          break; //Stop this loop, we found it!
        }
      }
    }

    setModalTask(false);
  }

  const updateDatanoti = async (id) => {
    // console.log(currentDay);
    // console.log(taskText);
    // console.log(notesText);
    // console.log(time);
    // console.log(isAlarmSet);
    for (var i in item) {
      for (var j in item[i]) {
        if (item[i][j].key == key) {
          if (item[i][j].date !== currentDay) {
            deleteData();
            createData(id);
          }
          else {
            Notifications.cancelScheduledNotificationAsync(item[i][j].id);
            item[i][j].name = taskText;
            item[i][j].note = notesText;
            item[i][j].time = time;
            item[i][j].alarm = isAlarmSet;
            item[i][j].id = id;
            AsyncStorage.setItem('item', JSON.stringify(item));
          }
          break; //Stop this loop, we found it!
        }
      }
    }

    setModalTask(false);
  }

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
      await updateDatanoti(id);
    }
    catch (error) {
      console.log(error);
    }
  }

  const deleteData = async () => {
    // console.log(currentDay);
    // console.log(key);
    // console.log(item[currentDay]);
    for (var i in item) {
      for (var j in item[i]) {
        if (item[i][j].key == key) {
          Notifications.cancelScheduledNotificationAsync(item[i][j].id);
          item[i].splice(j, 1);
          if (item[i].length == 0) {
            delete item[i];
          }
          break; //Stop this loop, we found it!
        }
      }
    }
    AsyncStorage.setItem('item', JSON.stringify(item));
    setModalTask(false);
    // console.log(taskText);
    // console.log(notesText);
    // console.log(time);
    // console.log(isAlarmSet);
  }

  return (

    <Fragment>
      <Modal visible={modalOpen} transparent={true}>
        <View style={{ backgroundColor: '#000000aa', height: '100%' }}>
          <View style={{ backgroundColor: '#E2E3E4', margin: 50, padding: 30, borderRadius: 10, marginTop: '50%', paddingBottom: 20 }}>
            <Text style={{ marginBottom: 10, textAlign: 'center', fontSize: 20 }}>{modalItem.name}</Text>
            <Button
              title='close'
              size={24}
              onPress={() => setModalOpen(false)}></Button>
          </View>
        </View>
      </Modal>
      <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisibleX}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisibleX(!modalVisibleX);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText3}>กิจกรรมในวันนี้ มีดังนี้</Text>
            <Text style={styles.modalText2}>{eventDay}</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisibleX(!modalVisibleX)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
    
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisibleY}
        onRequestClose={() => {
          Alert.alert("Modal has been closed.");
          setModalVisibleX(!modalVisibleY);
        }}
      >
    <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>ยินดีต้อนรับสู่ Piranha! {"\n"}แวะชมกิจกรรมวันนี้ของคุณหน่อยไหม?</Text>
            <View style={styles.alignButton}>
            <Pressable
              style={[styles.button, styles.buttonClose, styles.space]}
              onPress={() => setTwoState()}
            >
              <Text style={styles.textStyle}>Look!</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisibleY(!modalVisibleY)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
            </View>
          </View>
        </View>
        </Modal>
    </View>
      {

        <Modal visible={modalTask} transparent={true}>
          <DateTimePicker
        isVisible={pickerMode}
        onConfirm={onChange}
        onCancel={hideDateTimePicker}
        locale="en_GB"
        mode="time"
        value={date}
      />
          <ScrollView contentContainerStyle={{
            paddingBottom: 40, backgroundColor: '#fffbed'
          }}>
            <View>
              <View style={{
                flexDirection: 'row',
                marginTop: 20,
                width: '100%',
                alignItems: 'center'
              }}>
                <TouchableOpacity
                  onPress={() => setModalTask(false)}
                // style={{ marginRight: vw / 2 - 120, marginLeft: 20 }}
                >
                  <Image
                    style={{ height: 25, width: 40 }}
                    source={require('../../../assets/back.png')}
                    resizeMode="contain"
                  />
                </TouchableOpacity>

                {/* <Text style={styles.newTask}>New Task</Text> */}
              </View>

              <CalendarList
                style={{
                  width: 350,
                  height: 350,
                  marginLeft: 30,
                  marginTop: 30
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
              <View style={styles.taskContainer}>



                {/* <MaterialIcons
              name='add'
              size={24}
              onPress={() => setModalVisible(true)}>
            </MaterialIcons> */}
                <TextInput
                  style={styles.title}
                  onChangeText={setTaskText}
                  value={taskText}
                  placeholder="What do you need to do?"
                />
                <View style={styles.notesContent} />
                <View>
                  <Text
                    style={{
                      color: '#9CAAC4',
                      fontSize: 16,
                      fontWeight: '600'
                    }}
                  >
                    Notes
                  </Text>
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
                      color: '#9CAAC4',
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
                        color: '#9CAAC4',
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
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >

                </View>
              </View>
              <View style={styles.twoButton}>
                <View style={styles.TButton}>
                  <TouchableOpacity
                    onPress={async () => {
                      if (isAlarmSet) {
                        //noti
                        await createNoti();
                      }
                      else {
                        //de noti
                        await updateData();
                      }
                    }}
                    style={{
                      backgroundColor: '#2E66E7',
                      width: 100,
                      height: 38,
                      borderRadius: 5,
                      justifyContent: 'center',
                      marginLeft: 50
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        textAlign: 'center',
                        color: '#fff',
                      }}
                    >
                      UPDATE
                    </Text>
                  </TouchableOpacity></View>

                <View style={styles.TButton}>
                  <TouchableOpacity
                    onPress={async () => {
                      deleteData();
                    }}
                    style={{
                      backgroundColor: '#ff6347',
                      width: 100,
                      height: 38,
                      justifyContent: 'center',
                      borderRadius: 5,

                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        textAlign: 'center',
                        color: '#fff'
                      }}
                    >
                      DELETE
                    </Text>
                  </TouchableOpacity></View>
              </View>
            </View>
          </ScrollView>
        </Modal>
      }

      <SafeAreaView
        style={{
          flex: 1
        }}
      >

        <Agenda
          selected={Date.now()}
          items={item}
          renderItem={renderItem}
          showClosingKnob={true}
          theme={{
            agendaDayTextColor: 'darkorange',
            agendaDayNumColor: '#3c3c3c',
            agendaKnobColor: 'lightgrey',
            backgroundColor: '#fffbed',
            monthTextColor: 'darkorange',
            textSectionTitleColor: 'darkorange',
            backgroundColor: '#fffbed',
            dayTextColor: '#5d6e1e',
            selectedDayBackgroundColor: 'darkorange',
            todayTextColor: 'red',
            dotColor: '#FF4500',
            selectedDotColor: '#FF4500',
          }}
        />
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('CreateTask')
          }
          style={styles.viewTask}
        >
          <Image
            source={require('../../../assets/plus.png')}
            style={{
              height: 30,
              width: 30
            }}
          />
        </TouchableOpacity>
      </SafeAreaView>
    </Fragment>
  );
}
