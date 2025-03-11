import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

const NotificationContext = createContext()

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const notification = notifications[0]

  const dropExcessNotifications = useCallback(queue => {
    return queue.length > 5 ? queue.slice(-5) : queue
  }, [])

  const showNotification = useCallback(
    (component, { props, resetQueue = false } = {}) => {
      const newNotification = {
        id: Date.now().toString(),
        component,
        props,
        visible: true,
      }

      if (resetQueue) {
        setNotifications([newNotification])
      } else {
        setNotifications(prev => {
          const updatedQueue = [...prev, newNotification]
          return dropExcessNotifications(updatedQueue)
        })
      }
    },
    [dropExcessNotifications],
  )

  const handleNotificationClose = useCallback(() => {
    setNotifications(prev => {
      if (prev.length > 1) {
        const nextNotifications = [...prev]
        nextNotifications.shift()

        return nextNotifications
      }
      return []
    })
  }, [])

  const onShownNotification = useCallback(() => {
    setTimeout(() => {
      setNotifications(prev => {
        const nextNotifications = [...prev]
        const notificationIndex = nextNotifications.findIndex(n => n.id === notification?.id)
        if (notificationIndex !== -1) {
          nextNotifications[notificationIndex] = {
            ...nextNotifications[notificationIndex],
            visible: false,
          }
        }
        return nextNotifications
      })
    }, 3000)
  }, [notification?.id])

  useEffect(() => {
    if (notification?.id !== undefined) {
      onShownNotification()
    }
  }, [notification?.id])

  const value = {
    showNotification,
  }

  const { component, props, visible } = notification || {}

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {component &&
        React.createElement(component, {
          ...props,
          visible: visible,
          onClose: () => {
            if (props.onClose) {
              props.onClose()
            }

            handleNotificationClose()
          },
        })}
    </NotificationContext.Provider>
  )
}
