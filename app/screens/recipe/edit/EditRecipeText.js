import React, { useState, useCallback, useEffect } from 'react'
import { observer } from 'mobx-react-lite'
import { View, SafeAreaView, StyleSheet, Keyboard } from 'react-native'
import { useRoute } from '@react-navigation/native'
import EditTextRecipeMenu from '../../../components/recipe/menu/EditTextRecipeMenu'
import EditPreviewRecipeMenu from '../../../components/recipe/menu/EditPreviewRecipeMenu'
import AnimatedMenuContainer from '../../../components/recipe/menu/AnimatedMenuContainer'
import ToggleEditPreviewButton from '../../../components/recipe/menu/ToggleEditPreviewButton'
import CookedWebView from '../../../components/CookedWebView'
import { getEditRecipeUrl, getEditPreviewRecipeUrl } from '../../../urls'
import { useAuth } from '../../../context/AuthContext'

function EditRecipeText({ navigation }) {
    const route = useRoute()
    const { credentials } = useAuth()
    const [isPreviewMode, setIsPreviewMode] = useState(false)
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

    const recipeId = route.params?.recipeId

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
            setIsKeyboardVisible(true)
        })
        const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
            setIsKeyboardVisible(false)
        })

        return () => {
            keyboardDidShowListener?.remove()
            keyboardDidHideListener?.remove()
        }
    }, [])

    const handleToggle = () => {
        setIsPreviewMode(!isPreviewMode)
    }

    const routeHandler = useCallback(
        () => { },
        [],
    )

    const editUrl = isPreviewMode ? getEditPreviewRecipeUrl(recipeId) : getEditRecipeUrl(recipeId)

    return (
        <View style={{ flex: 1 }}>
            <View style={styles.content}>
                <CookedWebView
                    key={editUrl}
                    startUrl={editUrl}
                    navigation={navigation}
                    route={route}
                    onRequestPath={routeHandler}
                    disableRefresh={false}
                    style={styles.webView}
                    contentInset={{ top: 139 }}
                />
            </View>

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.menuContainer}>
                    <AnimatedMenuContainer visible={!isPreviewMode && !isKeyboardVisible}>
                        <EditTextRecipeMenu />
                    </AnimatedMenuContainer>

                    <AnimatedMenuContainer visible={isPreviewMode && !isKeyboardVisible}>
                        <EditPreviewRecipeMenu />
                    </AnimatedMenuContainer>

                    <View style={styles.toggleButtonContainer}>
                        <ToggleEditPreviewButton
                            isPreviewMode={isPreviewMode}
                            onToggle={handleToggle}
                        />
                    </View>
                </View>
            </SafeAreaView>
        </View>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
    },
    content: {
        backgroundColor: 'transparent',
        flex: 1,
    },
    menuContainer: {
        backgroundColor: 'transparent',
        position: 'relative',
        height: 96, // Height to contain the menus
        marginTop: 8,
    },
    toggleButtonContainer: {
        position: 'absolute',
        top: 0,
        right: 16,
    },
    webView: {
        flex: 1,
    },
})

export default observer(EditRecipeText)
