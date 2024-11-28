import React from 'react';
import { ActivityIndicator, View } from 'react-native'  

export default function Loading() {
    return (
        <View style={{
            backgroundColor: '#fafaf7',
            justifyContent: 'flex-start',
            flexDirection: 'column',
            flex: 1,        
        }}>
            <ActivityIndicator color='#d97757' size='large' />
        </View>
    )
}
