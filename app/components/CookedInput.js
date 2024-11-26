import React, { useState } from 'react';
import { View, TextInput, Image, TouchableOpacity, Text, StyleSheet, Dimensions, Modal } from 'react-native';
import { ArrowLeft as ArrowLeftIcon } from 'lucide-react-native'
import CookedButton from './CookedButton';
import CookedButtonSecondary from './CookedButtonSecondary';

const CookedInput = ({imagePath, onUndo, route, navigation}) => {
  const [notes, setNotes] = useState('');
  const [recipeName, setRecipeName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => {
    setModalVisible(true);
  };

  const handleUndo = () => {
    onUndo()
  }

  const openFullScreenImage = () => {
    if (imagePath) {
      navigation.navigate('CookedFullScreenImage', { imagePath });
    }
  };

  return (
    <View style={styles.container} >
      <TouchableOpacity style={styles.imageContainer} onPress={openFullScreenImage}>
        {imagePath ? (
          <Image source={{ uri: imagePath }} style={styles.image}/>
        ) : (
          <Text style={styles.addPhotoText}>No photo</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.tip}>You can select one of your recipes</Text>
      <View style={styles.recipeNameContainer}>
        <TextInput
          style={styles.recipeNameInput}
          placeholder={'Recipe name'}
          value={recipeName}
          onChangeText={setRecipeName}
        />
        <TouchableOpacity style={styles.modalButton} onPress={openModal}>
          <Text style={styles.modalButtonText}>⋯</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.tip}>Customize your notes</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={'Customize your notes'}
          multiline
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <View style={styles.buttonContainer}>
        <CookedButtonSecondary onPress={handleUndo}> <ArrowLeftIcon color='white' size={10} /> Undo</CookedButtonSecondary>
        <CookedButton>Save</CookedButton>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text>This is a modal!</Text>
          <CookedButton onPress={() => setModalVisible(false)}>Close Modal</CookedButton>
        </View>
      </Modal>
    </View>
  );
};

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    height: height - 200,
    borderRadius: 5,
    marginTop: 20,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#efede3',
  },
  imageContainer: {
    width: 150,
    height: 150,
    backgroundColor: '#fafaf7',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#706b57',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  addPhotoText: {
    color: '#888',
  },
  recipeNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'white',
    borderColor: '#706b57',
    borderWidth: 1,
    borderRadius: 5,
    overflow: 'hidden',
  },
  recipeNameInput: {
    flex: 1,
    fontSize: 20,
    padding: 8,
  },
  modalButton: {
    paddingRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#f0f0f0',
    // borderLeftWidth: 1,
    borderLeftColor: '#706b57',
  },
  modalButtonText: {
    color: '#706b57',
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputContainer: {
    height: '43%',
    backgroundColor: 'white',
    borderColor: '#706b57',
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    minHeight: 100,
    marginBottom: 16,
  },
  tip: {
    color: 'gray',
  },
  input: {
    flex: 1,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  undoButton: {
    backgroundColor: '#6c757d', // A neutral color for the undo button
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
});

export default CookedInput;