import React, { useState, useEffect, useCallback, useRef } from 'react'
import { observer } from 'mobx-react-lite'
import { View, SafeAreaView, StyleSheet, Keyboard, ActivityIndicator, Text, DeviceEventEmitter, Platform, StatusBar, Alert } from 'react-native'
import { useRoute, usePreventRemove, useNavigationState } from '@react-navigation/native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import EditTextRecipeMenu from '../../../components/recipe/menu/EditTextRecipeMenu'
import EditPreviewRecipeMenu from '../../../components/recipe/menu/EditPreviewRecipeMenu'
import AnimatedMenuContainer from '../../../components/recipe/menu/AnimatedMenuContainer'
import ToggleEditPreviewButton from '../../../components/recipe/menu/ToggleEditPreviewButton'
import EditRecipeTextWebview from '../../../components/recipe/EditRecipeTextWebview'
import EditRecipePreviewWebview from '../../../components/recipe/EditRecipePreviewWebview'
import { useInAppNotification } from '../../../context/NotificationContext'
import ActionToast from '../../../components/notification/ActionToast'
import { useApi } from '../../../context/ApiContext'
import ModalCard from '../../../components/core/ModalCard'
import { PrimaryButton, TransparentButton } from '../../../components/core/Button'
import Bounce from '../../../components/core/Bounce'
import { theme } from '../../../style/style'

function EditRecipeText({ navigation }) {
    const route = useRoute()
    const navState = useNavigationState(state => state)

    const [isPreviewMode, setIsPreviewMode] = useState(false)
    const [isSavingRecipe, setIsSavingRecipe] = useState(false)
    const [isLoadingPreview, setIsLoadingPreview] = useState(false)
    const [previewHtml, setPreviewHtml] = useState(undefined)
    const [canUndo, setCanUndo] = useState(false)
    const [canRedo, setCanRedo] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    const [showDiscardModal, setShowDiscardModal] = useState(false)

    const webviewRef = useRef()

    const { showInAppNotification } = useInAppNotification()
    const apiClient = useApi()

    const recipeId = route.params?.recipeId

    usePreventRemove(hasUnsavedChanges, ({ data }) => {
        setShowDiscardModal(true)
    })

    const handleDiscard = useCallback(() => {
        setShowDiscardModal(false)
        setHasUnsavedChanges(false)

        setTimeout(() => {
            navigation.goBack()
        }, 1)
    }, [navigation])

    const handleCloseDiscardModal = useCallback(() => {
        setShowDiscardModal(false)
    }, [])

    const handleClose = useCallback(() => {
        if (hasUnsavedChanges) {
            setShowDiscardModal(true)
        } else {
            navigation.goBack()
        }
    }, [hasUnsavedChanges, navigation])

    const handleUndo = useCallback(() => {
        if (webviewRef.current && webviewRef.current.blurEditor) {
            webviewRef.current.undo()
        }
    }, [])

    const handleRedo = useCallback(() => {
        if (webviewRef.current && webviewRef.current.blurEditor) {
            webviewRef.current.redo()
        }
    }, [])

    const handleSaveRecipe = useCallback(() => {
        if (webviewRef.current && webviewRef.current.getEditedRecipeHTML) {
            webviewRef.current.getEditedRecipeHTML('saveRecipe')
            setIsSavingRecipe(true)
            webviewRef.current?.blurEditor()
        }
    }, [])

    const handlePreviewRecipe = useCallback(() => {
        if (Platform.OS === 'android') {
            Alert.alert(
                'Preview Not Available',
                'Preview mode is not supported on Android yet.',
                [{ text: 'OK' }]
            )
            return
        }

        if (webviewRef.current && webviewRef.current.getEditedRecipeHTML) {
            webviewRef.current.getEditedRecipeHTML('previewRecipe')
            setIsLoadingPreview(true)
            webviewRef.current?.blurEditor()
        }
    }, [])

    const handleOnReceiveEditorUpdate = useCallback(message => {
        const { canUndo, canRedo } = message.controls

        setHasUnsavedChanges(true)

        setCanUndo(canUndo)
        setCanRedo(canRedo)
    }, [])

    const refreshRecipeScreensInStack = useCallback(() => {
        DeviceEventEmitter.emit('recipe.updated', {
            recipeId: recipeId,
            timestamp: Date.now(),
        })
    }, [recipeId])

    const handleOnReceiveEditedRecipeHTML = useCallback(
        message => {
            if (message.id === 'saveRecipe') {
                apiClient
                    .post(`/recipe/${recipeId}/edit/update`, {
                        'editor-recipe-html': message.html,
                    })
                    .then(response => {
                        setHasUnsavedChanges(false)
                        showInAppNotification(ActionToast, {
                            props: { message: 'Recipe saved successfully', actionType: 'save' },
                        })

                        refreshRecipeScreensInStack()
                    })
                    .catch(error => {
                        console.error(error)
                        showInAppNotification(ActionToast, {
                            props: { message: 'Error saving recipe', actionType: 'error' },
                        })
                    })
                    .finally(() => {
                        setIsSavingRecipe(false)
                    })
            } else if (message.id === 'previewRecipe') {
                setPreviewHtml(message.html)
                setIsPreviewMode(true)
                setIsLoadingPreview(false)
            }
        },
        [apiClient, recipeId, showInAppNotification, refreshRecipeScreensInStack],
    )

    const restoreTextMode = useCallback(() => {
        setIsPreviewMode(false)
        // Not sure if we need to restore from state, sometimes a webview can become "blank"
        // when the user puts the app in the background, this way as long as this EditText
        // component is mounted, the state is not lost.
        // TODO: localstorage so that the user does not loose changes if closes the app.
        // if (webviewRef.current && webviewRef.current.setEditedRecipeHTML) {
        //     webviewRef.current.setEditedRecipeHTML(previewHtml)
        // }
    }, [previewHtml])

    return (
        <>
            <View style={{ flex: 1 }}>
                <View style={styles.content}>
                    <View style={[styles.webviewContainer, { zIndex: isPreviewMode ? 1 : 2 }]}>
                        <EditRecipeTextWebview
                            ref={webviewRef}
                            recipeId={recipeId}
                            navigation={navigation}
                            route={route}
                            onReceiveEditedRecipeHTML={handleOnReceiveEditedRecipeHTML}
                            onReceiveEditorUpdate={handleOnReceiveEditorUpdate}
                        />
                    </View>

                    {isPreviewMode && (
                        <View style={[styles.webviewContainer, { zIndex: 2 }]}>
                            <EditRecipePreviewWebview
                                recipeId={recipeId}
                                navigation={navigation}
                                route={route}
                                editedRecipeHtml={previewHtml}
                            />
                        </View>
                    )}
                </View>

                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.menuContainer}>
                        <AnimatedMenuContainer visible={!isPreviewMode}>
                            <EditTextRecipeMenu
                                onSaveRecipe={handleSaveRecipe}
                                hasUnsavedChanges={hasUnsavedChanges}
                                isSavingRecipe={isSavingRecipe}
                                canUndo={canUndo}
                                canRedo={canRedo}
                                onUndo={handleUndo}
                                onRedo={handleRedo}
                                onClose={handleClose}
                            />
                        </AnimatedMenuContainer>

                        <AnimatedMenuContainer visible={isPreviewMode}>
                            <EditPreviewRecipeMenu
                                onSaveRecipe={handleSaveRecipe}
                                hasUnsavedChanges={hasUnsavedChanges}
                                isSavingRecipe={isSavingRecipe}
                                onClose={handleClose}
                            />
                        </AnimatedMenuContainer>

                        <View style={styles.toggleButtonContainer}>
                            <ToggleEditPreviewButton
                                isPreviewMode={isPreviewMode}
                                isLoadingPreview={isLoadingPreview}
                                onToggle={!isPreviewMode ? handlePreviewRecipe : restoreTextMode}
                            />
                        </View>
                    </View>
                </SafeAreaView>
            </View>

            <ModalCard
                visible={showDiscardModal}
                onClose={handleCloseDiscardModal}
                titleComponent={
                    <View style={modalStyles.titleContainer}>
                        <Bounce delay={0}>
                            <MaterialCommunityIcons name='alert-circle' size={40} color={theme.colors.primary} />
                        </Bounce>
                        <Text style={modalStyles.modalTitle}>Discard changes?</Text>
                    </View>
                }
            >
                <Text style={modalStyles.modalText}>You have unsaved changes. Are you sure you want to go back?</Text>
                <View style={modalStyles.modalButtons}>
                    <PrimaryButton title='Discard' onPress={handleDiscard} />
                    <TransparentButton title='Cancel' onPress={handleCloseDiscardModal} />
                </View>
            </ModalCard>
        </>
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
    webviewContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    menuContainer: {
        backgroundColor: 'transparent',
        position: 'relative',
        height: 96, // Height to contain the menus
        marginTop: Platform.OS === 'android' ? StatusBar.currentHeight - 8 : 8,
    },
    toggleButtonContainer: {
        position: 'absolute',
        top: 0,
        right: 16,
    },
})

const modalStyles = StyleSheet.create({
    titleContainer: {
        flex: 1,
        gap: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    modalText: {
        fontFamily: theme.fonts.ui,
        fontSize: theme.fontSizes.default,
        color: theme.colors.softBlack,
        marginBottom: 24,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
    },
    modalTitle: {
        fontFamily: theme.fonts.title,
        fontSize: theme.fontSizes.large,
        color: theme.colors.black,
    },
})

export default observer(EditRecipeText)
