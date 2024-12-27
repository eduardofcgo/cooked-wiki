import React, { useCallback, memo } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native'

import { getPhotoUrl } from '../../urls';

import { theme } from '../../style/style'

import { PrimaryButton, SecondaryButton } from '../Button'

const EditableImage = memo(({ path, index, onExclude }) => (
  <View style={[styles.imageContainer, styles.imageContainerEditing]}>
    <Image
      source={{ uri: getPhotoUrl(path) }}
      style={[styles.mainImage, { width: 110, height: 110, borderRadius: theme.borderRadius.default }]}
    />
    <SecondaryButton title="Exclude" onPress={() => onExclude(index)} style={styles.excludeButton} />
  </View>
));

const AddImageButton = memo(({ onPress }) => (
  <TouchableOpacity
    style={[styles.addImageButton, { width: 110, height: 110 }]}
    onPress={onPress}
  >
    <Text style={styles.addImageText}>📸 Add photo</Text>
  </TouchableOpacity>
));

export default function CookedEdit({
  post,
  onSave,
  onCancel
}) {  
  const handleExcludeImage = useCallback((index) => {
    const updatedPhotos = post['cooked-photos-path'].filter((_, i) => i !== index);
    onSave({ ...post, 'cooked-photos-path': updatedPhotos });
  }, [post, onSave]);

  const handleNotesChange = useCallback((text) => {
    onSave({ ...post, notes: text });
  }, [post, onSave]);

  const handleAddImage = useCallback(() => {
    // TODO: Implement image picker logic
  }, []);

  return (
    <View style={styles.modalContainer}>
      <ScrollView
        horizontal
        style={styles.imageScrollView}
        contentContainerStyle={styles.imageScrollEditContent}
      >
        {post['cooked-photos-path']?.map((path, index) => (
          <EditableImage
            key={index}
            path={path}
            index={index}
            onExclude={handleExcludeImage}
          />
        ))}
        <View style={[styles.imageContainer, styles.imageContainerEditing]}>
          <AddImageButton onPress={handleAddImage} />
        </View>
      </ScrollView>

      <View style={[styles.editContainer, { height: 240 }]}>
        <TextInput
          multiline
          value={post.notes}
          onChangeText={handleNotesChange}
          style={styles.editInput}
        />
      </View>

      <View style={styles.actionsContainer}>
        <PrimaryButton onPress={onSave} title="Save" />
        <SecondaryButton onPress={onCancel} title="Cancel" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: theme.colors.secondary,
  },
  imageScrollView: {
    flexGrow: 0,
  },
  imageScrollEditContent: {
    marginLeft: 15,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
  },
  imageContainerEditing: {
    marginRight: 15,
    marginVertical: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  mainImage: {
    resizeMode: 'cover',
    backgroundColor: 'transparent',
  },
  excludeButton: {
    position: 'absolute',
    top: '40%',
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  addImageButton: {
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: theme.borderRadius.default,
  },
  addImageText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.default,
    fontFamily: theme.fonts.default,
  },
  editContainer: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingBottom: 15,
    backgroundColor: theme.colors.secondary,
  },
  editInput: {
    flex: 1,
    fontFamily: theme.fonts.default,
    fontSize: theme.fontSizes.default,
    borderWidth: 1,
    borderColor: theme.colors.softBlack,
    backgroundColor: theme.colors.background,
    borderRadius: 5,
    padding: 10,
    textAlignVertical: 'top',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: theme.colors.secondary,
    borderTopWidth: 0,
    borderTopColor: theme.colors.secondary,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
});
