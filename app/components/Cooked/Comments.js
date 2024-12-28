import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native'
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome'
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons'
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons'
import { theme } from '../../style/style'

const Comments = ({ comments, commentsToShow, onReply, onLikeComment, onLoadMore }) => {
  return (
    <View style={styles.commentsSection}>
      <Text style={styles.commentsHeader}>Comments</Text>
      {comments?.slice(0, commentsToShow).map((comment, index) => (
        <View key={index} style={styles.commentItem}>
          <Image source={{ uri: comment.authorAvatar }} style={styles.commentAvatar} />
          <View style={styles.commentContent}>
            <Text style={styles.commentAuthor}>{comment.authorName}</Text>
            <Text style={styles.commentText}>
              {comment.replyTo && <Text style={styles.mentionText}>@{comment.replyTo} </Text>}
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
                  color={!comment.isLiked ? theme.colors.primary : '#e86a92'}
                />
                {comment.likes > 0 && <Text style={styles.commentLikeCount}>{comment.likes}</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {comments?.length > commentsToShow && (
        <TouchableOpacity onPress={onLoadMore} style={styles.loadMoreButton}>
          <Text style={styles.loadMoreText}>Load More</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
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
  loadMoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  loadMoreText: {
    color: theme.colors.primary,
    fontFamily: theme.fonts.default,
    fontSize: theme.fontSizes.small,
  },
})

export default Comments
