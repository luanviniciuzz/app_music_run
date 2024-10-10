import React, {useEffect, useState} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import TrackPlayer, {Capability} from 'react-native-track-player';
import { songs } from './src/data/MusicData';


const App = () => {

  const [status, setStatus] = useState(false)

  useEffect(() => {
    setupPlayer()
  },[])

  const setupPlayer = async () => {

    try{
      
      await TrackPlayer.setupPlayer()
      await TrackPlayer.updateOptions({
        // Media controls capabilities
        capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
        ],
    
        // Capabilities that will show up when the notification is in the compact form on Android
        compactCapabilities: [Capability.Play, Capability.Stop],
    
        
    });

    await TrackPlayer.add(songs)

    }catch (e){
      console.log(e)
    }
  }

  async function handleButton(){

    if(status == false){
      await TrackPlayer.play(),
      setStatus(true)
    }else[
      await TrackPlayer.stop(),
      setStatus(false)
    ]
   
  }

  return (
    <View
      style={[
        styles.container,
        {
          flexDirection: 'column',
        },
      ]}>
      <View style={styles.title_container}>
        <Text style={{fontSize:30 , color: "#2d3436"}}>{"Aperte o play"}</Text>
      </View>
      <View style={styles.body_container}>


      </View>
      <View style={styles.footer_container}>
        <TouchableOpacity style={{
          width:100,
          height:100,
          borderRadius:50,
          backgroundColor: status ? "#d63031" : "#00b894",
          alignItems:"center",
          justifyContent:"center"
        }}
          onPress={() => handleButton()}
        >
            <Text style={{fontSize:30 , color: "white"}}>{status ? "Stop" : "Play"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title_container:{
    flex: 1, backgroundColor: 'white', alignItems:"center", justifyContent:"center"
  },
  body_container:{
    flex: 3, backgroundColor: '#74b9ff'
  },
  footer_container:{
    flex: 1, backgroundColor: 'white', alignItems:"center", justifyContent:"center"
  }
});

export default App;