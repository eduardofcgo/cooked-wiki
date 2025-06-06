import React, { useState } from 'react'
import { observer } from 'mobx-react-lite'
import { View, Text, SafeAreaView, StyleSheet, Platform, StatusBar } from 'react-native'
import EditTextRecipeMenu from '../../../components/recipe/menu/EditTextRecipeMenu'
import EditPreviewRecipeMenu from '../../../components/recipe/menu/EditPreviewRecipeMenu'
import AnimatedMenuContainer from '../../../components/recipe/menu/AnimatedMenuContainer'
import ToggleEditPreviewButton from '../../../components/recipe/menu/ToggleEditPreviewButton'

function EditRecipeText() {
    const [isPreviewMode, setIsPreviewMode] = useState(false)

    const handleToggle = () => {
        setIsPreviewMode(!isPreviewMode)
    }

    return (
        <View style={{ flex: 1 }}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.menuContainer}>
                    <AnimatedMenuContainer visible={!isPreviewMode}>
                        <EditTextRecipeMenu />
                    </AnimatedMenuContainer>

                    <AnimatedMenuContainer visible={isPreviewMode}>
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

            <View style={styles.content}>
                <Text>Edit Recipe Text</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: 'transparent',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    content: {
        flex: 1,
        paddingTop: 140,
        padding: 16,
    },
    menuContainer: {
        position: 'relative',
        height: 96, // Height to contain the menus
        marginTop: 8,
    },
    toggleButtonContainer: {
        position: 'absolute',
        top: 0,
        right: 16,
    },
})

export default observer(EditRecipeText)
