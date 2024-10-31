import React, {useEffect, useState} from 'react';
import {StyleSheet,Button, View, Text, TouchableOpacity, FlatList, PermissionsAndroid, TextInput} from 'react-native';
import TrackPlayer, {Capability} from 'react-native-track-player';
//import { songs } from './src/data/MusicData';
import Geolocation from '@react-native-community/geolocation';
import {accelerometer , setUpdateIntervalForType, SensorTypes} from "react-native-sensors";
import { map, filter } from "rxjs/operators";

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

  const [status, setStatus] = useState(false)
  const [ativar, setAtivar] = useState(false)

  const [velocidade, setVelocidade] = useState(0);
  const [pace, setPace] = useState(0); 
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [velocidadeAtual, setVelocidadeAtual] = useState({ x: 0, y: 0, z: 0 });
  const [gravity, setGravity] = useState({ x: 0, y: 0, z: 0 });

  const calcularPace = (velocidadeEmMs, distanciaEmKm) => {
    if (velocidadeEmMs === 0) {
      return 0;
    }
    const velocidadeKmH = velocidadeEmMs * 3.6; 
    const paceMinPorKm = 60 / velocidadeKmH; 
    return paceMinPorKm.toFixed(2); 
  };

  function consultarAceleração(){
      const alpha = 0.8; // Constante do filtro passa-baixa
      const aceleracaoMinima = 0.1; // Limite mínimo para considerar movimento

      setUpdateIntervalForType(SensorTypes.accelerometer, 1000); // defaults to 100ms

      const subscription = accelerometer
        .pipe(map(({ x, y, z }) => x + y + z), filter(speed => speed > 0))
        .subscribe((e) => console.log(`You moved your phone with ${e.toFixed(2)}`));
        
      setTimeout(() => {
        // If it's the last subscription to accelerometer it will stop polling in the native API
        subscription.unsubscribe();
      }, 1000);
  }

  let intervalo = null
  function ativarAcelerometro(ativar){

    if(ativar){
      intervalo = setInterval(() => {
        consultarAceleração()
      },1000)
    }else{
      clearInterval(intervalo)
    }

  }

  
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
  // useEffect(() => {
  //   async function musicSpeed(){

  //     console.log(pace)
  //       if(pace == 'Parado'){
  //         await TrackPlayer.setRate(1)
  //       }else if(pace < 4 && pace > 3){
  //         await TrackPlayer.setRate(1.25)
  //       }else if(pace == 5 || pace == 4){
  //         await TrackPlayer.setRate(1)
  //       }else if(pace >= 6){
  //         await TrackPlayer.setRate(0.5)
  //       }

  //   }
  //   musicSpeed()
  // },[pace])

  const renderItens = ({item}) => {
    return(
      <TouchableOpacity style={{
          width:"99%",
          height:50,
          backgroundColor:'#74b9ff',
          justifyContent:'center',
          paddingLeft:'5%',
          borderRadius:8
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
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>DISTÂNCIA de 5km</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Velocidade: {"(velocidade * 3.6).toFixed(2)"} km/h</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Pace: {"pace"} min/km</Text>
        </View>
        <TouchableOpacity
          style={{backgroundColor:'red'}}
          onPress={() => ativarAcelerometro(true)}
        >
          <Text style={{color:'white'}}>Consultar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{backgroundColor:'red'}}
          onPress={() => ativarAcelerometro(false)}
        >
          <Text style={{color:'white'}}>cacela</Text>
        </TouchableOpacity>
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
        {
          status ? (
          <TouchableOpacity style={{
                    width:100,
                    height:100,
                    borderRadius:50,
                    backgroundColor:"#d63031",
                    alignItems:"center",
                    justifyContent:"center"
                  }}
                    onPress={() => handleButton()}
                    //onPress={() => console.log(songs)}
                  >
                      <Text style={{fontSize:30 , color: "white"}}>{"Stop"}</Text>
          </TouchableOpacity>
          ) : null
        }
        
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
    flex: 2, backgroundColor: '#b8e994', alignItems:"center", justifyContent:"center", borderRadius:8
  },
  music_container:{
    flex: 2, backgroundColor: 'white'
  },
  footer_container:{
    flex: 1, backgroundColor: 'white', alignItems:"center", justifyContent:"center"
  }
});

export default App;