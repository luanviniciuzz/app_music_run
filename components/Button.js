import { useState} from 'react';
import { StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import baseColors from '../assets/colors/baseColors';

export default function Button({title, color , onPress}){
    return(
        
        <TouchableOpacity onPress={onPress}
        style={{
            height: 40,
            width: 100,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius:20,
            backgroundColor: color
        }}
        >
            <View>
                <Text 
                    style={{
                        textAlign: 'center',
                        color: '#fff', 
                        fontSize: 16  
                    }}
                >
                    {title}
                </Text>
            </View>
         </TouchableOpacity>
    
        
    )
}