import React, { useState } from 'react'
import { View, Alert, StyleSheet, TouchableOpacity } from 'react-native'
import { Text, Input, Button, Layout, Divider, CheckBox, Radio, Icon, RadioGroup } from '@ui-kitten/components'
import { TimerPickerModal } from 'react-native-timer-picker'
import * as Haptics from 'expo-haptics'
import { LinearGradient } from 'expo-linear-gradient'
import * as Sentry from '@sentry/react-native'

const HourConstructor = ({ field = {}, onSave }) => {
    // Obtener hora actual en formato hh:mm
    const getCurrentTime = () => {
        const now = new Date()
        return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    }

    // Estados
    const [fieldName, setFieldName] = useState(typeof field.nombre === 'string' ? field.nombre : '')
    const [defaultHour, setDefaultHour] = useState(field.hora_predeterminada || 'actual')
    const [isNotEditable, setIsNotEditable] = useState(field.isEditable || false)
    const [showPicker, setShowPicker] = useState(false)

    const [showDefaultHour, setShowDefaultHour] = useState(false)
    const [selectedDefaultHourIndex, setSelectedDefaultHourIndex] = useState(0)
    const [showOptionalFeatures, setShowOptionalFeatures] = useState(false)

    const formatTime = ({ hours, minutes }) =>
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

    const handleSave = () => {

        const field = {
            tipo: 'hora',
            nombre: fieldName,
            'hora predeterminada': defaultHour,
            salida: fieldName.toLowerCase(),
            limitaciones: [isNotEditable ? 'no editable' : 'editable']
        }

        if (onSave) {
            Sentry.captureMessage(field)
            onSave(field)
        }
    }

    const handleRadioSelectionChange = index => {
        Sentry.captureMessage('index:', index)
        setSelectedDefaultHourIndex(index)
        setDefaultHour(index === 0 ? 'actual' : (() => {
            const date = new Date()
            return formatTime({ hours: date.getHours(), minutes: date.getMinutes()})
        })())
    }

    React.useEffect(() => { handleSave() }, [fieldName, defaultHour, isNotEditable])

    return (
        <View style={styles.container}>
            <Text category='h5' style={styles.title}>{fieldName || 'Nuevo campo de Hora'}</Text>

            <Divider />

            {/* Nombre del Campo */}
            <View style={styles.field}>
                <Input
                    label={"Nombre del Campo"}
                    value={fieldName}
                    onChangeText={nextName => setFieldName(nextName)}
                    placeholder="Nombre del campo Hora"
                    style={styles.input}
                />
            </View>

            <Divider />

            {/* Hora Predeterminada */}
            <View style={styles.field}>
                <TouchableOpacity style={styles.headerRow} onPress={() => setShowDefaultHour(!showDefaultHour)}>
                    <Text style={styles.subtitle}>Hora predeterminada</Text>
                    <Button
                        appearance='ghost'
                        accessoryLeft={props => <Icon name='arrow-ios-downward-outline' {...props} />}
                        onPress={() => setShowDefaultHour(!showDefaultHour)}
                        style={styles.toggleButton}
                    />
                </TouchableOpacity>
                
                {showDefaultHour && (
                        <Layout style={styles.submenu}>
                            <RadioGroup
                                selectedIndex={selectedDefaultHourIndex}
                                onChange={handleRadioSelectionChange}
                            >
                            
                                <Radio value={0} style={{ padding: 10 }}>
                                    La hora al momento de responder
                                </Radio>
                                <Radio value={1} style={{ padding: 10 }}>
                                    Hora Personalizada
                                </Radio>
                                
                            </RadioGroup>
                        
                        
                        {selectedDefaultHourIndex === 1 && (
                            <>
                                <Button
                                    status="success"
                                    onPress={() => setShowPicker(true)}
                                    appearance="outline"
                                    size="large"
                                    style={{marginLeft: 40}}
                                    accessoryRight={<Icon name='clock-outline'></Icon>}
                                >
                                    {defaultHour}
                                </Button>
                            

                                <TimerPickerModal
                                    visible={showPicker}
                                    setIsVisible={setShowPicker}
                                    onConfirm={(pickedDuration) => {
                                        setDefaultHour(formatTime(pickedDuration))
                                        setShowPicker(false)
                                    }}
                                    modalTitle="Selecciona una hora"
                                    onCancel={() => setShowPicker(false)}
                                    closeOnOverlayPress
                                    LinearGradient={LinearGradient}
                                    Haptics={Haptics}
                                    styles={{
                                        theme: 'light'
                                    }}
                                    modalProps={{
                                        overlayOpacity: 0.2
                                    }}
                                    hideSeconds={true}
                                    agressivelyGetLatestDuretion={true}
                                />
                            </>
                            
                        )}
                        </Layout>
                )}
                
            </View>

            <Divider />


            <View style={styles.field}>
                <TouchableOpacity style={styles.headerRow} onPress={() => setShowOptionalFeatures(!showOptionalFeatures)}>
                    <Text style={styles.subtitle}>Características opcionales</Text>
                    <Button
                        appearance='ghost'
                        accessoryLeft={props => <Icon name='arrow-ios-downward-outline' {...props} />}
                        onPress={() => setShowOptionalFeatures(!showOptionalFeatures)}
                        style={styles.toggleButton}
                    />
                </TouchableOpacity>
                
                {showOptionalFeatures && (
                    <Layout style={[styles.submenu, {padding:5}]} onPress={() => setIsNotEditable(!isNotEditable)}>
                        <CheckBox
                            style={{ margin: '2%', alignSelf: 'flex-start', marginTop: '4%' }}
                            checked={isNotEditable}
                            onChange={setIsNotEditable}
                        >
                            No editable
                        </CheckBox>
                    </Layout>
                )}
            </View>
                
        </View>
    )
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: "1%",
        backgroundColor: '#ffffff',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    field: {
        marginTop: "4%",
        marginBottom: "4%",
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#cccccc',
        borderRadius: 4,
        padding: 0,
        fontSize: 16,
    },
    saveButtonContainer: {
        marginTop: 20,
        alignSelf: 'center',
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Para que el botón esté a la derecha
        borderRadius: 4, // Bordes redondeados
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: 'bold',
        padding: 8,
    },
    submenu: {
        marginLeft: "4%", // Mover los elementos levemente a la derecha
        marginBottom: "4%", // Mover los elementos levemente hacia abajo
        borderLeftWidth: 4, // Solo el borde izquierdo
        borderLeftColor: '#cccccc', // Color del borde izquierdo
    },
})

export default HourConstructor
