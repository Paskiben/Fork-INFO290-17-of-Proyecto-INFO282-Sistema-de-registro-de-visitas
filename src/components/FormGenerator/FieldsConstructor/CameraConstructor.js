import React, { useState } from 'react'
import * as Sentry from '@sentry/react-native'
import {
    View,
    StyleSheet,
    TouchableOpacity
} from 'react-native'

import { Text, Input, Button, Icon, Divider, CheckBox, Select, SelectItem, IndexPath } from '@ui-kitten/components'

const aspectRatios = [
    { text: '1 : 1', value: [1, 1] },
    { text: '3 : 2', value: [3, 2] },
    { text: '4 : 3', value: [4, 3] },
    { text: '16 : 9', value: [16, 9] },
    { text: '16 : 10', value: [16, 10] },
]

const CameraConstructor = ({ onSave, field = {} }) => {
    const [fieldName, setFieldName] = useState(field.nombre || '')
    const [isRequired, setIsRequired] = useState(field.isRequired ?? true) // Por defecto, true
    const [aspectRelation, setAspectRelation] = useState([1, 1])

    const [showOptionalFeatures, setShowOptionalFeatures] = useState(false)
    const [showAspectRelation, setShowAspectRelation] = useState(false)
    const [selectedAspectRelationIndex, setSelectedAspectRelationIndex] = useState(new IndexPath(0))

    const handleSave = () => {

        const field = {
            tipo: 'camara',
            nombre: fieldName,
            salida: fieldName.toLowerCase().replace(/ /g, '_'),
            editable: true,
            obligatorio: isRequired, // Agregar valor al objeto field
            "relacion de aspecto": (showAspectRelation && aspectRelation) || [1, 1],
        }

        if (onSave) {
            Sentry.captureMessage(field)
            onSave(field)
        }
    }

    const handleSelectAspectChange = index => {
        setSelectedAspectRelationIndex(index)
        setAspectRelation(aspectRatios[index.row].value)
    }

    React.useEffect(() => { handleSave() }, [fieldName, isRequired, aspectRelation])
    
    return (
        <View style={styles.container}>
            <Text category='h5' style={styles.title}>Configurar Campo de Cámara</Text>

            <Divider />

            {/* Nombre del Campo */}
            <View style={styles.field}>
                <Input
                    label={"Nombre del Campo"}
                    value={fieldName}
                    onChangeText={setFieldName}
                    placeholder="Nombre del campo"
                    style={styles.input}
                />
            </View>

            <Divider />

            {/* Obligatorio */}
            <View style={styles.field}>
                <TouchableOpacity style={styles.headerRow} onPress={() => setShowOptionalFeatures(!showOptionalFeatures)}>
                    <Text style={styles.subtitle}>Características opcionales</Text>
                    <Button
                    appearance='ghost'
                    accessoryLeft={props => <Icon name={showOptionalFeatures ? 'arrow-ios-upward-outline' : 'arrow-ios-downward-outline'} {...props} />}
                    onPress={() => setShowOptionalFeatures(!showOptionalFeatures)}
                    style={styles.toggleButton}
                    />
                </TouchableOpacity>
                {showOptionalFeatures && (
                    <View style={styles.submenu}>
                    <CheckBox style={{ margin: '2%', alignSelf: 'flex-start', marginTop: '4%' }} checked={isRequired} onChange={setIsRequired}>
                        Obligatorio
                    </CheckBox>
                    <CheckBox style={{ margin: '2%', alignSelf: 'flex-start', marginTop: '4%' }} checked={showAspectRelation} onChange={setShowAspectRelation}>
                        Relación de aspecto
                    </CheckBox>
                    {showAspectRelation && (
                        <Select
                        selectedIndex={selectedAspectRelationIndex}
                        onSelect={handleSelectAspectChange}
                        value={aspectRatios[selectedAspectRelationIndex.row].text}
                        style={{ paddingLeft: '10%', flex: 1 }}
                        placeholder='Seleccione una opción...'
                        >
                        {aspectRatios.map((ratio, index) => (
                            <SelectItem key={index} title={ratio.text} />
                        ))}
                        </Select>
                    )}
                    </View>
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
        marginBottom: 16,
        fontWeight: 'bold',
        fontSize: 18,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#cccccc',
        padding: 0,
        borderRadius: 4,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 8,
    },
    field: {
        marginTop: "4%",
        marginBottom: "4%",
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    optionInput: {
        flex: 1,
        marginRight: 8,
    },
    addButton: {
        marginTop: 8,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    toggle: {
        marginLeft: 8,
    },
    saveButton: {
        marginTop: 16,
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

export default CameraConstructor
