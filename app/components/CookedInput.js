import React, { useState } from 'react';
import { View, TextInput, Image, TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import CookedButton from './CookedButton'

const CookedInput = () => {
  const [note, setNote] = useState('');
  const [image, setImage] = useState(null);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.imageContainer}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={styles.addPhotoText}>Add photo</Text>
        )}
      </TouchableOpacity>

        <TextInput
          style={styles.recipeNameInput}
          placeholder={'Recipe name'}
        />

      <View style={styles.inputContainer}>
        <Text style={styles.placeholder}> ✏️ Tip: customize your notes</Text>
        <TextInput
          style={styles.input}
          multiline
          value={note}
          onChangeText={setNote}
        />
      </View>

      <CookedButton>Save</CookedButton>
    </View>
  );
};

const { height } = Dimensions.get('window');

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
  recipeNameInputContainer: {
    height: 70,
    backgroundColor: 'white',
    borderColor: '#706b57',
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    marginBottom: 16,
  },
  inputContainer: {
    height: '50%',
    backgroundColor: 'white',
    borderColor: '#706b57',
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    minHeight: 100,
    marginBottom: 16,
  },
  placeholder: {
    position: 'absolute',
    top: 8,
    left: 8,
    color: 'gray',
    zIndex: 1,
  },
  recipeNameInput: {
    fontSize: 20,
    // fontFamily: 'Times-New-Roman',
    backgroundColor: 'white',
    borderColor: '#706b57',
    borderWidth: 1,
    borderRadius: 5,
    padding: 8,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    paddingTop: 24, // Space for the placeholder
    fontSize: 16,
    textAlignVertical: 'top', // Ensures text starts from the top
  },
  saveButton: {
    backgroundColor: '#8D7B68',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
});

export default CookedInput;
