import React, { useState } from 'react'
import { Layout, Input, Button, Text, Modal, Card, Icon, Divider} from '@ui-kitten/components'
import * as SecureStore from 'expo-secure-store'
import { useIdentifierContext } from '../context/IdentifierContext'
import { StyleSheet, View } from 'react-native'
import { useSQLiteContext } from 'expo-sqlite'
import { getDatabaseInstance } from '../database/database'

export const IDInputComponent = () => {
  const db = getDatabaseInstance(useSQLiteContext())
  const [id, setId] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isIDChanged, setIsIDChanged] = useState(false)
  const { identifier, setIdentifier, originalIdentifier } = useIdentifierContext()

  const handleSave = async () => {
    try {
      await setIdentifier(id) // Guarda el nuevo ID como el último en SecureStore
      setIsIDChanged(true)
      setIsEditing(false)
    } catch (error) {
      Sentry.captureException("Error al guardar el ID en SecureStore:", error)
    }
  }

  const handleEdit = () => {
    setId(identifier) // Carga el ID actual en el input para editar
    setIsEditing(true)
  }

  const handleRestore = async () => {
    try {
      await SecureStore.setItemAsync('last_deviceid', originalIdentifier) // Restaurar el identificador original
      setIdentifier(originalIdentifier)
      setIsIDChanged(true)
    } catch (error) {
      Sentry.captureException("Error al restaurar el ID original en SecureStore:", error)
    }
  }

  return (
    <>
      <Layout style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#efefef' }}>
        <Text category="h5" style={{textAlign:'center', marginBottom: 10}}>Modificar identificador de dispositivo</Text>
        {isEditing ? (
          <>
            <Input
              placeholder="Ingresa el ID"
              value={id}
              onChangeText={setId}
              style={{ marginVertical: 10, width: '100%' }}
            />
            <View style={styles.buttonContainer}>
              <Button onPress={() => {setId(identifier); setIsEditing(false)}} style={styles.button}
                accessoryLeft={<Icon name='close-outline' />} status='info'
              >
                Cancelar
              </Button>
              <Button onPress={handleSave} style={styles.button} accessoryLeft={<Icon name='checkmark-outline' />}>
                Guardar
              </Button>
            </View>
          </>
        ) : (
          <>
            <Text category="p1">ID : {identifier || "No hay un ID guardado."}</Text>
            <Button onPress={handleEdit} style={{ marginVertical: 10 }} accessoryLeft={<Icon name='edit-outline' />}>
              Editar identificador
            </Button>

            {identifier !== originalIdentifier && (
              <Button onPress={handleRestore} accessoryLeft={<Icon name='refresh-outline' />} status='warning'>
                Restaurar Identificador
              </Button>
            )}
          </>
        )}
      </Layout>
        {isIDChanged && (
          <Modal
            visible={isIDChanged}
            onBackdropPress={() => setIsIDChanged(false)}
            style={styles.changeIDWindowModal}
            animationType='slide'
            backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          >
          <Card disabled={true} style={{ borderRadius: 10 }}>
            <View style={styles.header}>
              <Text category='h5' style={{flex:1, textAlign: 'center'}}>Atención</Text>
            </View>
            <Divider/>
            <Text category='h6' style={{flex:1, textAlign:'center', padding:10, color:'gray'}}>
              ¿Desea cambiar el <Text category='h6' style={{color:'#007bff'}}>ID</Text> de las respuestas anteriores?
            </Text>
            <Layout style={styles.buttonContainer}>
              <Button style={{ flex: 1, marginRight: '10%' }} status='danger' onPress={() => setIsIDChanged(false)}
                accessoryLeft={props => <Icon name='close-outline' {...props} />}>
                No
              </Button>
              <Button style={{ flex: 1, marginLeft: '10%' }} status='info ' onPress={() => {
                  const newID = id || originalIdentifier
                  db.setIdToAnswers(newID)
                  setIsIDChanged(false)
                }}
                accessoryLeft={props => <Icon name='checkmark-outline' {...props} />}
                >
                Sí
              </Button>
            </Layout>
          </Card>
        </Modal>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  changeIDWindowModal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
})
export default IDInputComponent
