import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { theme } from '../../../style/style'
import { useNavigation } from '@react-navigation/native'

function EditTextRecipeMenu() {
    const navigation = useNavigation()

    return (
        <View style={styles.menuBarContainer}>
            <View style={styles.menuBar}>
                <View style={styles.leftButtons}>
                    <TouchableOpacity style={[styles.menuButton, { minWidth: 60 }]} onPress={() => navigation.goBack()}>
                        <MaterialCommunityIcons name='close' size={22} color={theme.colors.softBlack} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuButton}>
                        <MaterialCommunityIcons name='undo' size={15} color={theme.colors.softBlack} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuButton}>
                        <MaterialCommunityIcons name='redo' size={15} color={theme.colors.softBlack} />
                    </TouchableOpacity>

                </View>

                <View style={styles.rightButtons}>
                    <TouchableOpacity style={styles.actionButton}>
                        <MaterialCommunityIcons name='format-list-bulleted' size={16} color={theme.colors.softBlack} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <MaterialCommunityIcons name='format-list-numbered' size={16} color={theme.colors.softBlack} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton}>
                        <MaterialCommunityIcons name='dots-horizontal' size={16} color={theme.colors.softBlack} />
                    </TouchableOpacity>
                </View>

                <View style={styles.rightSpacer} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    menuBar: {
        flexGrow: 1,
        backgroundColor: theme.colors.secondary,
        height: 64,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    menuBarContainer: {
        backgroundColor: 'transparent',
        marginHorizontal: 16,
        marginRight: 96, // Leave space for the toggle button (64px button + 16px margin + 16px padding)
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    menuButton: {
        padding: 8,
        alignItems: 'center',
    },
    leftButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    rightButtons: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        paddingHorizontal: 8,
        paddingVertical: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        borderRadius: 8,
    },
    actionButtonText: {
        fontSize: theme.fontSizes.small,
        fontFamily: theme.fonts.ui,
        color: theme.colors.softBlack,
    },
})

export default EditTextRecipeMenu
