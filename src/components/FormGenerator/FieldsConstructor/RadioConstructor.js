import React, { useState } from 'react'
import { View, Text, StyleSheet,FlatList, TouchableOpacity } from 'react-native'
import { Input, Button, Icon, Layout, Divider, CheckBox} from '@ui-kitten/components'
import * as Sentry from '@sentry/react-native'

const RadioConstructor = ({ field, onSave }) => {
    const [options, setOptions] = useState(field.opciones || [])
    const [fieldName, setFieldName] = useState(field.nombre || '')
    const [isRequired, setIsRequired] = useState(field.obligatorio ?? true)   

    const [showOptions, setShowOptions] = useState(false)
    const [showOptionalFeatures, setShowOptionalFeatures] = useState(false)  
    const handleAddOption = () => {
        const lastOption = options[options.length - 1]
        const newOptionNumber = lastOption ? parseInt(lastOption.valor.replace('opcion', '')) + 1 : 1
        setOptions((prevOptions) => [
            ...prevOptions,
            { nombre: `Nueva opción ${newOptionNumber}`, valor: `opcion${newOptionNumber}` }
        ])
    }

    const removeOption = index => setOptions(options.filter((_, i) => i !== index))    

    const handleSave = () => {
        // Crear el objeto `field` con los datos
        const field = {
            tipo: 'radio',
            nombre: fieldName,
            salida : fieldName.toLowerCase().replace(/ /g, '_'),
            tipo: 'radio',
            opciones: options,
            obligatorio: isRequired,
        }

        if (onSave) {
            Sentry.captureMessage(field)
            onSave(field)
        }
    }
    React.useEffect(() => { handleSave() }, [options, fieldName, isRequired])
    

    return (
        <Layout style={styles.container}>
            <Text style={styles.title}>{fieldName || 'Nuevo campo selector'}</Text>

            <Divider />
            <View style={styles.field}>
                <Input
                    label={"Nombre del campo"}
                    style={styles.input}
                    placeholder="Nombre del campo Radio"
                    value={fieldName}
                    onChangeText={setFieldName}
                />
            </View>

            <Divider />

            <View style={styles.field}>
                    <TouchableOpacity style={styles.headerRow} onPress={() => setShowOptions(!showOptions)}>
                        <Text style={[styles.subtitle, options.length || {color: 'red'}]}>Opciones</Text>
                        <Button
                            appearance='ghost'
                            accessoryLeft={props => <Icon name={showOptions ? 'arrow-ios-upward-outline' : 'arrow-ios-downward-outline'} {...props} />}
                            onPress={() => setShowOptions(!showOptions)}
                            style={styles.toggleButton}
                        />
                    </TouchableOpacity>
                    {showOptions && (
                        <FlatList
                            data={options}
                            renderItem={({ item, index }) => (
                                <Layout key={index} style={styles.optionRow}>
                                    <Input
                                        value={item.nombre}
                                        onChangeText={text => {
                                            const updatedOptions = [...options]
                                            updatedOptions[index].nombre = text;
                                            setOptions(updatedOptions)
                                        }}
                                        style={styles.optionInput}
                                    />
                                    <Button
                                        size="small"
                                        status="danger"
                                        onPress={() => removeOption(index)}
                                    >
                                        Eliminar
                                    </Button>
                                </Layout>
                            )}
                            keyExtractor={(item, index) => item.valor}
                            scrollEnabled={false}
                            ListFooterComponent={() => (
                                <Button onPress={handleAddOption} style={styles.addButton} accessoryRight={<Icon name={'plus-outline'} />}>
                                    Agregar opción
                                </Button>
                            )}
                        />
                    )}
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
                        </View>
                    )}
                </View>
        </Layout>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: "1%",
        backgroundColor: '#ffffff',
    },
    addButton: {
        marginTop: 8,
        marginBottom: 8,
    },
    optionInput: {
        flex: 1,
        marginRight: 8,
    },
    title: {
        marginBottom: 16,
        fontWeight: 'bold',
        fontSize: 18,
    },
    subtitle: {
        fontSize: 16,
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
        marginBottom: "3%",

    },
    input: {
        borderWidth: 1,
        borderColor: '#cccccc',
        padding: 0,
        borderRadius: 4,
    },
    toggle: {
        marginLeft: 8,
    },
    addOptionContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 16,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    field: {
        marginTop: "4%",
        marginBottom: "4%",
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

export default RadioConstructor
