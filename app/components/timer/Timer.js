import { View, Text } from 'react-native'
import Picker from './Picker'
import { useEffect, useRef, useState } from 'react'
import Icon from 'react-native-vector-icons/FontAwesome'

import StopwatchTimer, { StopwatchTimerMethods } from 'react-native-animated-stopwatch-timer'
import AsyncStorage from '@react-native-async-storage/async-storage'

async function createTimer(totalSeconds) {
  const totalMs = totalSeconds * 1000
  const currentTimeMs = new Date().getTime()
  const endTimeMs = currentTimeMs + totalMs

  await AsyncStorage.setItem('timerEndTimeMs', endTimeMs.toString())
  await AsyncStorage.setItem('timerTotalMs', totalMs.toString())
}

async function loadTimer() {
  // TODO: load previously running timer when app was closed

  const timerTotalMs = Number(await AsyncStorage.getItem('timerTotalMs'))
  const isTimerAlreadyRunning = !!timerTotalMs

  if (isTimerAlreadyRunning) {
  }
}

export default function Timer({ totalSeconds }) {
  const stopwatchTimerRef = useRef(null)

  const [paused, setPaused] = useState(false)
  const [finished, setFinished] = useState(false)

  function play() {
    stopwatchTimerRef.current.play()
  }

  function pause() {
    stopwatchTimerRef.current.pause()
  }

  function reset() {
    stopwatchTimerRef.current.reset()
  }

  useEffect(() => {
    if (paused) {
      stopwatchTimerRef.current.pause()
    } else {
      stopwatchTimerRef.current.play()
    }

    if (finished) {
      stopwatchTimerRef.current.reset()
    }
  }, [paused, finished])

  useEffect(() => {
    if (paused) {
      //TODO: remove scheduled notification
    } else {
      //TODO: schedule notification for when timer expires
    }
  }, [paused])

  return (
    <View
      style={{
        position: 'absolute',
        alignSelf: 'center',
        padding: 20,
        marginLeft: 10,
        marginRight: 10,
        bottom: 60,
        backgroundColor: '#efede3',

        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 8,
        },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,
        elevation: 16,

        borderColor: '#d97757',
        borderWidth: 2,
        borderRadius: 5,
      }}
    >
      <Picker />

      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          gap: 20,
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Text style={{ fontSize: 20 }}>⏲️</Text>
        <StopwatchTimer
          ref={stopwatchTimerRef}
          mode='timer'
          initialTimeInMs={100000}
          trailingZeros={0}
          digitStyle={{
            color: '#d97757',
          }}
          onFinish={() => {
            setPaused(true)
            setFinished(true)
          }}
        />
        <View
          style={{
            flex: 1,
            gap: 10,
            flexDirection: 'row',
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          {finished ? (
            <Icon.Button
              name='check'
              type='font-awesome'
              color='#706b57'
              backgroundColor='white'
              iconStyle={{ marginRight: 0 }}
              onPress={() => {
                //todo remove both
                setFinished(false)
                setPaused(false)
                // TODO: go to the recipe step
              }}
            />
          ) : paused ? (
            <>
              <Icon.Button
                name='remove'
                type='font-awesome'
                color='#706b57'
                backgroundColor='white'
                iconStyle={{ marginRight: 0 }}
                onPress={() => {
                  setPaused(false)
                  setFinished(false)
                }}
              />
              <Icon.Button
                name='play'
                type='font-awesome'
                color='#706b57'
                backgroundColor='white'
                iconStyle={{ marginRight: 0 }}
                onPress={() => {
                  setPaused(false)
                  setFinished(false)
                }}
              />
            </>
          ) : (
            <Icon.Button
              name='pause'
              type='font-awesome'
              color='#706b57'
              backgroundColor='white'
              iconStyle={{ marginRight: 0 }}
              onPress={() => {
                setPaused(true)
              }}
            />
          )}
        </View>
      </View>
    </View>
  )
}
