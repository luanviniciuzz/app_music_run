import React, {useEffect, useState} from 'react';
import {StyleSheet,Button, View, Text, TouchableOpacity, FlatList, PermissionsAndroid, Alert} from 'react-native';
import TrackPlayer, {Capability} from 'react-native-track-player';
//import { songs } from './src/data/MusicData';
import Geolocation from '@react-native-community/geolocation';


const App = () => {

  const songs = [
    {
      id:0,
      title:"Don't Say Goodbye",
      artist:"ALOK & Ilkay Sencan",
      url:require("./src/assets/music/videoplayback.m4a")
      
    },
    {
      id:1,
      title:"Before I Forget",
      artist:"Slipknot",
      url:require("./src/assets/music/slipknot-before.m4a")
      
    },
    {
      id:2,
      title:"Amor impossivel",
      artist:"Mari Fernandez",
      url:require("./src/assets/music/marifernandez.m4a")
      
    },
    {
      id:3,
      title:"Dinheiro e Putaria",
      artist:"MC Cabelinho",
      url:require("./src/assets/music/mccabelinho.m4a")
      
    }
  ]

  const Permission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Cool Location Permission',
          message:
            'Acess location ' +
            'map',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the camera');
        getCurrentLocation()
      } else {
        console.log('Camera permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const [distance, setDistance] = useState(0); // em metros
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0); // em segundos
  const [isRunning, setIsRunning] = useState(false);
  const [lastLocation, setLastLocation] = useState(null);

  // const openMaps = () => {
  //   const {latitude, longitude} = currentLocation
  // }

  const [status, setStatus] = useState(false)
  const [escolherMusica, setEscolherMusica] = useState(0)
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
            Capability.PlayFromId
        ],
    
        // Capabilities that will show up when the notification is in the compact form on Android
        compactCapabilities: [Capability.Play, Capability.Stop, Capability.PlayFromId],
    
        
    });

  
    await TrackPlayer.add(songs)

    }catch (e){
      console.log(e)
    }
  }
  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1); // incrementa o tempo a cada segundo
      }, 1000);
    } else if (!isRunning && elapsedTime !== 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isRunning, elapsedTime]);

  const startRun = () => {
    setIsRunning(true);
    setStartTime(Date.now());
    setDistance(0);
    setElapsedTime(0);
    setLastLocation(null);
    // Inicie a localização aqui
    getLocation();
  };
  const stopRun = () => {
    setIsRunning(false);
    // Parar a localização
  };
  const getLocation = () => {
    Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        if (lastLocation) {
          const newDistance = calculateDistance(lastLocation, { latitude, longitude });
          setDistance(prev => prev + newDistance);
        }
        setLastLocation({ latitude, longitude });
      },
      error => {
        console.error(error);
      },
      { enableHighAccuracy: true, distanceFilter: 0 }
    );
  };
  const calculateDistance = (loc1, loc2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371000; // Raio da Terra em metros
    const dLat = toRad(loc2.latitude - loc1.latitude);
    const dLon = toRad(loc2.longitude - loc1.longitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(loc1.latitude)) * Math.cos(toRad(loc2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distância em metros
  };

  const pace = elapsedTime > 0 ? (elapsedTime / (distance / 1000)) : 0; // em segundos por quilômetro
  const paceMinutes = Math.floor(pace / 60);
  const paceSeconds = Math.round(pace % 60);

  async function handleButton(){

    if(status == false){
      await TrackPlayer.play(),
      setStatus(true)
    }else[
      await TrackPlayer.stop(),
      setStatus(false)
    ]
   
  }
  const selecionarMusica = async (index) => {
    try {
        // Obtém a lista de faixas
        const tracks = await TrackPlayer.getQueue();

        // Verifica se o índice está dentro do limite
        if (index < 0 || index >= tracks.length) {
            console.error("Índice inválido");
            return;
        }

        // Pega a faixa correspondente ao índice
        const track = tracks[index];

        // Verifica se a faixa existe
        if (track) {
            // Troca para a faixa correspondente
            await TrackPlayer.skip(track.id);
            await TrackPlayer.play(); // Começa a tocar a nova faixa
        } else {
            console.error("Faixa não encontrada");
        }
    } catch (e) {
        console.error(e);
    }
};

  const renderItens = ({item}) => {
    return(
      <TouchableOpacity style={{
          width:"99%",
          height:50,
          backgroundColor:'#74b9ff',
          justifyContent:'center',
          paddingLeft:'5%'
       }} 
        onPress={() => {selecionarMusica(item.id),handleButton()}}
        //onPress={() => console.log(songs[escolherMusica])}
        >
          <Text style={{fontWeight:'800'}}>{`Música:  ${item.title}`}</Text>
          <Text style={{fontWeight:'800'}}>{`Artista:  ${item.artist}`}</Text>
      </TouchableOpacity>
    )
  }
  return (
    <View style={[styles.container]}>
      <View style={{alignItems:"center", marginVertical:10}}>
        <Text style={{fontSize:20 , color: "#2d3436"}}>{"Mapa e localização"}</Text>
      </View>

      <View style={styles.map_container}>
        <View>
            <Text style={{fontSize:20}}>Distância: {(distance / 1000).toFixed(2)} km</Text>
            <Text style={{fontSize:20}}>Tempo: {elapsedTime} s</Text>
            <Text style={{fontSize:20}}>Pace: {pace > 0 ? `${paceMinutes}:${String(paceSeconds).padStart(2, '0')}` : 'N/A'}</Text>
            <Button title={isRunning ? "Parar" : "Começar"} onPress={isRunning ? stopRun : startRun} />
        </View>
        {/* <View>
          <Text>Latitude: {currentLocation ? currentLocation.latitude : 'Loading...'}</Text>
          <Text>Longitude: {currentLocation ? currentLocation.longitude : 'Loading...'}</Text>
        </View> */}

        {/* <TouchableOpacity
          style={{backgroundColor:'#74b9ff'}}
          onPress={() => Permission()}
        >
          <Text>
           Get location
          </Text>
        </TouchableOpacity> */}
      </View>
      <View style={{alignItems:"center", marginVertical:10}}>
        <Text style={{fontSize:20 , color: "#2d3436"}}>{"Escolha a música"}</Text>
      </View>
      <View style={styles.music_container}>
          <FlatList
            data={songs}
            keyExtractor={e => e.id}
            renderItem={(item) => renderItens(item)}
            ItemSeparatorComponent={() => (<View style={{height:10}}/>)}
          />

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
          //onPress={() => console.log(songs)}
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
  map_container:{
    flex: 2, backgroundColor: '#b8e994', alignItems:"center", justifyContent:"center"
  },
  music_container:{
    flex: 2, backgroundColor: 'white'
  },
  footer_container:{
    flex: 1, backgroundColor: 'white', alignItems:"center", justifyContent:"center"
  }
});

export default App;