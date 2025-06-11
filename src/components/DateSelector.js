import React, { useState, useEffect, useRef } from 'react'
import { Platform, View, StyleSheet } from 'react-native'
import { Text, Layout, Icon, Datepicker, NativeDateService } from '@ui-kitten/components'
import { decodeDate } from '../commonStructures/DateFuncions'
import * as Sentry from '@sentry/react-native'
/**
 * Converts a custom date format to a format compatible with date-fns.
 *
 * @param {string} format - The custom date format string.
 * @returns {string} The converted format compatible with date-fns.
 */
const manageDateFormat = (format) => {
  const mapping = {
    'dd': 'DD',  // Day in two digits
    'mm': 'MM',  // Month in two digits (uppercase for month)
    'aaaa': 'YYYY',  // Year in four digits
  }

  return format
    .replace(/dd/, mapping['dd'])
    .replace(/mm/, mapping['mm'])
    .replace(/aaaa/, mapping['aaaa'])
}

/**
 * Represents optional features for the DateSelector component.
 *
 * @param {Object} options - Options for configuring the DateSelector.
 * @param {string} [options.title] - The title displayed above the date picker.
 * @param {string} [options.defaultOption] - Default date value can be 'hoy' for today's date.
 * @param {string} [options.dateFormat] - The format of the date displayed.
 * @param {boolean} [options.disabled=false] - Whether the date picker is disabled.
 * @param {boolean} [options.required=false] - Whether the field is required.
 * @returns {Object} An object containing the defined optional features.
 */
export const OptionDateFeatures = (options = {}) => {
  return {
    title: options.title ?? "",
    dateFormat: manageDateFormat(options.dateFormat ?? 'DD/MM/YYYY'),
    defaultDate: options.defaultDate === "hoy" ? new Date() : decodeDate(options.defaultDate, options.dateFormat ?? 'DD/MM/YYYY'),
    disabled: options.disabled ?? false,
    required: options.required ?? false,
  }
}

/**
 * A component that allows users to select a date.
 *
 * @param {Function} onChange - Callback function called when the selected date changes.
 * @param {Object} optionalFeatures - Configuration options for the DateSelector.
 * @returns {JSX.Element} The rendered DateSelector component.
 */
const DateSelector = ({ value, onChange, optionalFeatures, requiredFieldRef, refreshFieldRef }) => {
  const hasInitialized = useRef(false)
  const {
    title = "",
    defaultDate = new Date(),
    dateFormat = 'DD/MM/YYYY',
    required = false,
    disabled = false
  } = optionalFeatures ?? {}

  const [selectedDate, setSelectedDate] = useState(null)
  const [isRequiredAlert, setIsRequiredAlert] = useState(null)
  const configuredDateService = new NativeDateService('en', {
    startDayOfWeek: 1,
    format: dateFormat
  })
  useEffect(() => {
    if (defaultDate && !hasInitialized.current) {
      setSelectedDate(defaultDate)
      Sentry.captureMessage('defaultDate:', defaultDate, 'dateFormat:', dateFormat)
      const formattedDate = configuredDateService.format(defaultDate, dateFormat)
      onChange(formattedDate)
      setIsRequiredAlert(false)
      hasInitialized.current = true
    }
  }, [onChange, defaultDate])

  /**
   * Handles changes to the selected date.
   *
   * @param {Date} nextDate - The newly selected date.
   */
  const handleDateChange = (nextDate) => {
    setSelectedDate(nextDate)
    const formattedDate = configuredDateService.format(nextDate, dateFormat)
    onChange(formattedDate)
    setIsRequiredAlert(false)
  }

  requiredFieldRef.current = () => {
    if (required && !selectedDate) {
      setIsRequiredAlert(true)
    } else {
      setIsRequiredAlert(false)
    }
  }
  refreshFieldRef.current = () => {
    setSelectedDate(defaultDate)
    onChange(configuredDateService.format(defaultDate, dateFormat))
  }


  return (
    <Layout style={styles.containerBox}>
      {title && (
        <View style={styles.text}>
          <Text style={styles.text} category={"p2"}>
            {title}
          </Text>
          {/*
          <Text status='danger'> 
            {required ? "*": " "} 
          </Text>
          */}
        </View>
      )}
      <Datepicker
        date={selectedDate}
        dateService={configuredDateService}
        onSelect={handleDateChange}
        disabled={disabled}
        status={disabled ? 'basic' : 'success'}
        min={new Date(1900, 0, 1)}
        max={new Date(2100, 0, 1)}
        style={disabled ? styles.disabledDate : styles.datepicker}
      />
      {isRequiredAlert ?
        <Layout size='small' style={styles.alert}>
          <Icon status='danger' fill='#FF0000' name='alert-circle' style={styles.icon} />
          <Text style={styles.alert} category="p2">
            Por favor seleccione una fecha
          </Text>
        </Layout>
        :
        <></>
      }
    </Layout>
  )
}

const styles = StyleSheet.create({
  text: {
    fontSize: 17,
    marginHorizontal: '1%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'left',
  },
  alert: {
    flex: 1,
    margin: 1,
    marginHorizontal: '1%',
    color: '#ff0000',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'left',
  },
  icon: {
    width: 20,
    height: 20,
  },
  titles: {
    fontWeight: 'bold',
    marginBottom: 10,
    margin: 2,
  },
  containerBox: {
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#ffffff', // Color fondo suave
    borderWidth: 1,
    borderColor: '#00b7ae',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: Platform.OS == "ios" ? 1 : 10 },
    shadowOpacity: Platform.OS == "ios" ? 0.2 : 0.9,
    shadowRadius: Platform.OS == "ios" ? 2 : 2,
    elevation: 3,
    alignItems: 'flex-start'
  },
  datepicker: {
    width: '100%'
  },
  disabledDate:
  {
    width: '100%',
    color: '#d3d3d3', // Color gris claro
    textDecorationLine: 'line-through', // Línea tachada
  },
})
export default DateSelector
