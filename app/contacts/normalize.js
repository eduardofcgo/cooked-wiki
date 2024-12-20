import { getLocales } from 'expo-localization'
import { parsePhoneNumberWithError, getCountryCallingCode } from 'libphonenumber-js'

const defaultCountryCode = 'US'

function getCountryCode() {
  const locales = getLocales()

  return locales[0]?.regionCode || defaultCountryCode
}

export function normalizePhoneNumberNaive(phoneNumber) {
  const digits = phoneNumber.replace(/(?!^\+)[^\d]/g, '')

  if (digits.length <= 8) {
    return null
  }

  if (digits.startsWith('00')) return '+' + digits.slice(2)
  if (digits.startsWith('+')) return digits

  return '+' + getCountryCallingCode(getCountryCode()) + digits
}

export function normalizePhoneNumber(phoneNumber) {
  const parsed = parsePhoneNumberWithError(phoneNumber, { defaultCountry: getCountryCode() })

  return parsed.format('E.164')
}

export function normalizeEmail(email) {
  const normalizedEmail = email.toLowerCase().replace(/\s+/g, '').replace(/\.\.+/g, '.')

  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

  return normalizedEmail.match(emailRegex) && normalizedEmail
}
