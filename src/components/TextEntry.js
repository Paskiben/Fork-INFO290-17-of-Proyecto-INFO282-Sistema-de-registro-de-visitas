import React, { useState, useEffect, use } from 'react'
import { View, StyleSheet, Platform, TouchableOpacity, Modal, SafeAreaView, StatusBar, Alert, Image } from 'react-native'
import { Text, Input, Button, Layout, Icon } from '@ui-kitten/components'
import { Err, Ok } from '../commonStructures/resultEnum'
import { useCameraPermissions } from 'expo-camera'
import { CameraView } from "expo-camera"
import { getDatabaseInstance } from '../database/database'
import { useSQLiteContext } from 'expo-sqlite'
import * as Sentry from '@sentry/react-native'

/**
 * Represents optional features for the TextEntry component.
 * 
 * @param {Object} options - Options for configuring the TextEntry component.
 * @param {string} [options.title] - The title displayed above the input field.
 * @param {boolean} [options.required=false] - Indicates if the field is required.
 * @param {Array<string>} [options.limitations=[]] - An array of limitations for the input value.
 *        Example: ["solo letras"] to restrict input to letters only.
 * @param {string} [options.variableName] - "Salida", used to diferentiate different fields with same title
 * @param {Array<string>} [options.format=[]] - An array of conditions to format the input value.
 * @param {boolean} [options.QRfield = false] - Indicates if the field can be filled by QR
* @param {boolean} [options.disabled = false] - Indicates if the field is disabled
*  @returns {Object} An object containing the defined optional features.
 */
export const OptionalTextFeatures = (options = {}) => {
  return {
    title: options.title ?? "",
    required: options.required ?? false,
    limitations: options.limitations ?? [],
    format: options.format ?? [],
    QRfield: options.QRfield ?? false,
    variableName: options.variableName ?? "",
    disabled: options.disabled ?? false
  }
}

/**
 * Map that defines transformation functions as formatting for the fields
 */
const formatMap = new Map([
  ["solo mayusculas", input => input.toUpperCase()],
  ["solo minusculas", input => input.toLowerCase()]
])


/**
 * A component for text entry that allows users to input text with optional validation.
 *
 * @param {Object} props - Props for the TextEntry component.
 * @param {Object} props.optionalFeatures - Configuration options for the TextEntry.
 * @param {Function} props.onSelect - Callback function called when the input value changes.
 * @returns {JSX.Element} The rendered TextEntry component.
 */
const TextEntry = ({ optionalFeatures, onSelect, requiredFieldRef, refreshFieldRef }) => {
  const db = getDatabaseInstance(useSQLiteContext())
  const { title, required, limitations, format, QRfield, disabled } = optionalFeatures
  const [inputValue, setInputValue] = useState('')
  const [invalidLimitations, setInvalidLimitations] = useState([])
  const [isRequiredAlert, setIsRequiredAlert] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()
  const [isScanning, setIsScanning] = useState(false)


  const limitationBehaviour = limitations.reduce((acc, limName) => {
    // Usamos una expresión regular para separar el patrón de los modificadores
    const match = db.getRegexFromLimitation(limName).match(/^\/(.*)\/([a-z]*)$/)
    const pattern = match[1]     // El patrón de la expresión regular
    const modifiers = match[2]   // Los modificadores (g, i, m, etc.)

    // Creamos el objeto RegExp
    const regex = new RegExp(pattern, modifiers)
    return (acc.set(limName, regex))
  }, new Map())


  const isPermissionGranted = Boolean(permission?.granted)
  useEffect(() => {
    if (inputValue === '') onSelect(null)
  })
  useEffect(() => {
    if (QRfield && !isPermissionGranted) {
      requestPermission()
    }
  }, [QRfield, isPermissionGranted])


  /**
   * Handles changes to the input field and validates the input against specified limitations.
   *
   * @param {string} text - The new input value.
   */

  const handleChange = text => {

    // Limitations
    setInvalidLimitations(!text.length ? [] : limitations.reduce(
      (acc, limName) => {
        const limitationOk = limitationBehaviour.get(limName).test(text)

        if (!limitationOk) {
          const limitationName = String.fromCharCode(limName.charCodeAt(0) - 32) + limName.substr(1)
          acc.push(limitationName)
          text = text.slice(0, -1)
        }
        return acc
      }, []))

    //Sentry.captureMessage(invalidLimitations)

    if (invalidLimitations.length) {
      setInputValue(text)
      setIsRequiredAlert(false)
      if (onSelect) onSelect('')
      return new Err("No cumple las limitaciones")
    }
    // Formatting
    if (text.length > inputValue.length) {
      let lastChar = text.slice(-1)
      format.forEach(formattingOption => {
        lastChar = formatMap.get(formattingOption)(lastChar)
      })
      text = inputValue + lastChar
    }
    if (onSelect) onSelect(text)
    setInputValue(text)
    setIsRequiredAlert(false)
    return new Ok("Correct input")
  }


  // Cambiar el estilo
  requiredFieldRef.current = () => {
    if (required && !inputValue) {
      setIsRequiredAlert(true)
    } else {
      setIsRequiredAlert(false)
    }
  }
  refreshFieldRef.current = () => {
    setInputValue('')
  }

  const handleBarCodeScanned = ({ data }) => {
    handleChange(data)
    setIsScanning(false)
    Alert.alert("Se ha escaneado exitosamente")
  }

  return (
    <Layout style={styles.containerBox}>
      {title && (
        <View style={styles.text}>
          <Text style={[styles.text, {fontWeight: 'bold'}]}>
            {title}
          </Text>
          <Text status='danger'>
            {required ? "*" : " "}
          </Text>
        </View>
      )}
      {invalidLimitations.length ? invalidLimitations.map((name, i) => <Text key={i} style={{ color: 'red' }}> -{name} </Text>) : <></>}

      <Input
        style={[styles.input, isRequiredAlert && { borderColor: '#ff0000' }, QRfield && { flex: 0.75 },]}
        value={inputValue}
        disabled={disabled}
        onChangeText={handleChange}
        keyboardType={limitations.length ? db.getKeyboardFromLimitation(limitations.at(0)) : "default"} />
      {QRfield && (
        <TouchableOpacity style={styles.qrButton} onPress={() => setIsScanning(true)}>
          <Image source={require('../assets/qr-code.png')} style={{ width: 40, height: 40 }} />
        </TouchableOpacity>
      )}
      {isRequiredAlert ?
        <Layout style={styles.alert}>
          <Icon status='danger' fill='#FF0000' name='alert-circle' style={styles.icon} />
          <Text style={styles.alert} category="p2">
            Por favor rellene este campo
          </Text>
        </Layout>
        :
        <></>
      }
      {isScanning && (
        <Modal visible={isScanning} animationType="slide">
          <SafeAreaView style={styles.cameraContainer}>
            {Platform.OS === "android" ? <StatusBar hidden /> : null}
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['qr']
              }}
              onBarcodeScanned={handleBarCodeScanned}
            />
            <Button title="Cerrar Escáner" onPress={() => setIsScanning(false)} style={styles.closeButton}>
              <Text category='h5' style={styles.buttonText}>Cerrar Cámara</Text>
            </Button>
          </SafeAreaView>
        </Modal>
      )}
    </Layout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#ffffff',
    flexWrap: 'wrap',
    justifyContent: 'left',
  },
  label: {
    fontSize: 12,
    color: '#333',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  text: {
    fontSize: 17,
    marginLeft: 3,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'left'
  },
  alert: {
    flex: 1,
    margin: 1,
    marginHorizontal: '3%',
    color: '#ff0000',
    top: -10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'left',
  },
  icon: {
    width: 20,
    height: 20,
  },
  input: {
    flex: 1,
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
    backgroundColor: 'transparent',
    borderRadius: 5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    fontSize: 15,
    alignSelf: 'flex-start',
    marginBottom: 10,
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
  qrButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    marginRight: 10,
    marginTop: 30,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    position: 'absolute',   // Posiciona el botón de forma absoluta
    bottom: 20,             // A 20 píxeles del borde inferior
    left: 20,               // Alineación en el borde izquierdo con un margen
    right: 20,              // Alineación en el borde derecho con un margen
    backgroundColor: '#5a6bf7',  // Color de fondo opcional para el botón
    paddingVertical: 10,    // Relleno vertical para aumentar la altura del botón
    paddingHorizontal: 20,  // Relleno horizontal para hacer el botón más ancho
    borderRadius: 10,       // Bordes redondeados
    alignItems: 'center',   // Centrar el contenido del botón
  },
  buttonText: {
    color: 'black',
    fontWeight: "bold",

  },
})

export default TextEntry
