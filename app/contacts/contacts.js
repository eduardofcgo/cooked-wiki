import CryptoJS from 'crypto-js'
import * as Contacts from 'expo-contacts'
import { normalizeEmail, normalizePhoneNumber, normalizePhoneNumberNaive } from './normalize'

export async function getContactHashes() {
  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
  })

  const uniqueContacts = new Set()

  for (const contact of data) {
    if (contact.phoneNumbers) {
      for (const { number } of contact.phoneNumbers) {
        if (number?.length > 8) {
          try {
            uniqueContacts.add(normalizePhoneNumber(number))
          } catch (e) {
            console.log('Error normalizing phone number', number)

            try {
              const normalizedPhoneNumber = normalizePhoneNumberNaive(number)

              if (normalizedPhoneNumber) {
                uniqueContacts.add(normalizedPhoneNumber)
              }
            } catch (e) {
              console.log('Error normalizing phone number naive', number)
            }
          }
        }
      }
    }

    if (contact.emails) {
      for (const { email } of contact.emails) {
        if (email?.length > 8) {
          const normalizedEmail = normalizeEmail(email)

          if (normalizedEmail) {
            uniqueContacts.add(normalizedEmail)
          }
        }
      }
    }
  }

  return Array.from(uniqueContacts).map(contact => CryptoJS.MD5(contact).toString())
}
