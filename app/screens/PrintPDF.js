import React, { useCallback, useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import Share from 'react-native-share'
import Pdf from 'react-native-pdf'
import { theme } from '../style/style'
import LoadingScreen from './Loading'
import { observer } from 'mobx-react-lite'
import GenericError from '../components/core/GenericError'
import { useApi } from '../context/ApiContext'
import { ApiError } from '../api/client'

// TODO: clean this up and move to a seperate hook

function PrintPDF({ navigation, route }) {
  const { path } = route.params

  const apiClient = useApi()

  const [pdfSource, setPdfSource] = useState(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(undefined)
  const [retryableError, setRetryableError] = useState(undefined)

  const downloadPdf = useCallback(async () => {
    if (!path) {
      setError('No path provided')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    setRetryableError(false)

    try {
      const blob = await apiClient.downloadPdf(path)

      // Convert blob to data URL
      const reader = new FileReader()

      reader.onload = () => {
        setPdfSource({ uri: reader.result })
        setLoading(false)
      }

      reader.onerror = () => {
        setError('Failed to read PDF data')
        setLoading(false)
      }

      reader.readAsDataURL(blob)
    } catch (error) {
      if (error instanceof ApiError) {
        // Handle specific PDF-related status codes
        if (error.status === 404) {
          setError('Recipe not found')
        } else if (error.status === 403 || error.status === 401) {
          setError('You are not authorized to view this recipe')
        } else if (error.status === 423) {
          setError('PDF generation already in progress. Please try again.')
          setRetryableError(true)
        } else {
          setError('Network error')
          setRetryableError(true)
        }
      } else {
        setError('Unexpected error')
        setRetryableError(true)
      }
      setLoading(false)
    }
  }, [path, apiClient])

  useEffect(() => {
    downloadPdf()
  }, [downloadPdf])

  const onPrint = useCallback(async () => {
    if (!pdfSource) {
      Alert.alert('Error', 'PDF not loaded yet')
      return
    }

    try {
      await Share.open({
        url: pdfSource.uri,
        title: 'Print Recipe',
        message: 'Print Recipe PDF',
        type: 'application/pdf',
        showAppsToView: true,
        forceDialog: true,
      })
    } catch (error) {
      if (error.message !== 'User did not share') {
        console.log('Error printing:', error)
        Alert.alert('Error', 'Failed to print PDF')
      }
    }
  }, [pdfSource])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={onPrint}
            hitSlop={{ top: 20, bottom: 20, left: 10, right: 20 }}
            disabled={loading || error}
            style={{ opacity: loading || error ? 0.5 : 1 }}
          >
            <MaterialIcons name='print' size={24} color={theme.colors.softBlack} />
          </TouchableOpacity>
        </View>
      ),
    })
  }, [navigation, onPrint, loading, error])

  if (!path) {
    return null
  }

  if (loading) {
    return <LoadingScreen />
  }

  if (error) {
    return <GenericError onRetry={retryableError ? downloadPdf : undefined} customMessage={error} />
  }

  return (
    <View style={styles.container}>
      <Pdf
        source={pdfSource}
        onLoadComplete={(numberOfPages, filePath) => {
          console.log(`Number of pages: ${numberOfPages}`)
        }}
        onPageChanged={(page, numberOfPages) => {
          console.log(`Current page: ${page}`)
        }}
        onError={error => {
          console.log('PDF Error:', error)
          setError('Failed to load PDF')
        }}
        style={styles.pdf}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdf: {
    flex: 1,
    width: '100%',
    backgroundColor: 'white',
  },
})

export default observer(PrintPDF)
