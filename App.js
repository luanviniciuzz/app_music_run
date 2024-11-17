import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View  } from 'react-native';
import Button from './components/Button';
import { Accelerometer } from 'expo-sensors';
import { Audio } from 'expo-av';
import baseColors from './assets/colors/baseColors';

export default function App() {
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState(null);
  const [velocidade, setVelocidade] = useState(0)
  const [pace, setPace] = useState(0)
  const [ativar, setAtivar] = useState(false)
  const [sound, setSound] = useState(null);

  const _slow = () => Accelerometer.setUpdateInterval(1000);
  const _fast = () => Accelerometer.setUpdateInterval(100);
  let gravity = { x: 0, y: 0, z: 0 };
  const gravityValue = 9.81


  const _subscribe = async () => {
    setSubscription(Accelerometer.addListener((e) => {
      setData(e)
      
      let _x = e.x * gravityValue
      let _y = e.y * gravityValue
      let _z = e.z * gravityValue
      
      const alpha = 0.8; // Constante para filtro
       // Filtro de gravidade
       gravity.x = alpha * gravity.x + (1 - alpha) * _x;
       gravity.y = alpha * gravity.y + (1 - alpha) * _y;
       gravity.z = alpha * gravity.z + (1 - alpha) * _z;
 
       // Aceleração linear (movimento)
       const linearX = _x - gravity.x;
       const linearY = _y - gravity.y;
       const linearZ = _z - gravity.z;

      let result = Math.sqrt(Math.pow(linearX, 2) + Math.pow(linearY, 2) + Math.pow(linearZ, 2));
      let velocidadeMedia  = result * 3.6
      if(velocidadeMedia > 8.0){
        let paceMinPorKm = 60 / velocidadeMedia;
        setPace(paceMinPorKm)
        
        if(paceMinPorKm < 5 && paceMinPorKm > 2){
          accelerateSound()
        } else if (paceMinPorKm >= 5){
          decelerateSound()
        }

      }else{
        setPace(0)

      }
      
      setVelocidade(velocidadeMedia)
    }
    ));
  };
  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  // useEffect(() => {
  //   _subscribe();
  //   return () => _unsubscribe();
  // }, []);

  const playSound = async () => {
    setAtivar(true)
    const { sound } = await Audio.Sound.createAsync(
      require('./assets/videoplayback.m4a') 
    );
    setSound(sound);
    await sound.playAsync();
  };


  const stopSound = async () => {
    setAtivar(false)
    if (sound) {
      await sound.stopAsync();
    }
  };
  const [rate, setRate] = useState(1.0);

   const accelerateSound = () => {
    if (rate < 2.0) { 
      const newRate = 1.2;
      setRate(newRate);
      if (sound) {
        sound.setRateAsync(newRate, true); 
      }
    }
  };

  const decelerateSound = () => {
    if (rate > 0.5) {
      const newRate = 1;
      setRate(newRate);
      if (sound) {
        sound.setRateAsync(newRate, true);
      }
    }
  };

  
  return (
    <View style={styles.container}>
      
      <View style={{flexDirection:'row', justifyContent:'space-evenly', height:200, alignItems:'center'}}>
        <Button
          title={"Play Music"}
          color={baseColors.light.verdeEscuro}
          onPress={playSound}
        />
        <Button
          title={"Stop Music"}
          color={baseColors.light.vermelhoEscuro}
          onPress={stopSound}
        />
      </View>

      
      {/* <Text style={styles.text}>Accelerometer: (in gs where 1g = 9.81 m/s^2)</Text>
      <Text style={styles.text}>x: {x.toFixed(2)}</Text>
      <Text style={styles.text}>y: {y.toFixed(2)}</Text>
      <Text style={styles.text}>z: {z.toFixed(2)}</Text> */}
      

      <Text style={styles.text}>Velocidade: {velocidade.toFixed(2)} km/h</Text>
      <Text style={styles.text}>Pace: {pace.toFixed(2)} min/km</Text>
      {
        ativar ? (
          <View style={{flexDirection:'row', height:200 , alignItems:'center', justifyContent:'space-evenly'}}>
        <Button
          title={subscription ? 'Pace Stop' : 'Pace Start'}
          color={baseColors.light.roxoEscuro}
          onPress={subscription ? _unsubscribe : _subscribe}
        />
        {subscription ? (
          <>
             <Button
              title={'Slow'}
              color={baseColors.light.azulClaro}
              onPress={() =>  _slow}
             />
            <Button
              title={'Fast'}
              color={baseColors.light.azulEscuro}
              onPress={() =>  _fast}
            />
          </>
         
        ) : null }
      </View>
        ): null
      }
      
      
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  text: {
    textAlign: 'center',
    fontSize: 30,
    marginVertical:10
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
  },
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
});
