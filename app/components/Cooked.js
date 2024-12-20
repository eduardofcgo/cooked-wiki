import React, { useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, ScrollView, Animated } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { faComment } from '@fortawesome/free-regular-svg-icons';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { theme } from '../style/style';
import { PrimaryButton, SecondaryButton } from './Button';
import Modal from './Modal';

const CookedView = ({ post, onEdit, onComment, onReply, onLikeComment, onRecipePress, onLoadMore }) => {
  const scrollY = useRef(new Animated.Value(0)).current;
  const actionsTranslateY = scrollY.interpolate({
    inputRange: [400, 401], // Adjust based on your layout
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const actionsOpacity = scrollY.interpolate({
    inputRange: [400, 401], // Same values as above
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={styles.stickyHeader}>
        <View style={styles.authorContainer}>
          <Image source={{ uri: post.authorAvatar }} style={styles.avatar} />
          <Text style={styles.cookedHeaderText}>{post.authorName}</Text>
          <Text style={styles.separator}>•</Text>
          <TouchableOpacity style={styles.recipeNameContainer} onPress={onRecipePress}>
            <Text style={[styles.cookedHeaderText, styles.recipeNameText]} numberOfLines={2}>
              {null || "Croissants À Moda Do Porto Com Sourdough"}
            </Text>
            <FontAwesomeIcon icon={faChevronRight} size={14} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View style={[
        styles.floatingActions,
        {
          transform: [{
            translateY: actionsTranslateY.interpolate({
              inputRange: [0, 1],
              outputRange: [-1000, 55] // 55 should match your header height
            })
          }],
          opacity: actionsOpacity // Add opacity animation
        }
      ]}>
        <View style={styles.actionsContainer}>
          {post.canEdit ? (
            <TouchableOpacity onPress={onEdit}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onComment}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesomeIcon icon={faComment} size={20} color={theme.colors.primary} style={{ marginRight: 5 }} />
                <Text style={styles.editButton}>Comment</Text>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => {/* Handle like */}}>
            <FontAwesomeIcon
              icon={post.isLiked ? faHeartSolid : faHeartRegular}
              size={20}
              color={!post.isLiked ? theme.colors.primary : "#e86a92"}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView 
        style={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <ScrollView style={styles.imageScrollView} contentContainerStyle={styles.imageScrollViewContent}>
          <View style={styles.imageContainerNormal}>
            <Image
              source={{ uri: post.image }}
              style={[styles.mainImage, { width: '100%', height: 300 }]}
            />
          </View>
        </ScrollView>

        <View style={[styles.viewContainer, { height: 100 }]}>
          <Text style={styles.description}>{post.description}</Text>
        </View>

        <View style={styles.actionsContainer}>
          {post.canEdit ? (
            <TouchableOpacity onPress={onEdit}>
              <Text style={styles.editButton}>Edit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onComment}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesomeIcon icon={faComment} size={20} color={theme.colors.primary} style={{ marginRight: 5 }} />
                <Text style={styles.editButton}>Comment</Text>
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => {/* Handle like */}}>
            <FontAwesomeIcon
              icon={post.isLiked ? faHeartSolid : faHeartRegular}
              size={20}
              color={!post.isLiked ? theme.colors.primary : "#e86a92"}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsHeader}>Comments</Text>
          {post.comments?.slice(0, post.commentsToShow).map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <Image source={{ uri: comment.authorAvatar }} style={styles.commentAvatar} />
              <View style={styles.commentContent}>
                <Text style={styles.commentAuthor}>{comment.authorName}</Text>
                <Text style={styles.commentText}>
                  {comment.replyTo && (
                    <Text style={styles.mentionText}>@{comment.replyTo} </Text>
                  )}
                  {comment.text}
                </Text>
                <View style={styles.commentActions}>
                  <TouchableOpacity onPress={() => onReply(comment)} style={styles.commentAction}>
                    <Text style={styles.commentActionText}>Reply</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onLikeComment(comment.id)} style={styles.commentAction}>
                    <FontAwesomeIcon
                      icon={comment.isLiked ? faHeartSolid : faHeartRegular}
                      size={14}
                      color={!comment.isLiked ? theme.colors.primary : "#e86a92"}
                    />
                    {comment.likes > 0 && (
                      <Text style={styles.commentLikeCount}>{comment.likes}</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          
          {post.comments?.length > post.commentsToShow && (
            <TouchableOpacity onPress={onLoadMore} style={styles.loadMoreButton}>
              <Text style={styles.loadMoreText}>
                Load More
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.similarSection}>
          <Text style={styles.similarHeader}>Similar Cooked</Text>
          {/* TODO: Add similar cookeds content here */}
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const CookedEdit = ({
  post,
  images,
  setImages,
  editedDescription,
  setEditedDescription,
  onSave,
  onCancel
}) => {
  const handleExcludeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleAddImage = () => {
    // TODO: Implement image picker logic
  };

  return (
    <View style={styles.modalContainer}>
      <ScrollView
        horizontal
        style={styles.imageScrollView}
        contentContainerStyle={styles.imageScrollEditContent}
      >
        {images.map((image, index) => (
          <View key={index} style={[styles.imageContainer, styles.imageContainerEditing]}>
            <Image
              source={{ uri: image }}
              style={[styles.mainImage, { width: 110, height: 110, borderRadius: theme.borderRadius.default }]}
            />
            <SecondaryButton title="Exclude" onPress={() => handleExcludeImage(index)} style={styles.excludeButton} />
          </View>
        ))}
        <View style={[styles.imageContainer, styles.imageContainerEditing]}>
          <TouchableOpacity
            style={[styles.addImageButton, { width: 110, height: 110 }]}
            onPress={handleAddImage}
          >
            <Text style={styles.addImageText}>📸 Add photo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={[styles.editContainer, { height: 240 }]}>
        <TextInput
          multiline
          value={editedDescription}
          onChangeText={setEditedDescription}
          style={styles.editInput}
        />
      </View>

      <View style={styles.actionsContainer}>
        <PrimaryButton onPress={onSave} title="Save" />
        <SecondaryButton onPress={onCancel} title="Cancel" />
      </View>
    </View>
  );
};

const CommentModal = ({ visible, onClose, onSubmit, replyTo = null }) => {
  const [comment, setComment] = useState('');

  const handleSubmit = () => {
    onSubmit(comment, replyTo);
    setComment('');
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={replyTo ? `Reply to ${replyTo.authorName}` : "Add Comment"}
    >
      <View style={[styles.editContainer, { height: 120 }]}>
        <TextInput
          multiline
          value={comment}
          onChangeText={setComment}
          style={styles.editInput}
          placeholder={replyTo ? `Reply to @${replyTo.authorName}...` : "Write your comment..."}
        />
      </View>

      <View style={styles.actionsContainer}>
        <PrimaryButton onPress={handleSubmit} title="Post" />
        <SecondaryButton onPress={onClose} title="Cancel" />
      </View>
    </Modal>
  );
};

const Cooked = ({ post }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editedDescription, setEditedDescription] = useState(post.description);
  const [images, setImages] = useState([post.image]);
  const [commentsToShow, setCommentsToShow] = useState(5); // Show first 5 comments initially

  // Add demo comments with mentions
  const demoComments = [
    {
      id: 1,
      authorName: "Sarah Chen", 
      authorAvatar: "https://randomuser.me/api/portraits/women/1.jpg",
      text: "This looks amazing! 😍 Could you share the recipe?",
      likes: 3,
      isLiked: false,
    },
    {
      id: 2,
      authorName: "John Doe",
      authorAvatar: "https://randomuser.me/api/portraits/men/4.jpg", 
      text: "I'd love to know the recipe too!",
      replyTo: "Sarah Chen",
      likes: 1,
      isLiked: false,
    },
    {
      id: 3,
      authorName: "Maria Garcia",
      authorAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
      text: "I made this yesterday and it turned out perfect! The crust was so flaky and buttery 🥐",
      likes: 8,
      isLiked: true,
    },
    {
      id: 4,
      authorName: "David Kim",
      authorAvatar: "https://randomuser.me/api/portraits/men/2.jpg",
      text: "Great job! What temperature did you bake these at?",
      replyTo: "Maria Garcia",
      likes: 2,
      isLiked: false,
    },
    {
      id: 5,
      authorName: "Emma Wilson",
      authorAvatar: "https://randomuser.me/api/portraits/women/3.jpg",
      text: "These look just like the ones I had in Porto! Brings back memories ❤️",
      likes: 5,
      isLiked: false,
    },
    {
      id: 6,
      authorName: "James Smith",
      authorAvatar: "https://randomuser.me/api/portraits/men/3.jpg",
      text: "How long did you let the sourdough ferment?",
      likes: 1,
      isLiked: false,
    },
    {
      id: 7,
      authorName: "Sophie Martin",
      authorAvatar: "https://randomuser.me/api/portraits/women/4.jpg",
      text: "I've been wanting to try making sourdough croissants. This is inspiring!",
      likes: 4,
      isLiked: false,
    },
    {
      id: 8,
      authorName: "Lucas Brown",
      authorAvatar: "https://randomuser.me/api/portraits/men/5.jpg",
      text: "The lamination looks perfect! How many folds did you do?",
      likes: 6,
      isLiked: true,
    }
  ];

  const handleSave = () => {
    // TODO: Implement save logic here
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedDescription(post.description);
    setImages([post.image]);
  };

  const handleAddComment = (commentText, replyTo = null) => {
    // TODO: Implement add comment/reply logic here
    setIsCommenting(false);
    setReplyingTo(null);
  };

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setIsCommenting(true);
  };

  const handleLikeComment = (commentId) => {
    // TODO: Implement like comment logic here
  };

  const handleRecipePress = (recipeId) => {
    // TODO: Implement recipe press logic here
  };

  const handleLoadMore = () => {
    setCommentsToShow(prev => prev + 5); // Load 5 more comments
  };

  // Merge demo comments with the post
  const postWithComments = {
    ...post,
    comments: demoComments,
    commentsToShow, // Add this property
    likes: 42
  };

  return (
    <>
      <CookedView
        post={postWithComments}
        onEdit={() => setIsEditing(true)}
        onComment={() => setIsCommenting(true)}
        onReply={handleReply}
        onLikeComment={handleLikeComment}
        onRecipePress={handleRecipePress}
        onLoadMore={handleLoadMore}
      />
      <Modal
        visible={isEditing}
        onClose={handleCancel}
        title="Edit cook"
      >
        <CookedEdit
          post={post}
          images={images}
          setImages={setImages}
          editedDescription={editedDescription}
          setEditedDescription={setEditedDescription}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </Modal>
      
      <CommentModal
        visible={isCommenting}
        onClose={() => {
          setIsCommenting(false);
          setReplyingTo(null);
        }}
        onSubmit={handleAddComment}
        replyTo={replyingTo}
      />
    </>
  );
};

// Keep the existing styles
const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: theme.colors.secondary,
  },
  modalHeader: {
    paddingTop: 15,
    paddingLeft: 15,
    paddingRight: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  stickyHeader: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
    zIndex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  stickyActions: {
    backgroundColor: theme.colors.secondary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.secondary,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: theme.colors.background,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 16,
    marginRight: 10,
  },
  cookedHeaderText: {
    color: theme.colors.black,
    fontSize: theme.fontSizes.default ,
    fontFamily: theme.fonts.title,
  },
  editTitle: {
    color: theme.colors.softBlack,
    fontSize: theme.fontSizes.default ,
    fontFamily: theme.fonts.title,
  },
  mainImage: {
    resizeMode: 'cover',
    backgroundColor: 'transparent',
  },
  mainImageViewing: {
    width: '100%',
    height: 300,
  },
  mainImageEditing: {
    width: 150,
    height: 150,
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
  editButton: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.default,
    fontSize: theme.fontSizes.default,
  },
  description: {
    flex: 1,
    fontFamily: theme.fonts.default,
    fontSize: theme.fontSizes.default,
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
  actionButton: {
    backgroundColor: theme.colors.primary,
    padding: 8,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontFamily: theme.fonts.default,
    fontSize: theme.fontSizes.default,
  },
  imageScrollView: {
    flexGrow: 0,
  },
  imageScrollViewContent: {
    width: '100%',
  },
  imageScrollEditContent: {
    marginLeft: 15,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.default,
  },
  imageContainerNormal: {
    position: 'relative',
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
  imageContainerViewing: {
    width: '100%',
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
  excludeText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.default,
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
  viewContainer: {
    padding: 15,
    backgroundColor: theme.colors.secondary,
  },
  commentsSection: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.secondary,
  },
  commentsHeader: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.default,
    fontWeight: '600',
    marginBottom: 10,
    color: theme.colors.softBlack,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: theme.colors.secondary,
    padding: 10,
    borderRadius: theme.borderRadius.default,
  },
  commentAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.small,
    fontWeight: '600',
    marginBottom: 4,
    color: theme.colors.softBlack,
  },
  commentText: {
    fontFamily: theme.fonts.default,
    fontSize: theme.fontSizes.small,
    color: theme.colors.softBlack,
    lineHeight: 18,
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 12,
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  commentActionText: {
    color: theme.colors.primary,
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.default,
  },
  commentLikeCount: {
    color: theme.colors.softBlack,
    fontSize: theme.fontSizes.small,
    fontFamily: theme.fonts.default,
    marginLeft: 4,
  },
  mentionText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  recipeLabel: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.small,
    color: theme.colors.softBlack,
    marginRight: 10,
  },
  recipeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeThumb: {
    width: 30,
    height: 30,
    borderRadius: 4,
    marginRight: 10,
  },
  recipeTitle: {
    flex: 1,
    fontFamily: theme.fonts.default,
    fontSize: theme.fontSizes.default,
    color: theme.colors.primary,
  },
  separator: {
    marginHorizontal: 8,
    color: theme.colors.primary,
    fontSize: theme.fontSizes.default,
  },
  recipeNameText: {
    flex: 1,
    ellipsizeMode: 'tail',
  },
  recipeNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  floatingActions: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
    pointerEvents: 'box-none',
  },
  similarSection: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.secondary,
  },
  similarHeader: {
    fontFamily: theme.fonts.title,
    fontSize: theme.fontSizes.large,
    marginBottom: 15,
    marginTop: 15,
    color: theme.colors.black,
    textAlign: 'center',
  },
  loadMoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  loadMoreText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.default,
    fontSize: theme.fontSizes.small,
  },
});

export default Cooked;
