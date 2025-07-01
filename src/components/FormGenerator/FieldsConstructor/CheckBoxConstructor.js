import React, { useState } from 'react'
import { View, FlatList, TouchableOpacity, Platform, StyleSheet, Alert } from 'react-native'
import { Layout, Text, Input, Button, Icon, CheckBox, Divider, Select, SelectItem } from '@ui-kitten/components'
import * as Sentry from '@sentry/react-native'

const CheckBoxConstructor = ({ onSave, field = {} }) => {
    const [fieldName, setFieldName] = useState(field.nombre || '')
    const [options, setOptions] = useState(field.opciones || [])
    const [maxSelections, setMaxSelections] = useState(field['cantidad de elecciones'] || 1)
    const [isRequired, setIsRequired] = useState(field.isRequired ?? true)

    const [showOptions, setShowOptions] = useState(false)
    const [showOptionalFeatures, setShowOptionalFeatures] = useState(false)    

    const [showMaxSelections, setShowMaxSelections] = useState(field['cantidad de elecciones'] ? true : false)
    

    const handleAddOption = () => {
        const lastOption = options[options.length - 1]
        const newOptionNumber = lastOption ? parseInt(lastOption.valor.replace('opcion', '')) + 1 : 1
        setOptions((prevOptions) => [
            ...prevOptions,
            { nombre: `Nueva opción ${newOptionNumber}`, valor: `opcion${newOptionNumber}` }
        ])
    }

    const removeOption = index => {
        setOptions(options.filter((_, i) => i !== index))
        setMaxSelections(null)
    }

    const handleSave = () => {
       

        const field = {
            tipo: 'checkbox',
            nombre: fieldName,
            opciones: options,
            salida: fieldName.toLowerCase().replace(/ /g, '_'),
            "cantidad de elecciones": maxSelections,
            obligatorio: isRequired,
        }

        if (onSave) {
            Sentry.captureMessage(field)
            onSave(field)
        }
    }
    React.useEffect(() => { handleSave() }, [options, fieldName, isRequired, maxSelections])
    

    return (
        <Layout category='h5' style={styles.container}>
            <Text style={styles.title}>{fieldName || 'Nuevo campo selector'}</Text>
            
            <Divider/>
            {/* Nombre del Campo */}
            <View style={styles.field}>
                <Input
                    label={"Nombre del Campo"}
                    style={styles.input}
                    placeholder="Nombre del campo Checkbox"
                    value={fieldName}
                    onChangeText={setFieldName}
                />
            </View>

            <Divider/>

            {/* Opciones */}
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

            <Divider/>



            <Divider/>

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
                                    <CheckBox disabled={options.length<=1} style={{ margin: '2%', alignSelf: 'flex-start', marginTop: '4%' }} checked={options.length && showMaxSelections} onChange={v => setShowMaxSelections(v)}>
                                        <Text>Máxima cantidad de elecciones</Text>
                                    </CheckBox>
                                        {showMaxSelections && options.length>1&& 
                                            <Select style={{paddingLeft: '10%', flex:1}} placeholder='Seleccione una opcion...' value={maxSelections !== null ? maxSelections.toString() : ''} onSelect={index => {
                                                const selectedOption = index.row
                                                Sentry.captureMessage(selectedOption)
                                                if (selectedOption !== maxSelections) setMaxSelections(selectedOption)
                                            }}>
                                                {options.map((option, i) =>  i != 0 ? <SelectItem key={i} title={i.toString()} value={i} /> : <></>)}
                                            </Select>
                                        }
                                    
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

export default CheckBoxConstructor
