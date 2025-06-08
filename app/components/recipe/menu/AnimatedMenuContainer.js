import React, { useState, useEffect } from 'react'
import { View, Animated, StyleSheet } from 'react-native'

function AnimatedMenuContainer({
    children,
    visible = true,
    animationDuration = 1000,
    style
}) {
    const [menuAnimation] = useState(new Animated.Value(visible ? 1 : 0))

    useEffect(() => {
        Animated.timing(menuAnimation, {
            toValue: visible ? 1 : 0,
            duration: animationDuration,
            useNativeDriver: true,
        }).start()
    }, [visible, animationDuration])

    return (
        <View style={[styles.container, style, {
            zIndex: visible ? 1 : 0,
            pointerEvents: visible ? 'box-none' : 'none',
        }]}>
            <Animated.View style={[styles.menuWrapper, {
                transform: [{
                    translateY: menuAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-500, 0]
                    })
                }],
                opacity: menuAnimation,
                pointerEvents: 'box-none',
            }]}>
                {children}
            </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'transparent',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 96, // Height of menu + margin
    },
    menuWrapper: {
        position: 'absolute',
        width: '100%',
    },
})

export default AnimatedMenuContainer 